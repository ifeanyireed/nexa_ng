package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/models"
)

type BlogHandler struct {
	db *gorm.DB
}

func NewBlogHandler(db *gorm.DB) *BlogHandler {
	return &BlogHandler{db: db}
}

func slugify(text string) string {
	slug := strings.ToLower(strings.TrimSpace(text))
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "post-" + uuid.New().String()[:8]
	}
	return slug
}

// -----------------------------------------------------------------------------
// POSTS
// -----------------------------------------------------------------------------

type PostResponse struct {
	models.BlogPost
	CategoryName string `json:"category"`
	Author       any    `json:"author"`
}

func (h *BlogHandler) ListPosts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		json.NewEncoder(w).Encode([]models.BlogPost{})
		return
	}

	var posts []models.BlogPost
	query := h.db.Model(&models.BlogPost{}).Preload("Category").Preload("Comments", "status = ?", "APPROVED").Order("created_at DESC")

	status := r.URL.Query().Get("status")
	if status != "" {
		query = query.Where("status = ?", strings.ToUpper(status))
	}

	categoryID := r.URL.Query().Get("category_id")
	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	if err := query.Find(&posts).Error; err != nil {
		http.Error(w, `{"error": "Failed to fetch blog posts"}`, http.StatusInternalServerError)
		return
	}

	responses := make([]PostResponse, 0, len(posts))
	for _, p := range posts {
		catName := ""
		if p.Category != nil {
			catName = p.Category.Name
		}
		authorObj := map[string]string{
			"full_name": p.AuthorName,
		}
		responses = append(responses, PostResponse{
			BlogPost:     p,
			CategoryName: catName,
			Author:       authorObj,
		})
	}

	json.NewEncoder(w).Encode(responses)
}

func (h *BlogHandler) GetPost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	idOrSlug := chi.URLParam(r, "id")
	if idOrSlug == "" {
		idOrSlug = r.URL.Query().Get("slug")
	}

	var post models.BlogPost
	if err := h.db.Preload("Category").Preload("Comments", "status = ?", "APPROVED").
		Where("id = ? OR slug = ?", idOrSlug, idOrSlug).First(&post).Error; err != nil {
		http.Error(w, `{"error": "Post not found"}`, http.StatusNotFound)
		return
	}

	catName := ""
	if post.Category != nil {
		catName = post.Category.Name
	}
	resp := PostResponse{
		BlogPost:     post,
		CategoryName: catName,
		Author: map[string]string{
			"full_name": post.AuthorName,
		},
	}
	json.NewEncoder(w).Encode(resp)
}

func (h *BlogHandler) CreateOrUpdatePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		ID         string  `json:"id"`
		Title      string  `json:"title"`
		Slug       string  `json:"slug"`
		Excerpt    string  `json:"excerpt"`
		Content    string  `json:"content"`
		CoverImage string  `json:"cover_image"`
		CategoryID *string `json:"category_id"`
		Tags       string  `json:"tags"`
		Status     string  `json:"status"`
		AuthorID   *string `json:"author_id"`
		AuthorName string  `json:"author_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if payload.Title == "" {
		http.Error(w, `{"error": "Title is required"}`, http.StatusBadRequest)
		return
	}

	targetID := payload.ID
	if pathID := chi.URLParam(r, "id"); pathID != "" {
		targetID = pathID
	}

	status := strings.ToUpper(payload.Status)
	if status == "" {
		status = "DRAFT"
	}

	authorName := payload.AuthorName
	if authorName == "" {
		authorName = "Ofia Editorial Team"
	}

	now := time.Now()
	var publishedAt *time.Time
	if status == "PUBLISHED" {
		publishedAt = &now
	}

	slug := payload.Slug
	if slug == "" {
		slug = slugify(payload.Title)
	}

	var post models.BlogPost
	if targetID != "" {
		// Update existing
		res := h.db.First(&post, "id = ?", targetID)
		if res.Error == nil {
			post.Title = payload.Title
			post.Excerpt = payload.Excerpt
			post.Content = payload.Content
			if payload.CoverImage != "" {
				post.CoverImage = payload.CoverImage
			}
			post.CategoryID = payload.CategoryID
			post.Tags = payload.Tags
			post.Status = status
			if post.PublishedAt == nil && status == "PUBLISHED" {
				post.PublishedAt = publishedAt
			}
			if payload.AuthorID != nil {
				post.AuthorID = payload.AuthorID
			}
			post.AuthorName = authorName
			post.UpdatedAt = now

			if err := h.db.Save(&post).Error; err != nil {
				http.Error(w, `{"error": "Failed to update post"}`, http.StatusInternalServerError)
				return
			}
			json.NewEncoder(w).Encode(post)
			return
		}
	}

	// Create new
	post = models.BlogPost{
		ID:          "post_" + uuid.New().String()[:12],
		Title:       payload.Title,
		Slug:        slug,
		Excerpt:     payload.Excerpt,
		Content:     payload.Content,
		CoverImage:  payload.CoverImage,
		CategoryID:  payload.CategoryID,
		Tags:        payload.Tags,
		Status:      status,
		AuthorID:    payload.AuthorID,
		AuthorName:  authorName,
		PublishedAt: publishedAt,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := h.db.Create(&post).Error; err != nil {
		// Try appending a short suffix if slug collision
		post.Slug = slug + "-" + uuid.New().String()[:4]
		if err2 := h.db.Create(&post).Error; err2 != nil {
			http.Error(w, `{"error": "Failed to create post: `+err2.Error()+`"}`, http.StatusInternalServerError)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(post)
}

func (h *BlogHandler) DeletePost(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		id = r.URL.Query().Get("id")
	}
	if id == "" {
		http.Error(w, `{"error": "Post ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.BlogPost{}, "id = ?", id).Error; err != nil {
		http.Error(w, `{"error": "Failed to delete post"}`, http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"success": true, "message": "Post deleted"}`))
}

// -----------------------------------------------------------------------------
// CATEGORIES
// -----------------------------------------------------------------------------

func (h *BlogHandler) ListCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		json.NewEncoder(w).Encode([]models.BlogCategory{})
		return
	}

	var categories []models.BlogCategory
	h.db.Order("name ASC").Find(&categories)
	json.NewEncoder(w).Encode(categories)
}

func (h *BlogHandler) CreateCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Name == "" {
		http.Error(w, `{"error": "Category name required"}`, http.StatusBadRequest)
		return
	}

	cat := models.BlogCategory{
		ID:        "cat_" + uuid.New().String()[:10],
		Name:      payload.Name,
		Slug:      slugify(payload.Name),
		CreatedAt: time.Now(),
	}

	if err := h.db.Create(&cat).Error; err != nil {
		http.Error(w, `{"error": "Category already exists"}`, http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cat)
}

func (h *BlogHandler) DeleteCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")
	if id == "" {
		id = r.URL.Query().Get("id")
	}
	if id == "" {
		http.Error(w, `{"error": "Category ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.BlogCategory{}, "id = ?", id).Error; err != nil {
		http.Error(w, `{"error": "Failed to delete category"}`, http.StatusInternalServerError)
		return
	}
	w.Write([]byte(`{"success": true, "message": "Category deleted"}`))
}

// -----------------------------------------------------------------------------
// TAGS
// -----------------------------------------------------------------------------

func (h *BlogHandler) ListTags(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		json.NewEncoder(w).Encode([]models.BlogTag{})
		return
	}

	var tags []models.BlogTag
	h.db.Order("name ASC").Find(&tags)
	json.NewEncoder(w).Encode(tags)
}

func (h *BlogHandler) CreateTag(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Name == "" {
		http.Error(w, `{"error": "Tag name required"}`, http.StatusBadRequest)
		return
	}

	tag := models.BlogTag{
		ID:        "tag_" + uuid.New().String()[:10],
		Name:      payload.Name,
		Slug:      slugify(payload.Name),
		CreatedAt: time.Now(),
	}

	if err := h.db.Create(&tag).Error; err != nil {
		http.Error(w, `{"error": "Tag already exists"}`, http.StatusConflict)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(tag)
}

func (h *BlogHandler) DeleteTag(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")
	if id == "" {
		id = r.URL.Query().Get("id")
	}
	if id == "" {
		http.Error(w, `{"error": "Tag ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.BlogTag{}, "id = ?", id).Error; err != nil {
		http.Error(w, `{"error": "Failed to delete tag"}`, http.StatusInternalServerError)
		return
	}
	w.Write([]byte(`{"success": true, "message": "Tag deleted"}`))
}

// -----------------------------------------------------------------------------
// COMMENTS
// -----------------------------------------------------------------------------

func (h *BlogHandler) ListComments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		json.NewEncoder(w).Encode([]models.BlogComment{})
		return
	}

	var comments []models.BlogComment
	query := h.db.Model(&models.BlogComment{}).Order("created_at DESC")

	postID := r.URL.Query().Get("post_id")
	if postID != "" {
		query = query.Where("post_id = ?", postID)
	}

	query.Find(&comments)
	json.NewEncoder(w).Encode(comments)
}

func (h *BlogHandler) CreateComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		PostID   string  `json:"post_id"`
		Name     string  `json:"name"`
		Email    string  `json:"email"`
		Content  string  `json:"content"`
		ParentID *string `json:"parent_id"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.PostID == "" || payload.Content == "" {
		http.Error(w, `{"error": "Post ID and content are required"}`, http.StatusBadRequest)
		return
	}

	userName := strings.TrimSpace(payload.Name)
	if userName == "" {
		userName = "Guest"
	}

	comment := models.BlogComment{
		ID:        "comm_" + uuid.New().String()[:12],
		PostID:    payload.PostID,
		UserName:  userName,
		Email:     payload.Email,
		Content:   payload.Content,
		ParentID:  payload.ParentID,
		Status:    "APPROVED", // Auto-approved for fast engagement
		CreatedAt: time.Now(),
	}

	if err := h.db.Create(&comment).Error; err != nil {
		http.Error(w, `{"error": "Failed to submit comment"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(comment)
}

func (h *BlogHandler) UpdateCommentStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.ID == "" {
		http.Error(w, `{"error": "Comment ID and status are required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Model(&models.BlogComment{}).Where("id = ?", payload.ID).
		Update("status", strings.ToUpper(payload.Status)).Error; err != nil {
		http.Error(w, `{"error": "Failed to update comment status"}`, http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"success": true, "message": "Comment status updated"}`))
}

func (h *BlogHandler) DeleteComment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")
	if id == "" {
		id = r.URL.Query().Get("id")
	}
	if id == "" {
		http.Error(w, `{"error": "Comment ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.BlogComment{}, "id = ? OR parent_id = ?", id, id).Error; err != nil {
		http.Error(w, `{"error": "Failed to delete comment"}`, http.StatusInternalServerError)
		return
	}
	w.Write([]byte(`{"success": true, "message": "Comment deleted"}`))
}

// -----------------------------------------------------------------------------
// NEWSLETTER SUBSCRIBERS
// -----------------------------------------------------------------------------

func (h *BlogHandler) ListSubscribers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		json.NewEncoder(w).Encode([]models.BlogSubscriber{})
		return
	}

	var subs []models.BlogSubscriber
	h.db.Order("created_at DESC").Find(&subs)
	json.NewEncoder(w).Encode(subs)
}

func (h *BlogHandler) CreateSubscriber(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Email == "" {
		http.Error(w, `{"error": "Valid email address required"}`, http.StatusBadRequest)
		return
	}

	email := strings.ToLower(strings.TrimSpace(payload.Email))
	var existing models.BlogSubscriber
	if err := h.db.Where("email = ?", email).First(&existing).Error; err == nil {
		// Already subscribed
		json.NewEncoder(w).Encode(existing)
		return
	}

	sub := models.BlogSubscriber{
		ID:        "sub_" + uuid.New().String()[:12],
		Email:     email,
		Status:    "ACTIVE",
		CreatedAt: time.Now(),
	}

	if err := h.db.Create(&sub).Error; err != nil {
		http.Error(w, `{"error": "Failed to subscribe"}`, http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(sub)
}

func (h *BlogHandler) DeleteSubscriber(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")
	if id == "" {
		id = r.URL.Query().Get("id")
	}
	if id == "" {
		http.Error(w, `{"error": "Subscriber ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.BlogSubscriber{}, "id = ?", id).Error; err != nil {
		http.Error(w, `{"error": "Failed to remove subscriber"}`, http.StatusInternalServerError)
		return
	}
	w.Write([]byte(`{"success": true, "message": "Subscriber removed"}`))
}

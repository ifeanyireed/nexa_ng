package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/internal/utils"
	"nexa/backend/prisma/db"
	"regexp"
	"strings"
)

type UpdateProfileRequest struct {
	BusinessName   string  `json:"business_name"`
	Bio            string  `json:"bio"`
	HourlyRate     float64 `json:"hourly_rate"`
	Specialties    string  `json:"specialties"`
	Niche          string  `json:"niche"`
	SubService     string  `json:"sub_service"`
	SpecialtyLevel string  `json:"specialty_level"`
	City           string  `json:"city"`
	Area           string  `json:"area"`
	Phone          string  `json:"phone"`
	Whatsapp       string  `json:"whatsapp"`
	BusinessEmail  string  `json:"business_email"`
	NIN            string  `json:"nin"`
	Plan           string  `json:"plan"`
	AcceptsPOS     bool    `json:"accepts_pos"`
	HomeDelivery   bool    `json:"home_delivery"`
	Catalog        string  `json:"catalog"`
}

func UpdateProProfile(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Update user role to PRO
	_, err := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Role.Set("PRO"),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error updating user role", http.StatusInternalServerError)
		return
	}

	// Generate unique slug
	nameForSlug := req.BusinessName
	if nameForSlug == "" {
		user, err := internalDB.Client.User.FindUnique(
			db.User.ID.Equals(userID),
		).Exec(context.Background())
		if err == nil {
			if name, ok := user.Name(); ok && name != "" {
				nameForSlug = name
			}
		}
	}
	slugVal := slugify(nameForSlug)
	if slugVal == "" {
		slugVal = userID
	}

	profile, err := internalDB.Client.ProProfile.UpsertOne(
		db.ProProfile.UserID.Equals(userID),
	).Create(
		db.ProProfile.User.Link(db.User.ID.Equals(userID)),
		db.ProProfile.BusinessName.Set(req.BusinessName),
		db.ProProfile.Slug.Set(slugVal),
		db.ProProfile.Bio.Set(req.Bio),
		db.ProProfile.HourlyRate.Set(req.HourlyRate),
		db.ProProfile.Specialties.Set(req.Specialties),
		db.ProProfile.Niche.Set(req.Niche),
		db.ProProfile.SubService.Set(req.SubService),
		db.ProProfile.SpecialtyLevel.Set(req.SpecialtyLevel),
		db.ProProfile.City.Set(req.City),
		db.ProProfile.Area.Set(req.Area),
		db.ProProfile.Phone.Set(req.Phone),
		db.ProProfile.Whatsapp.Set(req.Whatsapp),
		db.ProProfile.BusinessEmail.Set(req.BusinessEmail),
		db.ProProfile.Nin.Set(req.NIN),
		db.ProProfile.Plan.Set(req.Plan),
		db.ProProfile.AcceptsPos.Set(req.AcceptsPOS),
		db.ProProfile.HomeDelivery.Set(req.HomeDelivery),
		db.ProProfile.Catalog.Set(req.Catalog),
	).Update(
		db.ProProfile.BusinessName.Set(req.BusinessName),
		db.ProProfile.Slug.Set(slugVal),
		db.ProProfile.Bio.Set(req.Bio),
		db.ProProfile.HourlyRate.Set(req.HourlyRate),
		db.ProProfile.Specialties.Set(req.Specialties),
		db.ProProfile.Niche.Set(req.Niche),
		db.ProProfile.SubService.Set(req.SubService),
		db.ProProfile.SpecialtyLevel.Set(req.SpecialtyLevel),
		db.ProProfile.City.Set(req.City),
		db.ProProfile.Area.Set(req.Area),
		db.ProProfile.Phone.Set(req.Phone),
		db.ProProfile.Whatsapp.Set(req.Whatsapp),
		db.ProProfile.BusinessEmail.Set(req.BusinessEmail),
		db.ProProfile.Nin.Set(req.NIN),
		db.ProProfile.Plan.Set(req.Plan),
		db.ProProfile.AcceptsPos.Set(req.AcceptsPOS),
		db.ProProfile.HomeDelivery.Set(req.HomeDelivery),
		db.ProProfile.Catalog.Set(req.Catalog),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error updating profile", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

type CreateServiceRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

func CreateService(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	profile, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	service, err := internalDB.Client.Service.CreateOne(
		db.Service.Name.Set(req.Name),
		db.Service.Price.Set(req.Price),
		db.Service.ProProfile.Link(db.ProProfile.ID.Equals(profile.ID)),
		db.Service.Description.Set(req.Description),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error creating service", http.StatusInternalServerError)
		return
	}

	_ = utils.CreateNotification(userID, "New Service Added", fmt.Sprintf("Your service '%s' has been listed successfully.", req.Name), "SYSTEM")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(service)
}

type CreateArticleRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	Image   string `json:"image,omitempty"`
}

func CreateArticle(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	profile, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	niche, ok := profile.Niche()
	if !ok {
		http.Error(w, "pro niche not set", http.StatusBadRequest)
		return
	}

	article, err := internalDB.Client.Article.CreateOne(
		db.Article.Title.Set(req.Title),
		db.Article.Content.Set(req.Content),
		db.Article.Niche.Set(niche),
		db.Article.ProProfile.Link(db.ProProfile.ID.Equals(profile.ID)),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error creating article", http.StatusInternalServerError)
		return
	}

	_ = utils.CreateNotification(userID, "Article Published", fmt.Sprintf("Your article '%s' has been published successfully.", req.Title), "SYSTEM")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(article)
}

func slugify(str string) string {
	str = strings.ToLower(str)
	reg, _ := regexp.Compile("[^a-z0-9]+")
	str = reg.ReplaceAllString(str, "-")
	str = strings.Trim(str, "-")
	return str
}

type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Image       string  `json:"image,omitempty"`
}

// CreateProduct publishes a product listing and triggers a dashboard notification
func CreateProduct(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	var req CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	profile, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Exec(ctx)

	if err != nil || profile == nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	// Create product in database. Required args: Name, Price, ProProfile
	product, err := internalDB.Client.Product.CreateOne(
		db.Product.Name.Set(req.Name),
		db.Product.Price.Set(req.Price),
		db.Product.ProProfile.Link(db.ProProfile.ID.Equals(profile.ID)),
		db.Product.Description.Set(req.Description),
		db.Product.Image.Set(req.Image),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error creating product: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Trigger system notification
	_ = utils.CreateNotification(userID, "New Product Added", fmt.Sprintf("Your product '%s' has been successfully added to NexaShop.", req.Name), "SYSTEM")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// GetProAvailability retrieves availability slots for the logged-in pro.
func GetProAvailability(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	profile, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Exec(ctx)

	if err != nil || profile == nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	availStr, ok := profile.Availability()
	w.Header().Set("Content-Type", "application/json")
	if !ok || availStr == "" {
		w.Write([]byte(`{}`))
		return
	}

	w.Write([]byte(availStr))
}

// UpdateProAvailability saves the weekly availability schedule.
func UpdateProAvailability(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	var reqBody map[string][]string
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		http.Error(w, "invalid JSON payload", http.StatusBadRequest)
		return
	}

	jsonBytes, err := json.Marshal(reqBody)
	if err != nil {
		http.Error(w, "error processing JSON", http.StatusInternalServerError)
		return
	}

	_, err = internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Update(
		db.ProProfile.Availability.Set(string(jsonBytes)),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "failed to save availability: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

type ProAnalytics struct {
	ProfileViews int `json:"profileViews"`
	NewLeads     int `json:"newLeads"`
}

// GetProAnalytics retrieves the analytics data for the dashboard.
func GetProAnalytics(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	profile, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Exec(ctx)

	if err != nil || profile == nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	views := 1240

	leads, err := internalDB.Client.Booking.FindMany(
		db.Booking.ProProfileID.Equals(profile.ID),
		db.Booking.Status.Equals("PENDING"),
	).Exec(ctx)

	newLeads := 0
	if err == nil {
		newLeads = len(leads)
	}

	analytics := ProAnalytics{
		ProfileViews: views,
		NewLeads:     newLeads,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}

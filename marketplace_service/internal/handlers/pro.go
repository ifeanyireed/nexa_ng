package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	internalDB "nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/middleware"
	"nexa/marketplace_service/internal/models"
	"nexa/marketplace_service/internal/utils"
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Update user role to PRO
	if err := internalDB.DB.Model(&models.User{}).Where("id = ?", userID).Update("role", "PRO").Error; err != nil {
		http.Error(w, "error updating user role", http.StatusInternalServerError)
		return
	}

	// Generate unique slug
	nameForSlug := req.BusinessName
	if nameForSlug == "" {
		var user models.User
		if err := internalDB.DB.Where("id = ?", userID).First(&user).Error; err == nil {
			nameForSlug = user.Name
		}
	}
	slugVal := slugify(nameForSlug)
	if slugVal == "" {
		slugVal = userID
	}

	var profile models.ProProfile
	err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error
	if err != nil {
		profile = models.ProProfile{
			UserID:         userID,
			BusinessName:   req.BusinessName,
			Slug:           slugVal,
			Bio:            req.Bio,
			HourlyRate:     req.HourlyRate,
			Specialties:    req.Specialties,
			Niche:          req.Niche,
			SubService:     req.SubService,
			SpecialtyLevel: req.SpecialtyLevel,
			City:           req.City,
			Area:           req.Area,
			Phone:          req.Phone,
			Whatsapp:       req.Whatsapp,
			BusinessEmail:  req.BusinessEmail,
			NIN:            req.NIN,
			Plan:           req.Plan,
			AcceptsPOS:     req.AcceptsPOS,
			HomeDelivery:   req.HomeDelivery,
			Catalog:        req.Catalog,
		}
		if err := internalDB.DB.Create(&profile).Error; err != nil {
			http.Error(w, "error creating profile: "+err.Error(), http.StatusInternalServerError)
			return
		}
	} else {
		profile.BusinessName = req.BusinessName
		profile.Slug = slugVal
		profile.Bio = req.Bio
		profile.HourlyRate = req.HourlyRate
		profile.Specialties = req.Specialties
		profile.Niche = req.Niche
		profile.SubService = req.SubService
		profile.SpecialtyLevel = req.SpecialtyLevel
		profile.City = req.City
		profile.Area = req.Area
		profile.Phone = req.Phone
		profile.Whatsapp = req.Whatsapp
		profile.BusinessEmail = req.BusinessEmail
		profile.NIN = req.NIN
		profile.Plan = req.Plan
		profile.AcceptsPOS = req.AcceptsPOS
		profile.HomeDelivery = req.HomeDelivery
		profile.Catalog = req.Catalog
		if err := internalDB.DB.Save(&profile).Error; err != nil {
			http.Error(w, "error updating profile: "+err.Error(), http.StatusInternalServerError)
			return
		}
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateServiceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var profile models.ProProfile
	if err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	service := models.Service{
		Name:         req.Name,
		Description:  req.Description,
		Price:        req.Price,
		ProProfileID: profile.ID,
	}

	if err := internalDB.DB.Create(&service).Error; err != nil {
		http.Error(w, "error creating service: "+err.Error(), http.StatusInternalServerError)
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateArticleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var profile models.ProProfile
	if err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	if profile.Niche == "" {
		http.Error(w, "pro niche not set", http.StatusBadRequest)
		return
	}

	article := models.Article{
		Title:        req.Title,
		Content:      req.Content,
		Image:        req.Image,
		Niche:        profile.Niche,
		ProProfileID: profile.ID,
	}

	if err := internalDB.DB.Create(&article).Error; err != nil {
		http.Error(w, "error creating article: "+err.Error(), http.StatusInternalServerError)
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var profile models.ProProfile
	if err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	product := models.Product{
		Name:         req.Name,
		Price:        req.Price,
		ProProfileID: profile.ID,
		Description:  req.Description,
		Image:        req.Image,
	}

	if err := internalDB.DB.Create(&product).Error; err != nil {
		http.Error(w, "error creating product: "+err.Error(), http.StatusInternalServerError)
		return
	}

	_ = utils.CreateNotification(userID, "New Product Added", fmt.Sprintf("Your product '%s' has been successfully added to NexaShop.", req.Name), "SYSTEM")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(product)
}

// GetProAvailability retrieves availability slots for the logged-in pro.
func GetProAvailability(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var profile models.ProProfile
	if err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if profile.Availability == "" {
		w.Write([]byte(`{}`))
		return
	}

	w.Write([]byte(profile.Availability))
}

// UpdateProAvailability saves the weekly availability schedule.
func UpdateProAvailability(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

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

	if err := internalDB.DB.Model(&models.ProProfile{}).
		Where("user_id = ?", userID).
		Update("availability", string(jsonBytes)).Error; err != nil {
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var profile models.ProProfile
	if err := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error; err != nil {
		http.Error(w, "pro profile not found", http.StatusNotFound)
		return
	}

	var count int64
	internalDB.DB.Model(&models.Booking{}).
		Where("pro_profile_id = ? AND status = ?", profile.ID, "PENDING").
		Count(&count)

	views := profile.ProfileViews
	if views == 0 {
		views = 120
	}

	analytics := ProAnalytics{
		ProfileViews: views,
		NewLeads:     int(count),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}

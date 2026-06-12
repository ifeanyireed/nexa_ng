package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/prisma/db"
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

	profile, err := internalDB.Client.ProProfile.UpsertOne(
		db.ProProfile.UserID.Equals(userID),
	).Create(
		db.ProProfile.User.Link(db.User.ID.Equals(userID)),
		db.ProProfile.BusinessName.Set(req.BusinessName),
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
	).Update(
		db.ProProfile.BusinessName.Set(req.BusinessName),
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(article)
}

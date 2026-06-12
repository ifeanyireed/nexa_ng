package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/prisma/db"
	"time"

	"github.com/go-chi/chi/v5"
)

type CreateBookingRequest struct {
	ProProfileID string    `json:"pro_profile_id"`
	ScheduledAt  time.Time `json:"scheduled_at"`
	ServiceName  string    `json:"service_name"`
	Amount       float64   `json:"amount"`
	Type         string    `json:"type"`
}

func CreateBooking(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Type == "" {
		req.Type = "STANDARD"
	}

	booking, err := internalDB.Client.Booking.CreateOne(
		db.Booking.Client.Link(db.User.ID.Equals(userID)),
		db.Booking.ProProfile.Link(db.ProProfile.ID.Equals(req.ProProfileID)),
		db.Booking.ScheduledAt.Set(req.ScheduledAt),
		db.Booking.ServiceName.Set(req.ServiceName),
		db.Booking.Amount.Set(req.Amount),
		db.Booking.Type.Set(req.Type),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error creating booking", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func ListMyBookings(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	role := r.Context().Value(middleware.RoleKey).(string)

	var bookings []db.BookingModel
	var err error

	if role == "PRO" {
		profile, _ := internalDB.Client.ProProfile.FindUnique(
			db.ProProfile.UserID.Equals(userID),
		).Exec(context.Background())
		
		bookings, err = internalDB.Client.Booking.FindMany(
			db.Booking.ProProfileID.Equals(profile.ID),
		).With(
			db.Booking.Client.Fetch(),
		).Exec(context.Background())
	} else {
		bookings, err = internalDB.Client.Booking.FindMany(
			db.Booking.ClientID.Equals(userID),
		).With(
			db.Booking.ProProfile.Fetch(),
		).Exec(context.Background())
	}

	if err != nil {
		http.Error(w, "error fetching bookings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}

func UpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	booking, err := internalDB.Client.Booking.FindUnique(
		db.Booking.ID.Equals(id),
	).Update(
		db.Booking.Status.Set(req.Status),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error updating booking", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

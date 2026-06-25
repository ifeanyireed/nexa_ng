package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/internal/utils"
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

	// Fetch booking details to send SMS notification
	bookingWithDetails, err := internalDB.Client.Booking.FindUnique(
		db.Booking.ID.Equals(booking.ID),
	).With(
		db.Booking.Client.Fetch(),
		db.Booking.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(context.Background())

	if err == nil {
		clientName := "A client"
		if uName, ok := bookingWithDetails.Client().Name(); ok && uName != "" {
			clientName = uName
		}
		serviceName := "Service"
		if sName, ok := bookingWithDetails.ServiceName(); ok && sName != "" {
			serviceName = sName
		}
		amount := 0.0
		if amt, ok := bookingWithDetails.Amount(); ok {
			amount = amt
		}
		scheduledAt := bookingWithDetails.ScheduledAt.Format("Jan 02, 2006 at 3:04 PM")

		msg := fmt.Sprintf("Hello! You have a new Nexa booking from %s for '%s' scheduled on %s. Amount: ₦%.2f. Log in to accept.", clientName, serviceName, scheduledAt, amount)
		clientMsg := fmt.Sprintf("You have successfully requested a booking for '%s' scheduled on %s. Amount: ₦%.2f. Pending Pro confirmation.", serviceName, scheduledAt, amount)

		// Mirror to notifications
		_ = utils.CreateNotification(bookingWithDetails.ProProfile().UserID, "New Booking Request", msg, "BOOKING")
		_ = utils.CreateNotification(userID, "Booking Requested", clientMsg, "BOOKING")

		if phone, ok := bookingWithDetails.ProProfile().Phone(); ok && phone != "" {
			go func() {
				if err := utils.SendSMS(phone, msg); err != nil {
					log.Printf("Error sending new booking SMS: %v", err)
				}
			}()
		}

		clientEmail := bookingWithDetails.Client().Email
		proEmail := ""
		if bEmail, ok := bookingWithDetails.ProProfile().BusinessEmail(); ok && bEmail != "" {
			proEmail = bEmail
		} else if proUser := bookingWithDetails.ProProfile().User(); proUser != nil {
			proEmail = proUser.Email
		}

		utils.SendBookingEmailHelper(clientEmail, proEmail, "New Booking Scheduled - Nexa", msg)
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
		profile, errProfile := internalDB.Client.ProProfile.FindUnique(
			db.ProProfile.UserID.Equals(userID),
		).Exec(context.Background())
		
		if errProfile != nil || profile == nil {
			// Profile not created yet, return empty list
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]db.BookingModel{})
			return
		}

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
	userID := r.Context().Value(middleware.UserIDKey).(string)
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

	// Fetch booking details to send SMS status updates
	bookingWithDetails, err := internalDB.Client.Booking.FindUnique(
		db.Booking.ID.Equals(booking.ID),
	).With(
		db.Booking.Client.Fetch(),
		db.Booking.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(context.Background())

	if err == nil {
		serviceName := "Service"
		if sName, ok := bookingWithDetails.ServiceName(); ok && sName != "" {
			serviceName = sName
		}
		scheduledAt := bookingWithDetails.ScheduledAt.Format("Jan 02, 2006 at 3:04 PM")
		var msg string
		var clientMsg string

		switch req.Status {
		case "CONFIRMED":
			msg = fmt.Sprintf("You have confirmed the Nexa booking for '%s' scheduled on %s. Get ready to serve your client!", serviceName, scheduledAt)
			clientMsg = fmt.Sprintf("Your Nexa booking for '%s' scheduled on %s has been confirmed by the pro.", serviceName, scheduledAt)
		case "COMPLETED":
			msg = fmt.Sprintf("Congratulations! Your Nexa booking for '%s' has been marked as COMPLETED. Your funds will be released to your wallet shortly.", serviceName)
			clientMsg = fmt.Sprintf("Your Nexa booking for '%s' has been marked as COMPLETED. Thank you for using Nexa!", serviceName)
		case "CANCELLED":
			if userID == bookingWithDetails.ClientID {
				msg = fmt.Sprintf("Hello! Your Nexa booking for '%s' scheduled on %s has been cancelled by the client.", serviceName, scheduledAt)
				clientMsg = fmt.Sprintf("You have cancelled the Nexa booking for '%s' scheduled on %s.", serviceName, scheduledAt)
			} else {
				msg = fmt.Sprintf("You have cancelled the Nexa booking for '%s' scheduled on %s.", serviceName, scheduledAt)
				clientMsg = fmt.Sprintf("Your Nexa booking for '%s' scheduled on %s has been cancelled by the pro.", serviceName, scheduledAt)
			}
		}

		if msg != "" {
			// Mirror to notifications
			_ = utils.CreateNotification(bookingWithDetails.ProProfile().UserID, fmt.Sprintf("Booking %s", req.Status), msg, "BOOKING")
			_ = utils.CreateNotification(bookingWithDetails.ClientID, fmt.Sprintf("Booking %s", req.Status), clientMsg, "BOOKING")

			if phone, ok := bookingWithDetails.ProProfile().Phone(); ok && phone != "" {
				go func() {
					if err := utils.SendSMS(phone, msg); err != nil {
						log.Printf("Error sending booking update SMS: %v", err)
					}
				}()
			}

			clientEmail := bookingWithDetails.Client().Email
			proEmail := ""
			if bEmail, ok := bookingWithDetails.ProProfile().BusinessEmail(); ok && bEmail != "" {
				proEmail = bEmail
			} else if proUser := bookingWithDetails.ProProfile().User(); proUser != nil {
				proEmail = proUser.Email
			}

			subject := fmt.Sprintf("Booking Status Updated: %s - Nexa", req.Status)
			utils.SendBookingEmailHelper(clientEmail, proEmail, subject, msg)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func GetBooking(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	booking, err := internalDB.Client.Booking.FindUnique(
		db.Booking.ID.Equals(id),
	).With(
		db.Booking.Client.Fetch(),
		db.Booking.ProProfile.Fetch().With(db.ProProfile.User.Fetch()),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

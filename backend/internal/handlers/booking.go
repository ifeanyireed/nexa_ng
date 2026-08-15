package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/internal/models"
	"nexa/backend/internal/utils"
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req CreateBookingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Type == "" {
		req.Type = "STANDARD"
	}

	booking := models.Booking{
		ClientID:     userID,
		ProProfileID: req.ProProfileID,
		ScheduledAt:  req.ScheduledAt,
		ServiceName:  req.ServiceName,
		Amount:       req.Amount,
		Type:         req.Type,
		Status:       "PENDING",
	}

	if err := internalDB.DB.Create(&booking).Error; err != nil {
		http.Error(w, "error creating booking: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch booking details to send SMS notification
	var bookingWithDetails models.Booking
	err := internalDB.DB.Preload("Client").
		Preload("ProProfile").
		Preload("ProProfile.User").
		Where("id = ?", booking.ID).
		First(&bookingWithDetails).Error

	if err == nil {
		clientName := "A client"
		if bookingWithDetails.Client != nil && bookingWithDetails.Client.Name != "" {
			clientName = bookingWithDetails.Client.Name
		}
		serviceName := bookingWithDetails.ServiceName
		if serviceName == "" {
			serviceName = "Service"
		}
		amount := bookingWithDetails.Amount
		scheduledAt := bookingWithDetails.ScheduledAt.Format("Jan 02, 2006 at 3:04 PM")

		msg := fmt.Sprintf("Hello! You have a new Nexa booking from %s for '%s' scheduled on %s. Amount: ₦%.2f. Log in to accept.", clientName, serviceName, scheduledAt, amount)
		clientMsg := fmt.Sprintf("You have successfully requested a booking for '%s' scheduled on %s. Amount: ₦%.2f. Pending Pro confirmation.", serviceName, scheduledAt, amount)

		if bookingWithDetails.ProProfile != nil {
			_ = utils.CreateNotification(bookingWithDetails.ProProfile.UserID, "New Booking Request", msg, "BOOKING")
			if bookingWithDetails.ProProfile.Phone != "" {
				go func() {
					if err := utils.SendSMS(bookingWithDetails.ProProfile.Phone, msg); err != nil {
						log.Printf("Error sending new booking SMS: %v", err)
					}
				}()
			}
		}
		_ = utils.CreateNotification(userID, "Booking Requested", clientMsg, "BOOKING")

		clientEmail := ""
		if bookingWithDetails.Client != nil {
			clientEmail = bookingWithDetails.Client.Email
		}
		proEmail := ""
		if bookingWithDetails.ProProfile != nil {
			if bookingWithDetails.ProProfile.BusinessEmail != "" {
				proEmail = bookingWithDetails.ProProfile.BusinessEmail
			} else if bookingWithDetails.ProProfile.User != nil {
				proEmail = bookingWithDetails.ProProfile.User.Email
			}
		}

		utils.SendBookingEmailHelper(clientEmail, proEmail, "New Booking Scheduled - Nexa", msg)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func ListMyBookings(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)
	role := r.Context().Value(middleware.RoleKey).(string)

	var bookings []models.Booking
	var err error

	if role == "PRO" {
		var profile models.ProProfile
		errProfile := internalDB.DB.Where("user_id = ?", userID).First(&profile).Error
		if errProfile != nil {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode([]models.Booking{})
			return
		}

		err = internalDB.DB.Preload("Client").
			Where("pro_profile_id = ?", profile.ID).
			Order("created_at desc").
			Find(&bookings).Error
	} else {
		err = internalDB.DB.Preload("ProProfile").
			Where("client_id = ?", userID).
			Order("created_at desc").
			Find(&bookings).Error
	}

	if err != nil {
		http.Error(w, "error fetching bookings: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(bookings)
}

func UpdateBookingStatus(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)
	id := chi.URLParam(r, "id")

	var req struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var booking models.Booking
	if err := internalDB.DB.Where("id = ?", id).First(&booking).Error; err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	booking.Status = req.Status
	if err := internalDB.DB.Save(&booking).Error; err != nil {
		http.Error(w, "error updating booking: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch booking details to send SMS status updates
	var bookingWithDetails models.Booking
	err := internalDB.DB.Preload("Client").
		Preload("ProProfile").
		Preload("ProProfile.User").
		Where("id = ?", booking.ID).
		First(&bookingWithDetails).Error

	if err == nil {
		serviceName := bookingWithDetails.ServiceName
		if serviceName == "" {
			serviceName = "Service"
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
			if bookingWithDetails.ProProfile != nil {
				_ = utils.CreateNotification(bookingWithDetails.ProProfile.UserID, fmt.Sprintf("Booking %s", req.Status), msg, "BOOKING")
				if bookingWithDetails.ProProfile.Phone != "" {
					go func() {
						if err := utils.SendSMS(bookingWithDetails.ProProfile.Phone, msg); err != nil {
							log.Printf("Error sending booking update SMS: %v", err)
						}
					}()
				}
			}
			_ = utils.CreateNotification(bookingWithDetails.ClientID, fmt.Sprintf("Booking %s", req.Status), clientMsg, "BOOKING")

			clientEmail := ""
			if bookingWithDetails.Client != nil {
				clientEmail = bookingWithDetails.Client.Email
			}
			proEmail := ""
			if bookingWithDetails.ProProfile != nil {
				if bookingWithDetails.ProProfile.BusinessEmail != "" {
					proEmail = bookingWithDetails.ProProfile.BusinessEmail
				} else if bookingWithDetails.ProProfile.User != nil {
					proEmail = bookingWithDetails.ProProfile.User.Email
				}
			}

			subject := fmt.Sprintf("Booking Status Updated: %s - Nexa", req.Status)
			utils.SendBookingEmailHelper(clientEmail, proEmail, subject, msg)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

func GetBooking(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var booking models.Booking
	err := internalDB.DB.Preload("Client").
		Preload("ProProfile").
		Preload("ProProfile.User").
		Where("id = ?", id).
		First(&booking).Error

	if err != nil {
		http.Error(w, "booking not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(booking)
}

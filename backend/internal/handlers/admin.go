package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/internal/models"
	"nexa/backend/internal/utils"
	"time"

	"github.com/go-chi/chi/v5"
)

type SendAdminPushRequest struct {
	UserID  string `json:"user_id"` // "ALL" or specific user ID
	Title   string `json:"title"`
	Message string `json:"message"`
}

// SendAdminPushNotification triggers a database notification and WebSocket broadcast for all users or a specific user.
func SendAdminPushNotification(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	var req SendAdminPushRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Title == "" || req.Message == "" {
		http.Error(w, "title and message are required", http.StatusBadRequest)
		return
	}

	if req.UserID == "ALL" {
		var users []models.User
		if err := internalDB.DB.Select("id").Find(&users).Error; err != nil {
			http.Error(w, "failed to fetch users", http.StatusInternalServerError)
			return
		}

		for _, user := range users {
			_ = utils.CreateNotification(user.ID, req.Title, req.Message, "ADMIN_PUSH")
		}
	} else {
		err := utils.CreateNotification(req.UserID, req.Title, req.Message, "ADMIN_PUSH")
		if err != nil {
			http.Error(w, "failed to send admin notification", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

// TriggerSubscriptionRenewals scans expiring pro subscriptions (next 3 days) and sends SMS + Email + In-App reminders
func TriggerSubscriptionRenewals(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	now := time.Now()
	threeDaysLater := now.Add(72 * time.Hour)

	var pros []models.ProProfile
	err := internalDB.DB.Preload("User").
		Where("subscription_expires_at >= ? AND subscription_expires_at <= ?", now, threeDaysLater).
		Find(&pros).Error

	if err != nil {
		http.Error(w, "error fetching expiring subscriptions: "+err.Error(), http.StatusInternalServerError)
		return
	}

	remindersSent := 0
	for _, pro := range pros {
		userID := pro.UserID
		planName := "Nexa Pro"
		if pro.Plan != "" {
			planName = pro.Plan
		}

		expiryDate := ""
		if pro.SubscriptionExpiresAt != nil {
			expiryDate = pro.SubscriptionExpiresAt.Format("Jan 02, 2006")
		}

		alertMsg := fmt.Sprintf("Nexa Alert: Your %s subscription expires on %s. Renew now to keep your premium features and gold verification status.", planName, expiryDate)

		// 1. In-App Notification
		_ = utils.CreateNotification(userID, "Subscription Renewal Due", fmt.Sprintf("Your %s subscription expires on %s. Renew now to avoid service disruption.", planName, expiryDate), "SUBSCRIPTION")

		// 2. Termii SMS
		if pro.Phone != "" {
			go func(phoneNumber, msg string) {
				_ = utils.SendSMS(phoneNumber, msg)
			}(pro.Phone, alertMsg)
		}

		// 3. Email
		if pro.User != nil && pro.User.Email != "" {
			email := pro.User.Email
			go func(toEmail, msg string) {
				_ = utils.SendEmail(toEmail, "Nexa Subscription Renewal Notice", msg)
			}(email, alertMsg)
		}

		remindersSent++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":         "success",
		"reminders_sent": remindersSent,
	})
}

// ListMyNotifications fetches in-app notifications for the logged-in user
func ListMyNotifications(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var notifications []models.Notification
	err := internalDB.DB.Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&notifications).Error

	if err != nil {
		http.Error(w, "error fetching notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// MarkNotificationRead marks a specific notification as read
func MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")

	var notif models.Notification
	if err := internalDB.DB.Where("id = ?", id).First(&notif).Error; err != nil {
		http.Error(w, "notification not found", http.StatusNotFound)
		return
	}

	notif.IsRead = true
	if err := internalDB.DB.Save(&notif).Error; err != nil {
		http.Error(w, "error updating notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notif)
}

// MarkAllNotificationsRead marks all notifications of the user as read
func MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	err := internalDB.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true).Error

	if err != nil {
		http.Error(w, "error marking all notifications as read: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

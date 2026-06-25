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
	ctx := context.Background()

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
		// Fetch all users to create notifications
		users, err := internalDB.Client.User.FindMany().Exec(ctx)
		if err != nil {
			http.Error(w, "failed to fetch users", http.StatusInternalServerError)
			return
		}

		for _, user := range users {
			_ = utils.CreateNotification(user.ID, req.Title, req.Message, "ADMIN_PUSH")
		}
	} else {
		// Send to specific user ID
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
	ctx := context.Background()
	now := time.Now()
	threeDaysLater := now.Add(72 * time.Hour)

	// Fetch pros whose subscription expires in the next 3 days
	pros, err := internalDB.Client.ProProfile.FindMany(
		db.ProProfile.SubscriptionExpiresAt.Gte(now),
		db.ProProfile.SubscriptionExpiresAt.Lte(threeDaysLater),
	).With(
		db.ProProfile.User.Fetch(),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error fetching expiring subscriptions: "+err.Error(), http.StatusInternalServerError)
		return
	}

	remindersSent := 0
	for _, pro := range pros {
		userID := pro.UserID
		planName := "Nexa Pro"
		if p, ok := pro.Plan(); ok && p != "" {
			planName = p
		}
		
		expiryDate := ""
		if exp, ok := pro.SubscriptionExpiresAt(); ok {
			expiryDate = exp.Format("Jan 02, 2006")
		}

		alertMsg := fmt.Sprintf("Nexa Alert: Your %s subscription expires on %s. Renew now to keep your premium features and gold verification status.", planName, expiryDate)

		// 1. In-App Notification
		_ = utils.CreateNotification(userID, "Subscription Renewal Due", fmt.Sprintf("Your %s subscription expires on %s. Renew now to avoid service disruption.", planName, expiryDate), "SUBSCRIPTION")

		// 2. Termii SMS
		if phone, ok := pro.Phone(); ok && phone != "" {
			go func(phoneNumber, msg string) {
				_ = utils.SendSMS(phoneNumber, msg)
			}(phone, alertMsg)
		}

		// 3. Email
		email := pro.User().Email
		go func(toEmail, msg string) {
			_ = utils.SendEmail(toEmail, "Nexa Subscription Renewal Notice", msg)
		}(email, alertMsg)

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
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	notifications, err := internalDB.Client.Notification.FindMany(
		db.Notification.UserID.Equals(userID),
	).OrderBy(
		db.Notification.CreatedAt.Order(db.SortOrderDesc),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error fetching notifications: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifications)
}

// MarkNotificationRead marks a specific notification as read
func MarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ctx := context.Background()

	notif, err := internalDB.Client.Notification.FindUnique(
		db.Notification.ID.Equals(id),
	).Update(
		db.Notification.IsRead.Set(true),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error updating notification: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notif)
}

// MarkAllNotificationsRead marks all notifications of the user as read
func MarkAllNotificationsRead(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	_, err := internalDB.Client.Notification.FindMany(
		db.Notification.UserID.Equals(userID),
		db.Notification.IsRead.Equals(false),
	).Update(
		db.Notification.IsRead.Set(true),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error marking all notifications as read: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

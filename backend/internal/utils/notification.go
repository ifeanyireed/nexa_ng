package utils

import (
	"log"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/models"
)

// CreateNotification saves a notification in the database and broadcasts it over WebSocket in real time if the user is online.
func CreateNotification(userID string, title string, message string, notifType string) error {
	if internalDB.DB == nil {
		log.Printf("CreateNotification skipped: DB not connected")
		return nil
	}

	notif := models.Notification{
		UserID:  userID,
		Title:   title,
		Message: message,
		Type:    notifType,
		IsRead:  false,
	}

	if err := internalDB.DB.Create(&notif).Error; err != nil {
		log.Printf("Error saving notification to DB: %v", err)
		return err
	}

	// Broadcast live to client over active WebSocket
	BroadcastJSON(userID, map[string]interface{}{
		"event": "notification",
		"data":  notif,
	})

	return nil
}

package utils

import (
	"context"
	"log"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/prisma/db"
)

// CreateNotification saves a notification in the database and broadcasts it over WebSocket in real time if the user is online.
func CreateNotification(userID string, title string, message string, notifType string) error {
	ctx := context.Background()

	// Positional arguments based on schema: User (relation), Title (scalar), Message (scalar)
	notif, err := internalDB.Client.Notification.CreateOne(
		db.Notification.User.Link(db.User.ID.Equals(userID)),
		db.Notification.Title.Set(title),
		db.Notification.Message.Set(message),
		db.Notification.Type.Set(notifType),
	).Exec(ctx)

	if err != nil {
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

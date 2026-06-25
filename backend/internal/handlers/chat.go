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

type SendMessageRequest struct {
	ReceiverID string `json:"receiver_id"`
	Text       string `json:"text"`
}

// SendMessage creates a message in the database and triggers offline alerts (SMS + Email) if receiver is not online
func SendMessage(w http.ResponseWriter, r *http.Request) {
	senderID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Create message using correct Prisma Go positional args: Sender, Receiver, Text
	msg, err := internalDB.Client.Message.CreateOne(
		db.Message.Sender.Link(db.User.ID.Equals(senderID)),
		db.Message.Receiver.Link(db.User.ID.Equals(req.ReceiverID)),
		db.Message.Text.Set(req.Text),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error sending message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch Sender & Receiver details to send notifications
	sender, _ := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(senderID),
	).Exec(ctx)

	receiver, err := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(req.ReceiverID),
	).With(
		db.User.ProProfile.Fetch(),
	).Exec(ctx)

	sentViaWS := false
	utils.ActiveClientsMu.RLock()
	conns, exists := utils.ActiveClients[req.ReceiverID]
	utils.ActiveClientsMu.RUnlock()

	if exists {
		for _, receiverConn := range conns {
			err := receiverConn.WriteJSON(msg)
			if err == nil {
				sentViaWS = true
			} else {
				log.Printf("Failed to send message via WebSocket to %s: %v", req.ReceiverID, err)
			}
		}
		if sentViaWS {
			// Mark message as read since it was instantly delivered
			_, _ = internalDB.Client.Message.FindUnique(
				db.Message.ID.Equals(msg.ID),
			).Update(
				db.Message.IsRead.Set(true),
			).Exec(ctx)
		}
	}

	if !sentViaWS && err == nil && receiver != nil {
		senderName := "Someone"
		if name, ok := sender.Name(); ok && name != "" {
			senderName = name
		}

		previewLen := 30
		if len(req.Text) < previewLen {
			previewLen = len(req.Text)
		}
		msgPreview := req.Text[:previewLen]
		if len(req.Text) > previewLen {
			msgPreview += "..."
		}

		alertText := fmt.Sprintf("NexaChat: You received a new message from %s: '%s'. Log in to reply.", senderName, msgPreview)

		// Mirror to notifications
		_ = utils.CreateNotification(req.ReceiverID, fmt.Sprintf("New Message from %s", senderName), alertText, "MESSAGE")

		// Send SMS if the receiver is a Pro with a phone number
		if pro, ok := receiver.ProProfile(); ok {
			if phone, ok := pro.Phone(); ok && phone != "" {
				go func() {
					if err := utils.SendSMS(phone, alertText); err != nil {
						log.Printf("Offline message SMS warning: %v", err)
					}
				}()
			}
		}

		// Send offline notification Email to receiver
		go func() {
			emailBody := fmt.Sprintf("Hi there,\n\nYou have received a new offline message from %s on Nexa:\n\n\"%s\"\n\nPlease log in to your Nexa dashboard to reply.\n\nBest regards,\nNexa Team", senderName, req.Text)
			_ = utils.SendEmail(receiver.Email, fmt.Sprintf("New offline message from %s - Nexa", senderName), emailBody)
		}()
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

// GetChatHistory fetches 1-to-1 message history between the logged-in user and another user
func GetChatHistory(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	otherUserID := chi.URLParam(r, "otherUserId")
	ctx := context.Background()

	// Fetch all messages exchanged between the two users
	messages, err := internalDB.Client.Message.FindMany(
		db.Message.Or(
			db.Message.And(
				db.Message.SenderID.Equals(userID),
				db.Message.ReceiverID.Equals(otherUserID),
			),
			db.Message.And(
				db.Message.SenderID.Equals(otherUserID),
				db.Message.ReceiverID.Equals(userID),
			),
		),
	).OrderBy(
		db.Message.CreatedAt.Order(db.SortOrderAsc),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error fetching messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Mark all messages sent by the other user to the logged-in user as Read
	go func() {
		_, _ = internalDB.Client.Message.FindMany(
			db.Message.SenderID.Equals(otherUserID),
			db.Message.ReceiverID.Equals(userID),
			db.Message.IsRead.Equals(false),
		).Update(
			db.Message.IsRead.Set(true),
		).Exec(ctx)
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

type Conversation struct {
	OtherUserID string    `json:"other_user_id"`
	OtherName   string    `json:"other_name"`
	LastMessage string    `json:"last_message"`
	Time        time.Time `json:"time"`
	Unread      int       `json:"unread"`
	Role        string    `json:"role"`
}

// GetConversations returns a list of active conversation groups for the logged-in user
func GetConversations(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	// Get all messages involving the logged-in user
	messages, err := internalDB.Client.Message.FindMany(
		db.Message.Or(
			db.Message.SenderID.Equals(userID),
			db.Message.ReceiverID.Equals(userID),
		),
	).With(
		db.Message.Sender.Fetch(),
		db.Message.Receiver.Fetch(),
	).OrderBy(
		db.Message.CreatedAt.Order(db.SortOrderDesc),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error fetching conversations: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Aggregate messages into conversation headers
	convoMap := make(map[string]*Conversation)
	var orderedKeys []string

	for _, msg := range messages {
		// Identify who the "other" user is in the message
		var otherUser *db.UserModel
		if msg.SenderID == userID {
			otherUser = msg.Receiver()
		} else {
			otherUser = msg.Sender()
		}

		if otherUser == nil {
			continue
		}

		otherID := otherUser.ID
		name, _ := otherUser.Name()
		if name == "" {
			name = otherUser.Email
		}

		// Calculate unread count (messages sent by otherID to userID which are unread)
		unread := 0
		if msg.ReceiverID == userID && !msg.IsRead {
			unread = 1
		}

		if convo, exists := convoMap[otherID]; exists {
			convo.Unread += unread
		} else {
			convoMap[otherID] = &Conversation{
				OtherUserID: otherID,
				OtherName:   name,
				LastMessage: msg.Text,
				Time:        msg.CreatedAt,
				Unread:      unread,
				Role:        otherUser.Role,
			}
			orderedKeys = append(orderedKeys, otherID)
		}
	}

	var conversations []*Conversation
	for _, k := range orderedKeys {
		conversations = append(conversations, convoMap[k])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(conversations)
}

// UpdateOnlineStatus registers the logged-in user's online/offline presence
func UpdateOnlineStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)
	ctx := context.Background()

	var req struct {
		IsOnline bool `json:"is_online"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	user, err := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.IsOnline.Set(req.IsOnline),
	).Exec(ctx)

	if err != nil {
		http.Error(w, "error updating status: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

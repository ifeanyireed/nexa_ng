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

type SendMessageRequest struct {
	ReceiverID string `json:"receiver_id"`
	Text       string `json:"text"`
}

// SendMessage creates a message in the database and triggers offline alerts (SMS + Email) if receiver is not online
func SendMessage(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	senderID := r.Context().Value(middleware.UserIDKey).(string)

	var req SendMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	msg := models.Message{
		SenderID:   senderID,
		ReceiverID: req.ReceiverID,
		Text:       req.Text,
		IsRead:     false,
	}

	if err := internalDB.DB.Create(&msg).Error; err != nil {
		http.Error(w, "error sending message: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch Sender & Receiver details
	var sender models.User
	_ = internalDB.DB.Where("id = ?", senderID).First(&sender).Error

	var receiver models.User
	err := internalDB.DB.Preload("ProProfile").Where("id = ?", req.ReceiverID).First(&receiver).Error

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
			internalDB.DB.Model(&msg).Update("is_read", true)
		}
	}

	if !sentViaWS && err == nil {
		senderName := "Someone"
		if sender.Name != "" {
			senderName = sender.Name
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

		// Send SMS if receiver is a Pro with phone number
		if receiver.ProProfile != nil && receiver.ProProfile.Phone != "" {
			phone := receiver.ProProfile.Phone
			go func() {
				if err := utils.SendSMS(phone, alertText); err != nil {
					log.Printf("Offline message SMS warning: %v", err)
				}
			}()
		}

		// Send offline notification Email
		if receiver.Email != "" {
			email := receiver.Email
			go func() {
				emailBody := fmt.Sprintf("Hi there,\n\nYou have received a new offline message from %s on Nexa:\n\n\"%s\"\n\nPlease log in to your Nexa dashboard to reply.\n\nBest regards,\nNexa Team", senderName, req.Text)
				_ = utils.SendEmail(email, fmt.Sprintf("New offline message from %s - Nexa", senderName), emailBody)
			}()
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(msg)
}

// GetChatHistory fetches 1-to-1 message history between the logged-in user and another user
func GetChatHistory(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)
	otherUserID := chi.URLParam(r, "otherUserId")

	var messages []models.Message
	err := internalDB.DB.Where("(sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)",
		userID, otherUserID, otherUserID, userID).
		Order("created_at asc").
		Find(&messages).Error

	if err != nil {
		http.Error(w, "error fetching messages: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Mark messages from other user as read
	go func() {
		internalDB.DB.Model(&models.Message{}).
			Where("sender_id = ? AND receiver_id = ? AND is_read = ?", otherUserID, userID, false).
			Update("is_read", true)
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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var messages []models.Message
	err := internalDB.DB.Preload("Sender").
		Preload("Receiver").
		Where("sender_id = ? OR receiver_id = ?", userID, userID).
		Order("created_at desc").
		Find(&messages).Error

	if err != nil {
		http.Error(w, "error fetching conversations: "+err.Error(), http.StatusInternalServerError)
		return
	}

	convoMap := make(map[string]*Conversation)
	var orderedKeys []string

	for _, msg := range messages {
		var otherUser *models.User
		if msg.SenderID == userID {
			otherUser = msg.Receiver
		} else {
			otherUser = msg.Sender
		}

		if otherUser == nil {
			continue
		}

		otherID := otherUser.ID
		name := otherUser.Name
		if name == "" {
			name = otherUser.Email
		}

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
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req struct {
		IsOnline bool `json:"is_online"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var user models.User
	if err := internalDB.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	user.IsOnline = req.IsOnline
	if err := internalDB.DB.Save(&user).Error; err != nil {
		http.Error(w, "error updating status: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all cross-origin connections for internal ERP & public scoreboards
	},
}

// QuestMessage represents a real-time event sent over WebSocket
type QuestMessage struct {
	Type      string `json:"type"`      // "CONNECTED", "SCORE_UPDATED", "SCHEDULE_UPDATED", "CONCEPT_UPDATED", "ROSTER_UPDATED", "QUEST_UPDATED"
	QuestID   string `json:"quest_id"`  // target quest ID / slug
	Timestamp string `json:"timestamp"` // ISO 8601 string
	Data      any    `json:"data,omitempty"`
}

// QuestHub manages active WebSocket connections grouped by quest ID
type QuestHub struct {
	mu    sync.RWMutex
	rooms map[string]map[*websocket.Conn]bool
}

var globalQuestHub = &QuestHub{
	rooms: make(map[string]map[*websocket.Conn]bool),
}

// RegisterClient adds a client connection to a quest room
func (h *QuestHub) RegisterClient(questID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if _, exists := h.rooms[questID]; !exists {
		h.rooms[questID] = make(map[*websocket.Conn]bool)
	}
	h.rooms[questID][conn] = true
	log.Printf("[WS] Client connected to quest '%s' (Total in room: %d)", questID, len(h.rooms[questID]))
}

// UnregisterClient removes a client connection from a quest room
func (h *QuestHub) UnregisterClient(questID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if room, exists := h.rooms[questID]; exists {
		delete(room, conn)
		conn.Close()
		if len(room) == 0 {
			delete(h.rooms, questID)
		}
		log.Printf("[WS] Client disconnected from quest '%s'", questID)
	}
}

// BroadcastToQuest sends a message to all connected clients in a quest room
func BroadcastToQuest(questID string, eventType string, payload any) {
	msg := QuestMessage{
		Type:      eventType,
		QuestID:   questID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Data:      payload,
	}

	bytes, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[WS Error] Failed to serialize broadcast message: %v", err)
		return
	}

	globalQuestHub.mu.RLock()
	defer globalQuestHub.mu.RUnlock()

	// Send to specific quest room
	if room, exists := globalQuestHub.rooms[questID]; exists {
		for conn := range room {
			go func(c *websocket.Conn) {
				c.SetWriteDeadline(time.Now().Add(5 * time.Second))
				if err := c.WriteMessage(websocket.TextMessage, bytes); err != nil {
					log.Printf("[WS Notice] Error writing to client in quest '%s': %v", questID, err)
				}
			}(conn)
		}
	}

	// Also broadcast to "all" / global listeners if any
	if room, exists := globalQuestHub.rooms["*"]; exists {
		for conn := range room {
			go func(c *websocket.Conn) {
				c.SetWriteDeadline(time.Now().Add(5 * time.Second))
				c.WriteMessage(websocket.TextMessage, bytes)
			}(conn)
		}
	}
}

// HandleQuestWS upgrades HTTP request to a live WebSocket connection
func HandleQuestWS(w http.ResponseWriter, r *http.Request) {
	questID := r.URL.Query().Get("quest_id")
	if questID == "" {
		questID = r.URL.Query().Get("slug")
	}
	if questID == "" {
		questID = "reignite-2026"
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS Error] WebSocket upgrade failed: %v", err)
		return
	}

	globalQuestHub.RegisterClient(questID, conn)

	// Send welcome handshake message
	welcome := QuestMessage{
		Type:      "CONNECTED",
		QuestID:   questID,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Data: map[string]string{
			"message": "Connected to real-time Quest Event Stream",
			"room":    questID,
		},
	}
	welcomeBytes, _ := json.Marshal(welcome)
	conn.WriteMessage(websocket.TextMessage, welcomeBytes)

	// Keep-alive read pump
	go func() {
		defer func() {
			globalQuestHub.UnregisterClient(questID, conn)
		}()

		conn.SetReadLimit(4096)
		conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		conn.SetPongHandler(func(string) error {
			conn.SetReadDeadline(time.Now().Add(60 * time.Second))
			return nil
		})

		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("[WS Notice] Read error: %v", err)
				}
				break
			}
			// Reset read deadline on any incoming message / ping
			conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		}
	}()
}

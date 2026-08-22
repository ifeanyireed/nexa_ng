package handlers

import (
	"log"
	"net/http"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type VoiceHandler struct{}

func NewVoiceHandler() *VoiceHandler {
	return &VoiceHandler{}
}

type VoiceMessage struct {
	Event string `json:"event"`
	Audio string `json:"audio,omitempty"`
	Text  string `json:"text,omitempty"`
}

func (h *VoiceHandler) HandleVoiceStream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade websocket: %v", err)
		return
	}
	defer conn.Close()

	log.Println("Executive Voice Assistant WebSocket connected")

	// Send initial greeting event
	_ = conn.WriteJSON(map[string]interface{}{
		"event": "ready",
		"message": "Executive Voice Assistant initialized. Say a command or ask a question.",
	})

	for {
		var msg VoiceMessage
		if err := conn.ReadJSON(&msg); err != nil {
			log.Printf("WebSocket read error: %v", err)
			break
		}

		if msg.Event == "user_command" {
			// Simulated real-time streaming answer
			_ = conn.WriteJSON(map[string]interface{}{
				"event": "assistant_reply",
				"text":  "Good morning! Yesterday we qualified 186 prospects and booked 4 enterprise meetings. Today Olivia is extracting 200 more school leads.",
			})
		}
	}
}

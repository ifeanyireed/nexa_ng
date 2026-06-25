package utils

import (
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var (
	ActiveClients   = make(map[string][]*websocket.Conn)
	ActiveClientsMu sync.RWMutex
	Upgrader        = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow CORS
		},
	}
)

// BroadcastJSON sends a JSON payload to all active connections for a user.
func BroadcastJSON(userID string, payload interface{}) bool {
	ActiveClientsMu.RLock()
	conns, exists := ActiveClients[userID]
	ActiveClientsMu.RUnlock()

	if exists && len(conns) > 0 {
		success := false
		for _, conn := range conns {
			err := conn.WriteJSON(payload)
			if err == nil {
				success = true
			}
		}
		return success
	}
	return false
}

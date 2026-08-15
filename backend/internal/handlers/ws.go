package handlers

import (
	"fmt"
	"log"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/models"
	"nexa/backend/internal/utils"
	"os"

	"github.com/golang-jwt/jwt/v5"
)

// HandleWSConnection upgrades incoming connection requests to WebSockets, validates JWT, and registers connection
func HandleWSConnection(w http.ResponseWriter, r *http.Request) {
	tokenString := r.URL.Query().Get("token")
	if tokenString == "" {
		http.Error(w, "missing token", http.StatusUnauthorized)
		return
	}

	// Validate JWT token
	jwtSecret := []byte(os.Getenv("JWT_SECRET"))
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		http.Error(w, "invalid token", http.StatusUnauthorized)
		return
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		http.Error(w, "invalid claims", http.StatusUnauthorized)
		return
	}

	userID, ok := claims["user_id"].(string)
	if !ok {
		http.Error(w, "invalid user id in token", http.StatusUnauthorized)
		return
	}

	// Upgrade the connection
	conn, err := utils.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade websocket: %v", err)
		return
	}

	// Register connection in active clients map
	utils.ActiveClientsMu.Lock()
	utils.ActiveClients[userID] = append(utils.ActiveClients[userID], conn)
	utils.ActiveClientsMu.Unlock()

	log.Printf("User %s connected via WebSocket", userID)

	// Update user status to online in the DB
	if internalDB.DB != nil {
		internalDB.DB.Model(&models.User{}).Where("id = ?", userID).Update("is_online", true)
	}

	// Set connection teardown lifecycle
	defer func() {
		utils.ActiveClientsMu.Lock()
		conns := utils.ActiveClients[userID]
		for i, c := range conns {
			if c == conn {
				utils.ActiveClients[userID] = append(conns[:i], conns[i+1:]...)
				break
			}
		}
		if len(utils.ActiveClients[userID]) == 0 {
			delete(utils.ActiveClients, userID)
		}
		utils.ActiveClientsMu.Unlock()
		conn.Close()

		// Update user status to offline in the DB if no more connections remain
		utils.ActiveClientsMu.RLock()
		_, stillHasConn := utils.ActiveClients[userID]
		utils.ActiveClientsMu.RUnlock()

		if !stillHasConn && internalDB.DB != nil {
			internalDB.DB.Model(&models.User{}).Where("id = ?", userID).Update("is_online", false)
		}

		log.Printf("User %s disconnected from WebSocket", userID)
	}()

	// Loop to keep WebSocket open and detect disconnects
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/crypto"
	"nexa/ai_gtm_service/internal/models"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred&timeout=15s"
	db, _ := gorm.Open(mysql.Open(dsn), &gorm.Config{})

	var globalSettings models.GTMGlobalEmailSettings
	db.First(&globalSettings, "id = ?", "global")

	resendKey, _ := crypto.Decrypt(globalSettings.PlatformAPIKeyEncrypted)
	fmt.Printf("Testing Resend key: %s...\n", resendKey[:8])

	// Test from onboarding@resend.dev to the account email
	payload := map[string]interface{}{
		"from":    "onboarding@resend.dev",
		"to":      []string{"reedbreednigeria@gmail.com"},
		"subject": "Ofia AI Platform - Resend Handshake Test",
		"html":    "<h2>Ofia AI Platform Email Handshake Successful</h2><p>Your Resend API key is valid and connected to Ofia AI GTM Engine.</p>",
	}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer "+resendKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		fmt.Printf("HTTP error: %v\n", err)
		return
	}
	defer resp.Body.Close()
	respBytes, _ := io.ReadAll(resp.Body)
	fmt.Printf("Resend Response (Status %d): %s\n", resp.StatusCode, string(respBytes))
}

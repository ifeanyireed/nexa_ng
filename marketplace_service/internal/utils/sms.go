package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
)

type TermiiSMSRequest struct {
	APIKey  string `json:"api_key"`
	To      string `json:"to"`
	From    string `json:"from"`
	SMS     string `json:"sms"`
	Type    string `json:"type"`
	Channel string `json:"channel"`
}

// SendSMS sends an SMS notification to a formatted phone number via Termii.
func SendSMS(to string, message string) error {
	apiKey := os.Getenv("TERMII_API_KEY")
	baseURL := os.Getenv("TERMII_BASE_URL")
	senderID := os.Getenv("TERMII_SENDER_ID")

	if apiKey == "" || baseURL == "" || senderID == "" {
		fmt.Println("Warning: Termii configuration missing. Skipping SMS sending.")
		return nil
	}

	formattedPhone := formatPhoneNumber(to)
	if formattedPhone == "" {
		return fmt.Errorf("invalid phone number: %s", to)
	}

	payload := TermiiSMSRequest{
		APIKey:  apiKey,
		To:      formattedPhone,
		From:    senderID,
		SMS:     message,
		Type:    "plain",
		Channel: "generic", // Termii generic channel
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("%s/api/sms/send", strings.TrimSuffix(baseURL, "/"))
	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("termii API returned non-200 status code: %d", resp.StatusCode)
	}

	return nil
}

// formatPhoneNumber formats local Nigerian phone numbers to the international standard required by Termii.
func formatPhoneNumber(phone string) string {
	phone = strings.ReplaceAll(phone, " ", "")
	phone = strings.ReplaceAll(phone, "-", "")
	phone = strings.ReplaceAll(phone, "(", "")
	phone = strings.ReplaceAll(phone, ")", "")
	phone = strings.ReplaceAll(phone, "+", "")

	// If empty after cleaning
	if len(phone) == 0 {
		return ""
	}

	// If it starts with 0, replace with 234
	if strings.HasPrefix(phone, "0") {
		return "234" + phone[1:]
	}

	// If it starts with 234, return as is
	if strings.HasPrefix(phone, "234") {
		return phone
	}

	// If it is 10 digits (like 8031234567), prepend 234
	if len(phone) == 10 {
		return "234" + phone
	}

	return phone
}

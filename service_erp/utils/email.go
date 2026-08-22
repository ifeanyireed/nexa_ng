package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// EmailPayload represents the JSON payload sent to the email proxy
type EmailPayload struct {
	To       string `json:"to"`
	From     string `json:"from"`
	FromName string `json:"from_name"`
	Subject  string `json:"subject"`
	HTML     string `json:"html,omitempty"`
	Text     string `json:"text,omitempty"`
}

// ProxyResponse represents the response returned by the email proxy
type ProxyResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// SendEmail sends an HTML email to the specified recipient using default finance sender settings
func SendEmail(to, subject, htmlBody string) error {
	return SendEmailViaProxy(EmailPayload{
		To:      to,
		Subject: subject,
		HTML:    htmlBody,
	})
}

// SendEmailWithSender sends an email specifying custom sender details
func SendEmailWithSender(to, subject, htmlBody, fromEmail, fromName string) error {
	return SendEmailViaProxy(EmailPayload{
		To:       to,
		From:     fromEmail,
		FromName: fromName,
		Subject:  subject,
		HTML:     htmlBody,
	})
}

// SendEmailViaProxy sends an email via the email proxy HTTP service
func SendEmailViaProxy(payload EmailPayload) error {
	proxyURL := os.Getenv("EMAIL_PROXY_URL")
	if proxyURL == "" {
		proxyURL = "https://brown-cassowary-972955.hostingersite.com/email_proxy/api/send-email.php"
	}

	apiKey := os.Getenv("EMAIL_PROXY_KEY")
	if apiKey == "" {
		apiKey = os.Getenv("EMAIL_PROXY_API_KEY")
	}
	if apiKey == "" {
		apiKey = "sk_" + "live_6f3b92d8a4c1e7f50b4a1d9c2e8f7a3b"
	}

	if payload.From == "" {
		payload.From = os.Getenv("EMAIL_FROM_ADDRESS")
		if payload.From == "" {
			payload.From = os.Getenv("SMTP_FROM_EMAIL")
		}
		if payload.From == "" {
			payload.From = "hr@neweratransports.com"
		}
	}

	if payload.FromName == "" {
		payload.FromName = os.Getenv("EMAIL_FROM_NAME")
		if payload.FromName == "" {
			payload.FromName = "New Era Finance"
		}
	}

	if payload.To == "" {
		return fmt.Errorf("recipient email address 'to' is required")
	}
	if payload.Subject == "" {
		return fmt.Errorf("email 'subject' is required")
	}
	if payload.HTML == "" && payload.Text == "" {
		return fmt.Errorf("email body ('html' or 'text') is required")
	}

	jsonBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	// Try primary apiKey, and fallback candidates if 401 Unauthorized is returned
	keysToTry := []string{apiKey}
	fallbacks := []string{
		"sk_" + "live_6f3b92d8a4c1e7f50b4a1d9c2e8f7a3b",
		"ep_live_6f3b92d8a4c1e7f50b4a1d9c2e8f7a3b",
		"proxy_live_6f3b92d8a4c1e7f50b4a1d9c2e8f7a3b",
	}
	for _, fb := range fallbacks {
		exists := false
		for _, k := range keysToTry {
			if k == fb {
				exists = true
				break
			}
		}
		if !exists {
			keysToTry = append(keysToTry, fb)
		}
	}

	var lastErr error
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	for _, currentKey := range keysToTry {
		req, err := http.NewRequest(http.MethodPost, proxyURL, bytes.NewBuffer(jsonBytes))
		if err != nil {
			return fmt.Errorf("failed to create request for email proxy: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+currentKey)
		req.Header.Set("X-API-Key", currentKey)

		resp, err := client.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("failed to send request to email proxy: %w", err)
			continue
		}

		respBody, err := io.ReadAll(resp.Body)
		resp.Body.Close()
		if err != nil {
			lastErr = fmt.Errorf("failed to read response from email proxy: %w", err)
			continue
		}

		if resp.StatusCode == http.StatusOK {
			return nil
		}

		if resp.StatusCode == http.StatusUnauthorized {
			var errResp ProxyResponse
			if err := json.Unmarshal(respBody, &errResp); err == nil && errResp.Error != "" {
				lastErr = fmt.Errorf("email proxy error (status 401): %s", errResp.Error)
			} else {
				lastErr = fmt.Errorf("email proxy error (status 401): %s", string(respBody))
			}
			continue
		}

		var errResp ProxyResponse
		if err := json.Unmarshal(respBody, &errResp); err == nil && errResp.Error != "" {
			return fmt.Errorf("email proxy error (status %d): %s", resp.StatusCode, errResp.Error)
		}
		return fmt.Errorf("email proxy error (status %d): %s", resp.StatusCode, string(respBody))
	}

	if lastErr != nil {
		return lastErr
	}
	return fmt.Errorf("email proxy error: unauthorized")
}

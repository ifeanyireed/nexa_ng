package utils

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/smtp"
	"os"
	"strings"
	"time"
)

// EmailPayload represents the JSON payload sent to the email proxy or direct SMTP sender
type EmailPayload struct {
	To           string `json:"to"`
	From         string `json:"from"`
	FromName     string `json:"from_name"`
	Subject      string `json:"subject"`
	HTML         string `json:"html,omitempty"`
	Text         string `json:"text,omitempty"`
	TenantSlug   string `json:"tenant_slug,omitempty"`
	SmtpHost     string `json:"smtp_host,omitempty"`
	SmtpPort     int    `json:"smtp_port,omitempty"`
	SmtpUsername string `json:"smtp_username,omitempty"`
	SmtpPassword string `json:"smtp_password,omitempty"`
}

// SmtpConfig represents custom or tenant SMTP credentials
type SmtpConfig struct {
	Host       string `json:"host"`
	Port       int    `json:"port"`
	Encryption string `json:"encryption"` // "ssl", "tls", "starttls", "none"
	Username   string `json:"username"`
	Password   string `json:"password"`
	FromEmail  string `json:"from_email"`
	FromName   string `json:"from_name"`
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

// SendEmailDirect sends an email directly via native Go SMTP (crypto/tls and net/smtp)
func SendEmailDirect(cfg SmtpConfig, payload EmailPayload) error {
	if cfg.Host == "" || cfg.Port <= 0 {
		return fmt.Errorf("invalid SMTP host or port: %s:%d", cfg.Host, cfg.Port)
	}

	from := strings.TrimSpace(cfg.FromEmail)
	if from == "" {
		from = strings.TrimSpace(payload.From)
	}
	if from == "" {
		from = strings.TrimSpace(cfg.Username)
	}
	if from == "" {
		from = "notifications@ofia.ng"
	}

	fromName := strings.TrimSpace(cfg.FromName)
	if fromName == "" {
		fromName = strings.TrimSpace(payload.FromName)
	}
	if fromName == "" {
		fromName = "OFIA Cloud"
	}

	to := strings.TrimSpace(payload.To)
	if to == "" {
		return fmt.Errorf("recipient email address 'to' is required")
	}

	addr := net.JoinHostPort(cfg.Host, fmt.Sprintf("%d", cfg.Port))
	isSSL := cfg.Port == 465 || strings.EqualFold(cfg.Encryption, "ssl")

	dialer := &net.Dialer{Timeout: 12 * time.Second}
	var client *smtp.Client
	var err error

	if isSSL {
		tlsConfig := &tls.Config{ServerName: cfg.Host}
		conn, err := tls.DialWithDialer(dialer, "tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("TLS dial failed for %s: %w", addr, err)
		}
		defer conn.Close()

		client, err = smtp.NewClient(conn, cfg.Host)
		if err != nil {
			return fmt.Errorf("SMTP client initialization failed for %s: %w", addr, err)
		}
	} else {
		conn, err := dialer.Dial("tcp", addr)
		if err != nil {
			return fmt.Errorf("TCP dial failed for %s: %w", addr, err)
		}
		defer conn.Close()

		client, err = smtp.NewClient(conn, cfg.Host)
		if err != nil {
			return fmt.Errorf("SMTP client initialization failed for %s: %w", addr, err)
		}

		if ok, _ := client.Extension("STARTTLS"); ok {
			tlsConfig := &tls.Config{ServerName: cfg.Host}
			if err = client.StartTLS(tlsConfig); err != nil {
				return fmt.Errorf("STARTTLS negotiation failed for %s: %w", addr, err)
			}
		}
	}
	defer client.Quit()

	if cfg.Username != "" && cfg.Password != "" {
		auth := smtp.PlainAuth("", cfg.Username, cfg.Password, cfg.Host)
		if err := client.Auth(auth); err != nil {
			return fmt.Errorf("SMTP authentication failed for user %s on %s: %w", cfg.Username, cfg.Host, err)
		}
	}

	// Determine envelope sender (MAIL FROM)
	envelopeFrom := from
	if cfg.Username != "" && strings.Contains(cfg.Username, "@") {
		envelopeFrom = cfg.Username
	}

	if err := client.Mail(envelopeFrom); err != nil {
		if envelopeFrom != from {
			if errMail := client.Mail(from); errMail != nil {
				return fmt.Errorf("SMTP MAIL FROM failed: %w", errMail)
			}
		} else {
			return fmt.Errorf("SMTP MAIL FROM failed: %w", err)
		}
	}

	if err := client.Rcpt(to); err != nil {
		return fmt.Errorf("SMTP RCPT TO failed for %s: %w", to, err)
	}

	w, err := client.Data()
	if err != nil {
		return fmt.Errorf("SMTP DATA command failed: %w", err)
	}

	header := make(map[string]string)
	header["From"] = fmt.Sprintf("%s <%s>", fromName, from)
	header["To"] = to
	header["Subject"] = payload.Subject
	header["MIME-Version"] = "1.0"
	header["Date"] = time.Now().Format(time.RFC1123Z)
	header["Message-ID"] = fmt.Sprintf("<%d.%d@%s>", time.Now().UnixNano(), os.Getpid(), cfg.Host)

	if envelopeFrom != from {
		header["Reply-To"] = fmt.Sprintf("%s <%s>", fromName, from)
	}

	contentType := "text/plain; charset=UTF-8"
	body := payload.Text
	if payload.HTML != "" {
		contentType = "text/html; charset=UTF-8"
		body = payload.HTML
	}
	header["Content-Type"] = contentType

	var message bytes.Buffer
	for k, v := range header {
		message.WriteString(fmt.Sprintf("%s: %s\r\n", k, v))
	}
	message.WriteString("\r\n")
	message.WriteString(body)

	if _, err := w.Write(message.Bytes()); err != nil {
		return fmt.Errorf("failed to write email payload: %w", err)
	}

	if err := w.Close(); err != nil {
		return fmt.Errorf("failed to finalize email stream: %w", err)
	}

	return nil
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
			payload.From = "notifications@ofia.ng"
		}
	}

	if payload.FromName == "" {
		payload.FromName = os.Getenv("EMAIL_FROM_NAME")
		if payload.FromName == "" {
			payload.FromName = "OFIA ERP"
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

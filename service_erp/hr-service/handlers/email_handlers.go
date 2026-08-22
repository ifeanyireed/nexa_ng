package handlers

import (
	"backend/utils"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
)

// Send Email via Email Proxy
func sendEmail(to, subject, htmlBody string) error {
	return utils.SendEmail(to, subject, htmlBody)
}

// SHA256 Token generator for password resets
func generateResetToken(email, currentPassword string) string {
	sum := sha256.Sum256([]byte(email + currentPassword + "nets_secret_salt"))
	return fmt.Sprintf("%x", sum)
}

func HandleSendResetEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	var req ResetEmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	origin := r.Header.Get("Origin")
	if origin == "" {
		origin = os.Getenv("PORTAL_URL")
		if origin == "" {
			origin = "https://nets.reedbreed.cc"
		}
	}

	// Fetch users from database
	rows, err := db.Query("SELECT id, name, email, password FROM User")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error: " + err.Error()})
		return
	}
	defer rows.Close()

	userMap := make(map[string]User)
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Password); err != nil {
			continue
		}
		userMap[u.ID] = u
	}

	targetUsers := []User{}
	if req.Email != "" {
		trimmedEmail := strings.TrimSpace(strings.ToLower(req.Email))
		for _, u := range userMap {
			if strings.ToLower(strings.TrimSpace(u.Email)) == trimmedEmail {
				targetUsers = append(targetUsers, u)
			}
		}
	}
	if len(targetUsers) == 0 && len(req.UserIDs) > 0 {
		for _, id := range req.UserIDs {
			if u, ok := userMap[id]; ok && u.Email != "" {
				targetUsers = append(targetUsers, u)
			}
		}
	}

	if len(targetUsers) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "No account found with this email address."})
		return
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	successCount := 0

	var lastErr error
	for _, u := range targetUsers {
		pwd := ""
		if u.Password != nil {
			pwd = *u.Password
		}
		token := generateResetToken(u.Email, pwd)
		resetLink := fmt.Sprintf("%s/reset-password?email=%s&token=%s", origin, u.Email, token)

		htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
    <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">New Era Transport Services</h1>
            </div>
            <div style="padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 14px;">
                <h2 style="color: #1e3a8a; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Reset Your Password</h2>
                <p style="margin: 0 0 16px 0;">Hello %s,</p>
                <p style="margin: 0 0 24px 0;">A request has been made to reset the password for your account on the New Era Performance Portal. Click the button below to choose a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s" style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; text-align: center;">Reset Password</a>
                </div>
                <p style="margin: 0 0 16px 0;">If you did not request this password reset, please ignore this email or contact HR.</p>
                <p style="margin: 0;">Best regards,<br><strong style="color: #1e3a8a;">New Era HR Team</strong></p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                &copy; 2026 New Era Transport Services. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`, u.Name, resetLink)

		wg.Add(1)
		go func(toEmail, subject, body string) {
			defer wg.Done()
			err := sendEmail(toEmail, subject, body)
			if err == nil {
				mu.Lock()
				successCount++
				mu.Unlock()
			} else {
				log.Printf("Failed to send reset email to %s: %v", toEmail, err)
				mu.Lock()
				lastErr = err
				mu.Unlock()
			}
		}(u.Email, "Reset Your Password - New Era Performance Portal", htmlBody)
	}
	wg.Wait()

	if successCount == 0 {
		w.WriteHeader(http.StatusInternalServerError)
		errMsg := "Failed to send reset email. Please try again later."
		if lastErr != nil {
			errMsg = fmt.Sprintf("Failed to send reset email: %v", lastErr)
		}
		json.NewEncoder(w).Encode(map[string]string{"error": errMsg})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"sent":   successCount,
	})
}

func HandleSendBulkNotification(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	var req BulkNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	if req.Subject == "" || req.Message == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Subject and Message are required"})
		return
	}

	// Fetch users from database
	rows, err := db.Query("SELECT id, name, email FROM User")
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database error: " + err.Error()})
		return
	}
	defer rows.Close()

	userMap := make(map[string]User)
	for rows.Next() {
		var u User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email); err != nil {
			continue
		}
		userMap[u.ID] = u
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	successCount := 0

	for _, id := range req.UserIDs {
		u, ok := userMap[id]
		if !ok || u.Email == "" {
			continue
		}

		// Convert plain text newlines to HTML line breaks
		formattedMsg := strings.ReplaceAll(req.Message, "\n", "<br>")

		htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6;">
    <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <div style="background-color: #1e3a8a; padding: 30px 20px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">New Era Transport Services</h1>
            </div>
            <div style="padding: 40px 30px; color: #334155; line-height: 1.6; font-size: 14px;">
                <h2 style="color: #1e3a8a; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Notification Alert</h2>
                <p style="margin: 0 0 16px 0;">Hello %s,</p>
                <p style="margin: 0 0 24px 0;">%s</p>
                <p style="margin: 0;">Best regards,<br><strong style="color: #1e3a8a;">New Era Performance Portal Team</strong></p>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
                &copy; 2026 New Era Transport Services. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`, u.Name, formattedMsg)

		wg.Add(1)
		go func(toEmail, subject, body string) {
			defer wg.Done()
			err := sendEmail(toEmail, subject, body)
			if err == nil {
				mu.Lock()
				successCount++
				mu.Unlock()
			} else {
				log.Printf("Failed to send notification email to %s: %v", toEmail, err)
			}
		}(u.Email, req.Subject, htmlBody)
	}
	wg.Wait()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"sent":   successCount,
	})
}

func HandleUpdatePassword(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	var req UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request body"})
		return
	}

	if req.Email == "" || req.Token == "" || req.NewPassword == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email, Token, and new password are required"})
		return
	}

	// Fetch user from database
	tx, err := db.Begin()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to begin transaction: " + err.Error()})
		return
	}
	defer tx.Rollback()

	var u User
	err = tx.QueryRow("SELECT id, name, email, password FROM User WHERE email = ?", req.Email).Scan(&u.ID, &u.Name, &u.Email, &u.Password)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]string{"error": "User not found"})
		return
	}

	pwd := ""
	if u.Password != nil {
		pwd = *u.Password
	}

	// Validate token
	expectedToken := generateResetToken(u.Email, pwd)
	if req.Token != expectedToken {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid or expired password reset link"})
		return
	}

	// Update password in database
	_, err = tx.Exec("UPDATE User SET password = ? WHERE email = ?", req.NewPassword, req.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to update password: " + err.Error()})
		return
	}

	if err := tx.Commit(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to commit transaction: " + err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Password updated successfully"})
}

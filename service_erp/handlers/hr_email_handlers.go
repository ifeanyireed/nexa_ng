package handlers

import (
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"service_erp/utils"
	"strings"
	"sync"

	"golang.org/x/crypto/bcrypt"
)

// Send Email via DispatchTenantEmail
func sendEmail(to, subject, htmlBody string) error {
	return DispatchTenantEmail(db, "platform", utils.EmailPayload{
		To:      to,
		Subject: subject,
		HTML:    htmlBody,
	})
}

// SHA256 Token generator for password resets
func generateResetToken(email, currentPassword string) string {
	salt := os.Getenv("RESET_TOKEN_SALT")
	if salt == "" {
		salt = "ofia_erp_secure_token_salt"
	}
	sum := sha256.Sum256([]byte(email + currentPassword + salt))
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

	tenantSlug := r.Header.Get("x-tenant-slug")
	if tenantSlug == "" {
		tenantSlug = req.Tenant
	}
	if tenantSlug == "" {
		tenantSlug = extractTenantSlug(r)
	}

	targetDB := getDBForSlug(tenantSlug)
	if targetDB == nil {
		targetDB = db
	}
	if targetDB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database unavailable"})
		return
	}

	origin := r.Header.Get("Origin")
	if origin == "" {
		if tenantSlug != "" && tenantSlug != "platform" && tenantSlug != "default" {
			origin = fmt.Sprintf("https://%s.ofia.ng", tenantSlug)
		} else {
			origin = os.Getenv("PORTAL_URL")
			if origin == "" {
				origin = "https://erp.ofia.ng"
			}
		}
	}

	// Fetch users from target database
	rows, err := targetDB.Query(`SELECT id, name, email, password FROM "User"`)
	if err != nil && targetDB != db && db != nil {
		rows, err = db.Query(`SELECT id, name, email, password FROM "User"`)
	}
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

	// Secondary check in platform db if user not found in targetDB
	if len(targetUsers) == 0 && targetDB != db && db != nil {
		pRows, pErr := db.Query(`SELECT id, name, email, password FROM "User"`)
		if pErr == nil {
			defer pRows.Close()
			for pRows.Next() {
				var u User
				if err := pRows.Scan(&u.ID, &u.Name, &u.Email, &u.Password); err != nil {
					continue
				}
				if req.Email != "" && strings.ToLower(strings.TrimSpace(u.Email)) == strings.ToLower(strings.TrimSpace(req.Email)) {
					targetUsers = append(targetUsers, u)
				}
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
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #202124; -webkit-font-smoothing: antialiased;">
    <div style="background-color: #f8f9fa; padding: 40px 16px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #dadce0;">
            <div style="padding: 32px 32px 20px; border-bottom: 1px solid #dadce0;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <img src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" alt="Ofia" width="36" height="36" style="display: block; width: 36px; height: 36px; object-fit: contain;">
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                            <span style="font-size: 20px; font-weight: 800; color: #202124; letter-spacing: -0.02em;">Ofia</span>
                        </td>
                    </tr>
                </table>
                <div style="display: inline-block; padding: 4px 12px; background: #e8f0fe; border: 1px solid #d2e3fc; border-radius: 9999px; color: #1a73e8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">
                    OFIA Performance Portal
                </div>
                <h1 style="margin: 16px 0 0; color: #202124; font-size: 22px; font-weight: 600; line-height: 1.3;">Reset Your Password</h1>
            </div>
            <div style="padding: 32px; color: #3c4043; line-height: 1.6; font-size: 14px;">
                <p style="margin: 0 0 16px;">Hello %s,</p>
                <p style="margin: 0 0 16px;">A request has been made to reset the password for your account on the OFIA Performance Portal. Click the authorization button below to choose a new password:</p>
                <div style="text-align: center; margin: 28px 0;">
                    <a href="%s" style="display: inline-block; padding: 12px 32px; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 14px; text-align: center;">Reset Password</a>
                </div>
                <div style="background: #f8f9fa; border: 1px solid #dadce0; border-left: 3px solid #1a73e8; border-radius: 4px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #3c4043;">
                    <strong>Security Notice:</strong> If you did not request this password reset, please ignore this email or contact HR immediately.
                </div>
                <p style="margin: 20px 0 0; color: #3c4043; border-top: 1px solid #dadce0; padding-top: 16px;">Best regards,<br><strong>HR &amp; People Team</strong></p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px 32px; text-align: center; font-size: 12px; color: #70757a; border-top: 1px solid #dadce0; line-height: 1.5;">
                &copy; 2026 OFIA Technologies Ltd. All rights reserved.<br/>
                Mandatory system notification regarding your employee portal access.
            </div>
        </div>
    </div>
</body>
</html>`, u.Name, resetLink)

		wg.Add(1)
		go func(toEmail, subject, body, tSlug string) {
			defer wg.Done()
			err := DispatchTenantEmail(targetDB, tSlug, utils.EmailPayload{
				To:         toEmail,
				Subject:    subject,
				HTML:       body,
				TenantSlug: tSlug,
			})
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
		}(u.Email, "Reset Your Password - OFIA Performance Portal", htmlBody, tenantSlug)
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

	tenantSlug := r.Header.Get("x-tenant-slug")
	if tenantSlug == "" {
		tenantSlug = req.Tenant
	}
	if tenantSlug == "" {
		tenantSlug = extractTenantSlug(r)
	}

	targetDB := getDBForSlug(tenantSlug)
	if targetDB == nil {
		targetDB = db
	}
	if targetDB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database unavailable"})
		return
	}

	// Fetch users from database
	rows, err := targetDB.Query(`SELECT id, name, email FROM "User"`)
	if err != nil && targetDB != db && db != nil {
		rows, err = db.Query(`SELECT id, name, email FROM "User"`)
	}
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
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #202124; -webkit-font-smoothing: antialiased;">
    <div style="background-color: #f8f9fa; padding: 40px 16px;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #dadce0;">
            <div style="padding: 32px 32px 20px; border-bottom: 1px solid #dadce0;">
                <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 14px;">
                    <tr>
                        <td style="vertical-align: middle;">
                            <img src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png" alt="Ofia" width="36" height="36" style="display: block; width: 36px; height: 36px; object-fit: contain;">
                        </td>
                        <td style="vertical-align: middle; padding-left: 10px;">
                            <span style="font-size: 20px; font-weight: 800; color: #202124; letter-spacing: -0.02em;">Ofia</span>
                        </td>
                    </tr>
                </table>
                <div style="display: inline-block; padding: 4px 12px; background: #e8f0fe; border: 1px solid #d2e3fc; border-radius: 9999px; color: #1a73e8; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em;">
                    OFIA Performance Portal
                </div>
                <h1 style="margin: 16px 0 0; color: #202124; font-size: 22px; font-weight: 600; line-height: 1.3;">Notification Alert</h1>
            </div>
            <div style="padding: 32px; color: #3c4043; line-height: 1.6; font-size: 14px;">
                <p style="margin: 0 0 16px;">Hello %s,</p>
                <div style="background: #f8f9fa; border: 1px solid #dadce0; border-left: 3px solid #1a73e8; border-radius: 4px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #3c4043; line-height: 1.6;">
                    %s
                </div>
                <p style="margin: 20px 0 0; color: #3c4043; border-top: 1px solid #dadce0; padding-top: 16px;">Best regards,<br><strong>HR &amp; Performance Team</strong></p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px 32px; text-align: center; font-size: 12px; color: #70757a; border-top: 1px solid #dadce0; line-height: 1.5;">
                &copy; 2026 OFIA Technologies Ltd. All rights reserved.<br/>
                Mandatory system notification regarding your enterprise account.
            </div>
        </div>
    </div>
</body>
</html>`, u.Name, formattedMsg)

		wg.Add(1)
		go func(toEmail, subject, body, tSlug string) {
			defer wg.Done()
			err := DispatchTenantEmail(targetDB, tSlug, utils.EmailPayload{
				To:         toEmail,
				Subject:    subject,
				HTML:       body,
				TenantSlug: tSlug,
			})
			if err == nil {
				mu.Lock()
				successCount++
				mu.Unlock()
			} else {
				log.Printf("Failed to send notification email to %s: %v", toEmail, err)
			}
		}(u.Email, req.Subject, htmlBody, tenantSlug)
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

	newPwd := strings.TrimSpace(req.NewPassword)
	if newPwd == "" {
		newPwd = strings.TrimSpace(req.NewPasswordSnake)
	}
	if newPwd == "" {
		newPwd = strings.TrimSpace(req.Password)
	}

	req.Email = strings.TrimSpace(req.Email)
	req.Token = strings.TrimSpace(req.Token)

	if req.Email == "" || req.Token == "" || newPwd == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Email, Token, and new password are required"})
		return
	}

	tenantSlug := r.Header.Get("x-tenant-slug")
	if tenantSlug == "" {
		tenantSlug = req.Tenant
	}
	if tenantSlug == "" {
		tenantSlug = extractTenantSlug(r)
	}

	targetDB := getDBForSlug(tenantSlug)
	if targetDB == nil {
		targetDB = db
	}
	if targetDB == nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Database unavailable"})
		return
	}

	// Fetch user from target database
	tx, err := targetDB.Begin()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Failed to begin transaction: " + err.Error()})
		return
	}
	defer tx.Rollback()

	var u User
	err = tx.QueryRow(`SELECT id, name, email, password FROM "User" WHERE LOWER(email) = LOWER($1)`, req.Email).Scan(&u.ID, &u.Name, &u.Email, &u.Password)
	if err != nil && targetDB != db && db != nil {
		// Try finding in platform DB if user not in tenant DB
		err = db.QueryRow(`SELECT id, name, email, password FROM "User" WHERE LOWER(email) = LOWER($1)`, req.Email).Scan(&u.ID, &u.Name, &u.Email, &u.Password)
	}
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

	// Compute hashed password (ensure it's a bcrypt hash)
	hashedPassword := newPwd
	if !strings.HasPrefix(newPwd, "$2a$") && !strings.HasPrefix(newPwd, "$2b$") {
		hBytes, errHash := bcrypt.GenerateFromPassword([]byte(newPwd), 10)
		if errHash != nil {
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{"error": "Failed to hash password"})
			return
		}
		hashedPassword = string(hBytes)
	}

	// Update password in database
	_, err = tx.Exec(`UPDATE "User" SET password = $1 WHERE LOWER(email) = LOWER($2)`, hashedPassword, req.Email)
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

	// Also synchronize password to platform DB if targetDB != db
	if targetDB != db && db != nil {
		_, _ = db.Exec(`UPDATE "User" SET password = $1 WHERE LOWER(email) = LOWER($2)`, hashedPassword, req.Email)
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success", "message": "Password updated successfully"})
}

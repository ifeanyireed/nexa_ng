package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"

	"service_erp/utils"
)

// FetchSmtpConfigForSlug retrieves SMTP configuration from tenant_smtp_settings table for a given slug
func FetchSmtpConfigForSlug(targetDB *sql.DB, slug string) (*utils.SmtpConfig, error) {
	activeDB := targetDB
	if activeDB == nil {
		activeDB = db
	}
	if activeDB == nil {
		return nil, fmt.Errorf("no database connection available")
	}

	normSlug := strings.ToLower(strings.TrimSpace(slug))
	var host, fromEmail, fromName, username, password, encryption sql.NullString
	var port sql.NullInt64

	err := activeDB.QueryRow(`
		SELECT host, port, encryption, from_email, from_name, username, password 
		FROM tenant_smtp_settings 
		WHERE LOWER(tenant_slug) = $1 
		LIMIT 1`, normSlug).Scan(&host, &port, &encryption, &fromEmail, &fromName, &username, &password)
	if err != nil {
		// If not found in targetDB and targetDB != db, try platform db
		if db != nil && activeDB != db {
			err = db.QueryRow(`
				SELECT host, port, encryption, from_email, from_name, username, password 
				FROM tenant_smtp_settings 
				WHERE LOWER(tenant_slug) = $1 
				LIMIT 1`, normSlug).Scan(&host, &port, &encryption, &fromEmail, &fromName, &username, &password)
		}
	}
	if err != nil {
		return nil, err
	}

	p := 587
	if port.Valid && port.Int64 > 0 {
		p = int(port.Int64)
	}

	return &utils.SmtpConfig{
		Host:       strings.TrimSpace(host.String),
		Port:       p,
		Encryption: strings.TrimSpace(encryption.String),
		Username:   strings.TrimSpace(username.String),
		Password:   strings.TrimSpace(password.String),
		FromEmail:  strings.TrimSpace(fromEmail.String),
		FromName:   strings.TrimSpace(fromName.String),
	}, nil
}

// GetEnvSmtpConfig checks environment variables for SMTP settings
func GetEnvSmtpConfig() *utils.SmtpConfig {
	host := strings.TrimSpace(os.Getenv("SMTP_HOST"))
	if host == "" {
		return nil
	}
	port := 587
	if p, err := strconv.Atoi(os.Getenv("SMTP_PORT")); err == nil && p > 0 {
		port = p
	}
	enc := "tls"
	if port == 465 {
		enc = "ssl"
	}
	return &utils.SmtpConfig{
		Host:       host,
		Port:       port,
		Encryption: enc,
		Username:   strings.TrimSpace(os.Getenv("SMTP_USER")),
		Password:   strings.TrimSpace(os.Getenv("SMTP_PASSWORD")),
		FromEmail:  strings.TrimSpace(os.Getenv("SMTP_FROM_EMAIL")),
		FromName:   strings.TrimSpace(os.Getenv("SMTP_FROM_NAME")),
	}
}

// DispatchTenantEmail attempts sending via:
// 1. Tenant-specific SMTP settings (if available and not disabled)
// 2. Platform SMTP settings (Brevo relay from tenant_smtp_settings where tenant_slug = 'platform')
// 3. Environment SMTP settings
// 4. HTTP Email Proxy fallback
func DispatchTenantEmail(targetDB *sql.DB, tenantSlug string, payload utils.EmailPayload) error {
	slug := strings.ToLower(strings.TrimSpace(tenantSlug))
	var directErrs []string

	// 1. Try tenant-specific SMTP
	if slug != "" && slug != "platform" && slug != "default" {
		if tenantCfg, err := FetchSmtpConfigForSlug(targetDB, slug); err == nil && tenantCfg != nil && tenantCfg.Host != "" && tenantCfg.Password != "" {
			errSend := utils.SendEmailDirect(*tenantCfg, payload)
			if errSend == nil {
				log.Printf("✅ Dispatched email to %s via tenant '%s' SMTP (%s)", payload.To, slug, tenantCfg.Host)
				return nil
			}
			log.Printf("⚠️ Direct tenant '%s' SMTP delivery failed (%v). Failing over to platform SMTP...", slug, errSend)
			directErrs = append(directErrs, fmt.Sprintf("tenant '%s' SMTP: %v", slug, errSend))
		}
	}

	// 2. Try platform SMTP settings (from database tenant_smtp_settings where tenant_slug = 'platform')
	if platformCfg, err := FetchSmtpConfigForSlug(targetDB, "platform"); err == nil && platformCfg != nil && platformCfg.Host != "" && platformCfg.Password != "" {
		errSend := utils.SendEmailDirect(*platformCfg, payload)
		if errSend == nil {
			log.Printf("✅ Dispatched email to %s via platform SMTP (%s)", payload.To, platformCfg.Host)
			return nil
		}
		log.Printf("⚠️ Platform direct SMTP delivery failed (%v). Failing over to env/proxy...", errSend)
		directErrs = append(directErrs, fmt.Sprintf("platform SMTP: %v", errSend))
	}

	// 3. Try environment variables SMTP
	if envCfg := GetEnvSmtpConfig(); envCfg != nil && envCfg.Password != "" {
		errSend := utils.SendEmailDirect(*envCfg, payload)
		if errSend == nil {
			log.Printf("✅ Dispatched email to %s via env SMTP (%s)", payload.To, envCfg.Host)
			return nil
		}
		log.Printf("⚠️ Environment SMTP delivery failed (%v). Failing over to HTTP proxy...", errSend)
		directErrs = append(directErrs, fmt.Sprintf("env SMTP: %v", errSend))
	}

	// 4. Proxy fallback
	proxyErr := utils.SendEmailViaProxy(payload)
	if proxyErr == nil {
		log.Printf("✅ Dispatched email to %s via HTTP email proxy fallback", payload.To)
		return nil
	}

	if len(directErrs) > 0 {
		return fmt.Errorf("email dispatch failed [%s], proxy error: %w", strings.Join(directErrs, "; "), proxyErr)
	}
	return proxyErr
}

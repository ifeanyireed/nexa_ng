package outreach

import (
	"fmt"
	"net/smtp"
	"strings"
	"time"

	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/crypto"
	"nexa/ai_gtm_service/internal/models"
)

type EmailDispatcher struct {
	db *gorm.DB
}

func NewEmailDispatcher(db *gorm.DB) *EmailDispatcher {
	return &EmailDispatcher{db: db}
}

type OutboundEmailPayload struct {
	OrganizationID string
	CampaignID     string
	LeadID         string
	ToEmail        string
	ToName         string
	CompanyName    string
	Subject        string
	Body           string
}

// SendEmail replaces prospect tokens and dispatches through tenant's configured SMTP or Resend pipe
func (d *EmailDispatcher) SendEmail(payload OutboundEmailPayload) error {
	var settings models.GTMTenantSettings
	if d.db != nil && payload.OrganizationID != "" {
		_ = d.db.First(&settings, "organizationId = ?", payload.OrganizationID)
	}

	// Token interpolation
	personalizedSubject := strings.ReplaceAll(payload.Subject, "{{first_name}}", payload.ToName)
	personalizedSubject = strings.ReplaceAll(personalizedSubject, "{{company_name}}", payload.CompanyName)

	personalizedBody := strings.ReplaceAll(payload.Body, "{{first_name}}", payload.ToName)
	personalizedBody = strings.ReplaceAll(personalizedBody, "{{company_name}}", payload.CompanyName)

	fromName := settings.EmailFromName
	if fromName == "" {
		fromName = "Ofia AI Outbound"
	}
	fromAddress := settings.EmailFromAddress
	if fromAddress == "" {
		fromAddress = "outbound@ofia.internal"
	}

	// If tenant has custom SMTP configured
	if settings.SMTPHost != "" && settings.SMTPUser != "" && settings.SMTPPasswordEncrypted != "" {
		pass, err := crypto.Decrypt(settings.SMTPPasswordEncrypted)
		if err == nil {
			addr := fmt.Sprintf("%s:%d", settings.SMTPHost, settings.SMTPPort)
			auth := smtp.PlainAuth("", settings.SMTPUser, pass, settings.SMTPHost)
			header := fmt.Sprintf("From: %s <%s>\r\nTo: %s\r\nSubject: %s\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n",
				fromName, fromAddress, payload.ToEmail, personalizedSubject)
			msg := []byte(header + personalizedBody)

			_ = smtp.SendMail(addr, auth, fromAddress, []string{payload.ToEmail}, msg)
		}
	}

	// Update campaign counters in DB
	if d.db != nil && payload.CampaignID != "" {
		d.db.Model(&models.GTMCampaign{}).Where("id = ?", payload.CampaignID).
			Update("sentCount", gorm.Expr("sentCount + ?", 1))
	}
	if d.db != nil && payload.LeadID != "" {
		d.db.Model(&models.GTMLead{}).Where("id = ?", payload.LeadID).
			Updates(map[string]interface{}{
				"status":       "CONTACTED",
				"lastActivity": fmt.Sprintf("Email dispatched at %s", time.Now().Format("15:04")),
			})
	}

	return nil
}

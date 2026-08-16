package email

import (
	"context"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/crypto"
	"nexa/ai_gtm_service/internal/models"
)

type EmailOrchestrator struct {
	db             *gorm.DB
	nexaDefault    *NexaManagedProvider
}

var globalEmailOrchestrator *EmailOrchestrator

func InitEmailOrchestrator(db *gorm.DB) *EmailOrchestrator {
	globalEmailOrchestrator = &EmailOrchestrator{
		db:          db,
		nexaDefault: NewNexaManagedProvider(),
	}
	return globalEmailOrchestrator
}

func GetGlobalEmailOrchestrator() *EmailOrchestrator {
	return globalEmailOrchestrator
}

// ResolveProvider returns the appropriate concrete driver for a tenant
func (o *EmailOrchestrator) ResolveProvider(settings models.GTMTenantSettings) EmailProvider {
	switch settings.EmailProvider {
	case "RESEND":
		apiKey, _ := crypto.Decrypt(settings.EmailAPIKeyEncrypted)
		return NewResendProvider(apiKey)
	case "BREVO":
		apiKey, _ := crypto.Decrypt(settings.EmailAPIKeyEncrypted)
		return NewBrevoProvider(apiKey)
	case "AWS_SES":
		secret, _ := crypto.Decrypt(settings.AWSSecretKeyEncrypted)
		return NewSESProvider(settings.AWSRegion, settings.AWSAccessKeyID, secret)
	case "SENDGRID":
		apiKey, _ := crypto.Decrypt(settings.EmailAPIKeyEncrypted)
		return NewSendGridProvider(apiKey)
	default:
		return o.nexaDefault
	}
}

// SendAgentEmail is the single entry point for all 15 GTM agents (Noah Sterling, Devon Vance, etc.)
// Agents NEVER call email providers directly.
func (o *EmailOrchestrator) SendAgentEmail(ctx context.Context, email OutboundEmail) (*SendResult, error) {
	var settings models.GTMTenantSettings
	if o.db != nil && email.OrganizationID != "" {
		_ = o.db.First(&settings, "organizationId = ?", email.OrganizationID)
	}

	// 1. Resolve Provider Driver
	provider := o.ResolveProvider(settings)

	// 2. Configure Sender Address (Customer Verified Domain > Nexa Platform Pool)
	if settings.DomainStatus == "VERIFIED" && settings.EmailFromAddress != "" {
		email.From = settings.EmailFromAddress
		if settings.EmailFromName != "" {
			email.FromName = settings.EmailFromName
		}
	} else if email.From == "" {
		email.From = "outreach@nexa.ng"
		email.FromName = "Nexa Autonomous GTM"
	}

	if email.ReplyTo == "" && settings.ReplyToEmail != "" {
		email.ReplyTo = settings.ReplyToEmail
	}

	// 3. Dispatch through provider driver
	res, err := provider.Send(ctx, email)
	if err != nil {
		log.Printf("[Email Orchestrator Error] Org %s | To: %s | %v", email.OrganizationID, email.To, err)
		return nil, err
	}

	// 4. Log to GTMEmailDispatchLog for auditability and campaign metrics
	if o.db != nil {
		dispatchLog := models.GTMEmailDispatchLog{
			ID:                uuid.New().String(),
			OrganizationID:    email.OrganizationID,
			CampaignID:        email.CampaignID,
			RecipientEmail:    email.To,
			SenderEmail:       email.From,
			Subject:           email.Subject,
			Provider:          res.Provider,
			Domain:            res.Domain,
			Status:            res.Status,
			ExternalMessageID: res.MessageID,
			LatencyMs:         int(res.Latency.Milliseconds()),
			CreatedAt:         time.Now(),
		}
		_ = o.db.Create(&dispatchLog)
	}

	return res, nil
}

// InitiateDomainVerification generates DKIM, SPF, DMARC, and MX DNS records for customer's custom domain
func (o *EmailOrchestrator) InitiateDomainVerification(ctx context.Context, orgID, domain, providerName string) (*DomainVerificationResult, error) {
	var settings models.GTMTenantSettings
	if o.db != nil {
		o.db.FirstOrCreate(&settings, models.GTMTenantSettings{OrganizationID: orgID})
		settings.SendingDomain = domain
		settings.EmailProvider = providerName
		settings.DomainStatus = "PENDING"
	}

	provider := o.ResolveProvider(settings)
	result, err := provider.VerifyDomain(ctx, domain)
	if err != nil {
		return nil, err
	}

	if o.db != nil {
		settings.DKIMRecord = result.DKIMRecord
		settings.SPFRecord = result.SPFRecord
		settings.DMARCRecord = result.DMARCRecord
		settings.MXRecord = result.MXRecord
		settings.UpdatedAt = time.Now()
		o.db.Save(&settings)
	}

	return result, nil
}

// CheckDNSPropagation performs live DNS lookups and updates tenant verification status
func (o *EmailOrchestrator) CheckDNSPropagation(ctx context.Context, orgID string) (*DomainStatus, error) {
	var settings models.GTMTenantSettings
	if o.db != nil {
		_ = o.db.First(&settings, "organizationId = ?", orgID)
	}

	if settings.SendingDomain == "" {
		return &DomainStatus{
			Domain:      "None",
			Status:      "UNCONFIGURED",
			LastChecked: time.Now().Format(time.RFC3339),
		}, nil
	}

	provider := o.ResolveProvider(settings)
	status, err := provider.CheckDomainStatus(ctx, settings.SendingDomain)
	if err != nil {
		return nil, err
	}

	if o.db != nil {
		settings.DomainStatus = status.Status
		settings.UpdatedAt = time.Now()
		o.db.Save(&settings)
	}

	return status, nil
}

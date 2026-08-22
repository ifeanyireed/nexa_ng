package subscription

import (
	"errors"
	"fmt"
	"time"
	"nexa/user_subscription_service/internal/models"
	"gorm.io/gorm"
)

type SubscriptionService struct {
	db *gorm.DB
}

func NewSubscriptionService(db *gorm.DB) *SubscriptionService {
	return &SubscriptionService{db: db}
}

type TenantSubscriptionSummary struct {
	OrganizationID string    `json:"organization_id"`
	PlanTier       models.PlanTier `json:"plan_tier"`
	Status         string    `json:"status"`
	CurrentLimits  PlanLimit `json:"limits"`
	CurrentUsage   *models.OrganizationUsage `json:"usage"`
	DaysRemaining  int       `json:"days_remaining"`
}

// GetTenantSubscription fetches the active subscription and merges with centrally calculated SubscriptionHelper limits
func (s *SubscriptionService) GetTenantSubscription(orgID string) (*TenantSubscriptionSummary, error) {
	var org models.Organization
	if err := s.db.Preload("Subscription").First(&org, "id = ?", orgID).Error; err != nil {
		return nil, fmt.Errorf("organization not found: %w", err)
	}

	planTier := org.PlanTier
	if org.Subscription != nil && org.Subscription.PlanTier != "" {
		planTier = org.Subscription.PlanTier
	}

	// Always get centralized limits from SubscriptionHelper
	limits := GetLimitsForTier(planTier)

	// Fetch current month's usage
	period := time.Now().Format("2006-01")
	var usage models.OrganizationUsage
	if err := s.db.FirstOrCreate(&usage, models.OrganizationUsage{
		OrganizationID: orgID,
		Period:         period,
	}).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch usage: %w", err)
	}

	daysRemaining := 30
	if org.Subscription != nil && !org.Subscription.CurrentPeriodEnd.IsZero() {
		diff := time.Until(org.Subscription.CurrentPeriodEnd)
		daysRemaining = int(diff.Hours() / 24)
		if daysRemaining < 0 {
			daysRemaining = 0
		}
	}

	status := "ACTIVE"
	if org.Subscription != nil {
		status = org.Subscription.Status
	}

	return &TenantSubscriptionSummary{
		OrganizationID: orgID,
		PlanTier:       planTier,
		Status:         status,
		CurrentLimits:  limits,
		CurrentUsage:   &usage,
		DaysRemaining:  daysRemaining,
	}, nil
}

// CanExtractLeads enforces lead limits
func (s *SubscriptionService) CanExtractLeads(orgID string, requestedCount int) (bool, error) {
	summary, err := s.GetTenantSubscription(orgID)
	if err != nil {
		return false, err
	}

	if summary.Status == "SUSPENDED" {
		return false, errors.New("organization workspace is suspended")
	}

	if summary.CurrentUsage.LeadsResearched+requestedCount > summary.CurrentLimits.MaxMonthlyLeads {
		return false, fmt.Errorf("monthly lead limit reached: limit is %d, currently used %d", summary.CurrentLimits.MaxMonthlyLeads, summary.CurrentUsage.LeadsResearched)
	}

	return true, nil
}

// CanLaunchCampaign enforces campaign concurrency limits
func (s *SubscriptionService) CanLaunchCampaign(orgID string, currentActiveCampaigns int) (bool, error) {
	summary, err := s.GetTenantSubscription(orgID)
	if err != nil {
		return false, err
	}

	if currentActiveCampaigns >= summary.CurrentLimits.MaxActiveCampaigns {
		return false, fmt.Errorf("active campaign limit reached: limit is %d, currently running %d", summary.CurrentLimits.MaxActiveCampaigns, currentActiveCampaigns)
	}

	return true, nil
}

// IncrementUsage updates the monthly usage counter atomically
func (s *SubscriptionService) IncrementUsage(orgID string, leads int, emails int, whatsApp int, tokens int64, costUSD float64) error {
	period := time.Now().Format("2006-01")
	return s.db.Exec(`
		INSERT INTO OrganizationUsage (id, organizationId, period, leadsResearched, emailsSent, whatsAppMessagesSent, aiTokensUsed, aiCostUSD, updatedAt)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
		ON DUPLICATE KEY UPDATE
			leadsResearched = leadsResearched + VALUES(leadsResearched),
			emailsSent = emailsSent + VALUES(emailsSent),
			whatsAppMessagesSent = whatsAppMessagesSent + VALUES(whatsAppMessagesSent),
			aiTokensUsed = aiTokensUsed + VALUES(aiTokensUsed),
			aiCostUSD = aiCostUSD + VALUES(aiCostUSD),
			updatedAt = NOW()
	`, fmt.Sprintf("use-%s-%s", orgID, period), orgID, period, leads, emails, whatsApp, tokens, costUSD).Error
}

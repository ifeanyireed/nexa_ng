package subscription

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/models"
)

type SubscriptionService struct {
	db *gorm.DB
}

func NewSubscriptionService(db *gorm.DB) *SubscriptionService {
	return &SubscriptionService{db: db}
}

type TenantSubscriptionSummary struct {
	OrganizationID string                    `json:"organization_id"`
	Slug           string                    `json:"slug"`
	PlanTier       models.PlanTier           `json:"plan_tier"`
	BillingCycle   string                    `json:"billing_cycle"`
	Status         string                    `json:"status"`
	CurrentLimits  PlanLimit                 `json:"limits"`
	CurrentModules TierModulePreset          `json:"modules"`
	CurrentUsage   *models.OrganizationUsage `json:"usage"`
	ExtraLeads     int                       `json:"extra_leads"`
	ExtraCampaigns int                       `json:"extra_campaigns"`
	ExtraSeats     int                       `json:"extra_seats"`
	DaysRemaining  int                       `json:"days_remaining"`
}

// resolveOrg finds an Organization by ID, slug, or case-insensitive slug
func (s *SubscriptionService) resolveOrg(orgIdentifier string) (*models.Organization, error) {
	if s.db == nil {
		return nil, errors.New("database unavailable")
	}
	var org models.Organization
	clean := strings.TrimSpace(orgIdentifier)
	err := s.db.Preload("Subscription").
		Where("id = ? OR LOWER(slug) = LOWER(?)", clean, clean).
		First(&org).Error
	if err != nil {
		return nil, fmt.Errorf("organization not found: %w", err)
	}
	return &org, nil
}

// GetTenantSubscription fetches the active subscription and merges with centrally calculated SubscriptionHelper limits
func (s *SubscriptionService) GetTenantSubscription(orgID string) (*TenantSubscriptionSummary, error) {
	org, err := s.resolveOrg(orgID)
	if err != nil {
		return nil, err
	}

	planTier := org.PlanTier
	billingCycle := org.BillingCycle
	if billingCycle == "" {
		billingCycle = "MONTHLY"
	}

	extraLeads := 0
	extraCampaigns := 0
	extraSeats := 0

	if org.Subscription != nil {
		if org.Subscription.PlanTier != "" {
			planTier = org.Subscription.PlanTier
		}
		if org.Subscription.BillingCycle != "" {
			billingCycle = org.Subscription.BillingCycle
		}
		extraLeads = org.Subscription.ExtraLeads
		extraCampaigns = org.Subscription.ExtraCampaigns
		extraSeats = org.Subscription.ExtraSeats
	}

	// Always get centralized limits from SubscriptionHelper and apply any extra quota overrides
	limits := GetLimitsForTier(planTier)
	limits.MaxMonthlyLeads += extraLeads
	limits.MaxActiveCampaigns += extraCampaigns
	limits.MaxTeamSeats += extraSeats

	modules := GetModulesForTierAndVertical(planTier, org.Vertical)

	// Fetch current month's usage
	period := time.Now().Format("2006-01")
	var usage models.OrganizationUsage
	if err := s.db.Where("organization_id = ? AND period = ?", org.ID, period).First(&usage).Error; err != nil {
		usage = models.OrganizationUsage{
			ID:             fmt.Sprintf("use-%s-%s", org.ID, period),
			OrganizationID: org.ID,
			Period:         period,
			UpdatedAt:      time.Now(),
		}
		_ = s.db.Create(&usage).Error
	}

	daysRemaining := 30
	status := org.Status
	if status == "" {
		status = "ACTIVE"
	}
	if org.Subscription != nil && org.Subscription.Status != "" {
		status = org.Subscription.Status
	}

	if org.Subscription != nil && !org.Subscription.CurrentPeriodEnd.IsZero() {
		diff := time.Until(org.Subscription.CurrentPeriodEnd)
		daysRemaining = int(diff.Hours() / 24)
		if daysRemaining < 0 {
			daysRemaining = 0
		}
	}

	return &TenantSubscriptionSummary{
		OrganizationID: org.ID,
		Slug:           org.Slug,
		PlanTier:       planTier,
		BillingCycle:   billingCycle,
		Status:         status,
		CurrentLimits:  limits,
		CurrentModules: modules,
		CurrentUsage:   &usage,
		ExtraLeads:     extraLeads,
		ExtraCampaigns: extraCampaigns,
		ExtraSeats:     extraSeats,
		DaysRemaining:  daysRemaining,
	}, nil
}

// CanExtractLeads enforces lead limits and active subscription status
func (s *SubscriptionService) CanExtractLeads(orgID string, requestedCount int) (bool, error) {
	summary, err := s.GetTenantSubscription(orgID)
	if err != nil {
		return false, err
	}

	if strings.EqualFold(summary.Status, "SUSPENDED") || strings.EqualFold(summary.Status, "EXPIRED") {
		return false, fmt.Errorf("organization workspace is %s", strings.ToLower(summary.Status))
	}

	if summary.CurrentUsage.LeadsResearched+requestedCount > summary.CurrentLimits.MaxMonthlyLeads {
		return false, fmt.Errorf(
			"monthly lead limit reached for %s plan: limit is %d, currently used %d",
			summary.PlanTier,
			summary.CurrentLimits.MaxMonthlyLeads,
			summary.CurrentUsage.LeadsResearched,
		)
	}

	return true, nil
}

// CanLaunchCampaign enforces campaign concurrency limits and active subscription status
func (s *SubscriptionService) CanLaunchCampaign(orgID string, currentActiveCampaigns int) (bool, error) {
	summary, err := s.GetTenantSubscription(orgID)
	if err != nil {
		return false, err
	}

	if strings.EqualFold(summary.Status, "SUSPENDED") || strings.EqualFold(summary.Status, "EXPIRED") {
		return false, fmt.Errorf("organization workspace is %s", strings.ToLower(summary.Status))
	}

	if currentActiveCampaigns >= summary.CurrentLimits.MaxActiveCampaigns {
		return false, fmt.Errorf(
			"active campaign limit reached for %s plan: limit is %d, currently running %d",
			summary.PlanTier,
			summary.CurrentLimits.MaxActiveCampaigns,
			currentActiveCampaigns,
		)
	}

	return true, nil
}

// IncrementUsage updates the monthly usage counter atomically using PostgreSQL ON CONFLICT
func (s *SubscriptionService) IncrementUsage(orgID string, leads int, emails int, whatsApp int, tokens int64, costUSD float64) error {
	if s.db == nil {
		return errors.New("database unavailable")
	}
	org, err := s.resolveOrg(orgID)
	targetOrgID := orgID
	if err == nil && org != nil {
		targetOrgID = org.ID
	}

	period := time.Now().Format("2006-01")
	usageID := fmt.Sprintf("use-%s-%s", targetOrgID, period)

	return s.db.Exec(`
		INSERT INTO "OrganizationUsage" (
			id, organization_id, period, leads_researched, emails_sent,
			whatsapp_messages_sent, ai_tokens_used, ai_cost_usd, updated_at
		)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
		ON CONFLICT (organization_id, period) DO UPDATE SET
			leads_researched = "OrganizationUsage".leads_researched + EXCLUDED.leads_researched,
			emails_sent = "OrganizationUsage".emails_sent + EXCLUDED.emails_sent,
			whatsapp_messages_sent = "OrganizationUsage".whatsapp_messages_sent + EXCLUDED.whatsapp_messages_sent,
			ai_tokens_used = "OrganizationUsage".ai_tokens_used + EXCLUDED.ai_tokens_used,
			ai_cost_usd = "OrganizationUsage".ai_cost_usd + EXCLUDED.ai_cost_usd,
			updated_at = NOW()
	`, usageID, targetOrgID, period, leads, emails, whatsApp, tokens, costUSD).Error
}

// SyncTenantModulesForTier aligns both platform_tenants and TenantRolePermission tables with the tenant's plan_tier
func (s *SubscriptionService) SyncTenantModulesForTier(org *models.Organization, tier models.PlanTier, status string) {
	if s.db == nil || org == nil {
		return
	}

	limits := GetLimitsForTier(tier)
	preset := GetModulesForTierAndVertical(tier, org.Vertical)

	erpJSON, _ := json.Marshal(preset.ERPModules)
	shopJSON, _ := json.Marshal(preset.ShopSubModules)
	mobJSON, _ := json.Marshal(preset.MobilitySubModules)

	normStatus := "Active"
	if strings.EqualFold(status, "SUSPENDED") {
		normStatus = "Suspended"
	} else if strings.EqualFold(status, "PAST_DUE") {
		normStatus = "Past Due"
	}

	// 1. Update platform_tenants table in Master Postgres if present
	_ = s.db.Exec(`
		UPDATE platform_tenants
		SET plan_tier = $1,
		    status = $2,
		    mrr = $3,
		    erp_modules = $4::jsonb,
		    shop_sub_modules = $5::jsonb,
		    mobility_sub_modules = $6::jsonb,
		    updated_at = NOW()
		WHERE LOWER(slug) = LOWER($7) OR id = $8
	`, string(tier), normStatus, int(limits.MonthlyPriceNGN), string(erpJSON), string(shopJSON), string(mobJSON), org.Slug, org.ID)

	// 2. Update Organization.shop_sub_modules
	_ = s.db.Model(&models.Organization{}).Where("id = ?", org.ID).Updates(map[string]interface{}{
		"plan_tier":        tier,
		"status":           strings.ToUpper(status),
		"shop_sub_modules": string(shopJSON),
		"updated_at":       time.Now(),
	})

	// 3. Sync TenantRolePermission baseline roles ('tenant_provision' and 'admin') in central DB
	slug := strings.ToLower(strings.TrimSpace(org.Slug))
	targets := []string{slug}
	if org.ID != "" && org.ID != slug {
		targets = append(targets, org.ID)
	}

	roles := []string{"tenant_provision", "admin"}
	allModules := make(map[string]bool)
	for k, v := range preset.ERPModules {
		allModules[k] = v
	}
	for k, v := range preset.ShopSubModules {
		allModules[k] = preset.ERPModules["shop"] && v
	}
	for k, v := range preset.MobilitySubModules {
		allModules[k] = preset.ERPModules["mobility"] && v
	}
	allModules["mission"] = true
	allModules["overview"] = true
	allModules["sales_closer"] = preset.ERPModules["crm"]
	allModules["employee"] = preset.ERPModules["users"]
	allModules["manager"] = preset.ERPModules["users"]
	allModules["md"] = preset.ERPModules["users"]

	// If tenant is SUSPENDED, revoke non-overview modules at the tenant_provision layer
	if strings.EqualFold(status, "SUSPENDED") {
		for k := range allModules {
			if k != "overview" && k != "mission" {
				allModules[k] = false
			}
		}
	}

	for _, targetID := range targets {
		for _, role := range roles {
			for modKey, isEnabled := range allModules {
				permID := fmt.Sprintf("%s_%s_%s", targetID, role, modKey)
				_ = s.db.Exec(`
					INSERT INTO "TenantRolePermission" (id, "tenantId", role, "moduleKey", "isEnabled", "createdAt", "updatedAt")
					VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
					ON CONFLICT ("tenantId", role, "moduleKey") DO UPDATE SET
						"isEnabled" = EXCLUDED."isEnabled",
						"updatedAt" = NOW()
				`, permID, targetID, role, modKey, isEnabled)
			}
		}
	}
}

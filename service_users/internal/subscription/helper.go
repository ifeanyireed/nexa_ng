package subscription

import (
	"strings"

	"nexa/user_subscription_service/internal/models"
)

// PlanLimit defines the single-source-of-truth quota entitlements for a plan tier
type PlanLimit struct {
	Tier                  models.PlanTier `json:"tier"`
	Name                  string          `json:"name"`
	MonthlyPriceNGN       float64         `json:"monthly_price_ngn"`
	AnnualPriceNGN        float64         `json:"annual_price_ngn"`
	MonthlyPriceUSD       float64         `json:"monthly_price_usd"`
	AnnualPriceUSD        float64         `json:"annual_price_usd"`
	DirectFeePercent      float64         `json:"direct_fee_percent"`
	EscrowFeePercent      float64         `json:"escrow_fee_percent"`
	MaxProjects           int             `json:"max_projects"`
	MaxProducts           int             `json:"max_products"`
	MaxTeamSeats          int             `json:"max_team_seats"`
	MaxMonthlyLeads       int             `json:"max_monthly_leads"`
	MaxActiveCampaigns    int             `json:"max_active_campaigns"`
	MaxDailyEmails        int             `json:"max_daily_emails"`
	MaxMonthlyAITokens    int64           `json:"max_monthly_ai_tokens"`
	AllowedChannels       []string        `json:"allowed_channels"`
	VoiceAssistantEnabled bool            `json:"voice_assistant_enabled"`
	BYOKAllowed           bool            `json:"byok_allowed"`
	PrioritySupport       bool            `json:"priority_support"`
}

// TierModulePreset defines the ERP, Shop, and Mobility module entitlements for a given tier & vertical
type TierModulePreset struct {
	ERPModules         map[string]bool `json:"erp_modules"`
	ShopSubModules     map[string]bool `json:"shop_sub_modules"`
	MobilitySubModules map[string]bool `json:"mobility_sub_modules"`
}

// PlanLimits centrally defines and manages all tier entitlements across the platform
var PlanLimits = map[models.PlanTier]PlanLimit{
	models.PlanFreeTrial: {
		Tier:                  models.PlanFreeTrial,
		Name:                  "Free Trial (14-Day Pilot)",
		MonthlyPriceNGN:       0,
		AnnualPriceNGN:        0,
		MonthlyPriceUSD:       0,
		AnnualPriceUSD:        0,
		DirectFeePercent:      2.5,
		EscrowFeePercent:      5.0,
		MaxProjects:           1,
		MaxProducts:           50,
		MaxTeamSeats:          2,
		MaxMonthlyLeads:       250,
		MaxActiveCampaigns:    1,
		MaxDailyEmails:        50,
		MaxMonthlyAITokens:    250_000,
		AllowedChannels:       []string{"Email", "Storefront"},
		VoiceAssistantEnabled: false,
		BYOKAllowed:           false,
		PrioritySupport:       false,
	},
	models.PlanStarter: {
		Tier:                  models.PlanStarter,
		Name:                  "Ofia Launch (Starter)",
		MonthlyPriceNGN:       25_000,
		AnnualPriceNGN:        250_000,
		MonthlyPriceUSD:       20,
		AnnualPriceUSD:        200,
		DirectFeePercent:      2.0,
		EscrowFeePercent:      4.5,
		MaxProjects:           1,
		MaxProducts:           500,
		MaxTeamSeats:          5,
		MaxMonthlyLeads:       1_500,
		MaxActiveCampaigns:    3,
		MaxDailyEmails:        250,
		MaxMonthlyAITokens:    2_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "Storefront"},
		VoiceAssistantEnabled: false,
		BYOKAllowed:           false,
		PrioritySupport:       false,
	},
	models.PlanGrowth: {
		Tier:                  models.PlanGrowth,
		Name:                  "Ofia Growth (Business Pro)",
		MonthlyPriceNGN:       75_000,
		AnnualPriceNGN:        750_000,
		MonthlyPriceUSD:       55,
		AnnualPriceUSD:        550,
		DirectFeePercent:      1.25,
		EscrowFeePercent:      3.5,
		MaxProjects:           3,
		MaxProducts:           5_000,
		MaxTeamSeats:          15,
		MaxMonthlyLeads:       10_000,
		MaxActiveCampaigns:    10,
		MaxDailyEmails:        1_000,
		MaxMonthlyAITokens:    10_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "LinkedIn", "Storefront"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           true,
		PrioritySupport:       true,
	},
	models.PlanScale: {
		Tier:                  models.PlanScale,
		Name:                  "Ofia Scale (Omni-Suite)",
		MonthlyPriceNGN:       200_000,
		AnnualPriceNGN:        2_000_000,
		MonthlyPriceUSD:       145,
		AnnualPriceUSD:        1_450,
		DirectFeePercent:      0.5,
		EscrowFeePercent:      2.5,
		MaxProjects:           10,
		MaxProducts:           999_999,
		MaxTeamSeats:          50,
		MaxMonthlyLeads:       50_000,
		MaxActiveCampaigns:    30,
		MaxDailyEmails:        4_000,
		MaxMonthlyAITokens:    50_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "LinkedIn", "Meta Ads", "Voice AI", "Storefront"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           true,
		PrioritySupport:       true,
	},
	models.PlanEnterprise: {
		Tier:                  models.PlanEnterprise,
		Name:                  "Ofia Sovereign (Enterprise)",
		MonthlyPriceNGN:       650_000,
		AnnualPriceNGN:        6_500_000,
		MonthlyPriceUSD:       450,
		AnnualPriceUSD:        4_500,
		DirectFeePercent:      0.0,
		EscrowFeePercent:      1.5,
		MaxProjects:           999,
		MaxProducts:           999_999,
		MaxTeamSeats:          999,
		MaxMonthlyLeads:       250_000,
		MaxActiveCampaigns:    100,
		MaxDailyEmails:        10_000,
		MaxMonthlyAITokens:    250_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "LinkedIn", "Meta Ads", "Voice AI", "Storefront", "Custom API"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           true,
		PrioritySupport:       true,
	},
}

// GetLimitsForTier returns the central plan limit, overriding any potentially outdated database values
func GetLimitsForTier(tier models.PlanTier) PlanLimit {
	normalized := models.PlanTier(strings.ToUpper(strings.TrimSpace(string(tier))))
	if limit, ok := PlanLimits[normalized]; ok {
		return limit
	}
	return PlanLimits[models.PlanStarter]
}

// GetModulesForTierAndVertical derives the exact ERP, Shop, and Mobility module entitlements for a plan tier and vertical
func GetModulesForTierAndVertical(tier models.PlanTier, vertical string) TierModulePreset {
	normTier := models.PlanTier(strings.ToUpper(strings.TrimSpace(string(tier))))
	normVert := strings.ToLower(strings.TrimSpace(vertical))
	if normVert == "" {
		normVert = "retail"
	}

	isMobilityVertical := normVert == "cars" || normVert == "logistics" || normVert == "transport" || normVert == "fleet" || normVert == "rides" || normVert == "dispatch"
	isGrowthOrAbove := normTier == models.PlanGrowth || normTier == models.PlanScale || normTier == models.PlanEnterprise
	isScaleOrAbove := normTier == models.PlanScale || normTier == models.PlanEnterprise

	erpModules := map[string]bool{
		"shop":        !isMobilityVertical || isScaleOrAbove,
		"crm":         true,
		"marketplace": true,
		"users":       true,
		"accounting":  isGrowthOrAbove,
		"hr":          isGrowthOrAbove,
		"ai":          isGrowthOrAbove,
		"workforce":   isScaleOrAbove,
		"mobility":    isMobilityVertical || isScaleOrAbove,
		"dispatch":    isMobilityVertical || isScaleOrAbove,
	}

	shopActive := erpModules["shop"]
	shopSubModules := map[string]bool{
		"pos":       shopActive,
		"inventory": shopActive,
		"catalog":   shopActive,
		"orders":    shopActive,
		"store":     shopActive,
		"services":  shopActive && isGrowthOrAbove,
		"referrals": shopActive && isScaleOrAbove,
	}

	mobilityActive := erpModules["mobility"]
	mobilitySubModules := map[string]bool{
		"ops":          mobilityActive,
		"vehicles":     mobilityActive,
		"drivers":      mobilityActive,
		"maintenance":  mobilityActive,
		"routes":       mobilityActive,
		"finance":      mobilityActive && isGrowthOrAbove,
		"shuttle":      mobilityActive && isScaleOrAbove,
		"interstate":   mobilityActive && isScaleOrAbove,
		"on_demand":    mobilityActive,
		"rental":       mobilityActive,
		"school":       mobilityActive && isScaleOrAbove,
		"staff":        mobilityActive && isScaleOrAbove,
		"mobility_ops": mobilityActive,
		"dispatch_ops": erpModules["dispatch"],
	}

	return TierModulePreset{
		ERPModules:         erpModules,
		ShopSubModules:     shopSubModules,
		MobilitySubModules: mobilitySubModules,
	}
}

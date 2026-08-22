package subscription

import (
	"strings"
	"nexa/user_subscription_service/internal/models"
)

// PlanLimit defines the single-source-of-truth quota entitlements for a plan tier
type PlanLimit struct {
	Tier                  models.PlanTier `json:"tier"`
	Name                  string          `json:"name"`
	MonthlyPriceUSD       float64         `json:"monthly_price_usd"`
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

// PlanLimits centrally defines and manages all tier entitlements across the platform
var PlanLimits = map[models.PlanTier]PlanLimit{
	models.PlanFreeTrial: {
		Tier:                  models.PlanFreeTrial,
		Name:                  "Free Trial (14 Days)",
		MonthlyPriceUSD:       0,
		MaxProjects:           1,
		MaxProducts:           1,
		MaxTeamSeats:          1,
		MaxMonthlyLeads:       100,
		MaxActiveCampaigns:    1,
		MaxDailyEmails:        50,
		MaxMonthlyAITokens:    250_000,
		AllowedChannels:       []string{"Email"},
		VoiceAssistantEnabled: false,
		BYOKAllowed:           false,
		PrioritySupport:       false,
	},
	models.PlanStarter: {
		Tier:                  models.PlanStarter,
		Name:                  "Starter",
		MonthlyPriceUSD:       450,
		MaxProjects:           1,
		MaxProducts:           3,
		MaxTeamSeats:          3,
		MaxMonthlyLeads:       1_000,
		MaxActiveCampaigns:    3,
		MaxDailyEmails:        250,
		MaxMonthlyAITokens:    2_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           false,
		PrioritySupport:       false,
	},
	models.PlanGrowth: {
		Tier:                  models.PlanGrowth,
		Name:                  "Growth",
		MonthlyPriceUSD:       1_200,
		MaxProjects:           3,
		MaxProducts:           10,
		MaxTeamSeats:          8,
		MaxMonthlyLeads:       5_000,
		MaxActiveCampaigns:    10,
		MaxDailyEmails:        1_000,
		MaxMonthlyAITokens:    10_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "LinkedIn"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           true,
		PrioritySupport:       true,
	},
	models.PlanScale: {
		Tier:                  models.PlanScale,
		Name:                  "Scale",
		MonthlyPriceUSD:       2_400,
		MaxProjects:           10,
		MaxProducts:           30,
		MaxTeamSeats:          20,
		MaxMonthlyLeads:       20_000,
		MaxActiveCampaigns:    25,
		MaxDailyEmails:        4_000,
		MaxMonthlyAITokens:    35_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "LinkedIn", "Meta Ads"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           true,
		PrioritySupport:       true,
	},
	models.PlanEnterprise: {
		Tier:                  models.PlanEnterprise,
		Name:                  "Enterprise",
		MonthlyPriceUSD:       4_500,
		MaxProjects:           999, // Unlimited
		MaxProducts:           999, // Unlimited
		MaxTeamSeats:          999,
		MaxMonthlyLeads:       50_000,
		MaxActiveCampaigns:    100,
		MaxDailyEmails:        10_000,
		MaxMonthlyAITokens:    100_000_000,
		AllowedChannels:       []string{"Email", "WhatsApp", "LinkedIn", "Meta Ads"},
		VoiceAssistantEnabled: true,
		BYOKAllowed:           true,
		PrioritySupport:       true,
	},
}

// GetLimitsForTier returns the central plan limit, overriding any potentially outdated database values
func GetLimitsForTier(tier models.PlanTier) PlanLimit {
	normalized := models.PlanTier(strings.ToUpper(string(tier)))
	if limit, ok := PlanLimits[normalized]; ok {
		return limit
	}
	return PlanLimits[models.PlanStarter]
}

package agents

import (
	"time"
	"github.com/google/uuid"
	"nexa/ai_gtm_service/internal/models"
)

type AgentDefinition struct {
	Key             string
	Name            string
	Role            string
	Category        string
	DefaultTask     string
	Recommendation  string
	ConfidenceScore float64
}

var SwarmDefinitions = []AgentDefinition{
	{
		Key:             "cro",
		Name:            "Sterling Vance",
		Role:            "Chief Revenue Officer",
		Category:        "Executive",
		DefaultTask:     "Synthesizing cross-channel weekly revenue report & executive briefing",
		Recommendation:  "Shift 35% of outreach capacity toward the private school sector where reply rates are 2.4x higher.",
		ConfidenceScore: 95.0,
	},
	{
		Key:             "researcher",
		Name:            "Dr. Elena Rostova",
		Role:            "Market Researcher",
		Category:        "Intelligence",
		DefaultTask:     "Conducting competitive pricing & feature benchmark across 14 SaaS competitors",
		Recommendation:  "Competitors are hiking renewal rates by 20%. Launch an aggressive 'Switch & Save' campaign.",
		ConfidenceScore: 92.0,
	},
	{
		Key:             "lead_hunter",
		Name:            "Olivia Chen",
		Role:            "Lead Hunter",
		Category:        "Intelligence",
		DefaultTask:     "Discovering verified K-12 decision makers across key metropolitan zones",
		Recommendation:  "Expand prospect extraction parameters to include regional private academies in Abuja & Port Harcourt.",
		ConfidenceScore: 96.0,
	},
	{
		Key:             "gtm_strategist",
		Name:            "Marcus Aurel",
		Role:            "GTM Strategist",
		Category:        "Strategy",
		DefaultTask:     "Refining value hook positioning for high-ticket enterprise buyer personas",
		Recommendation:  "Position the software as 'Automated Tuition & Operations Command' rather than generic 'School ERP'.",
		ConfidenceScore: 94.0,
	},
	{
		Key:             "content_strategist",
		Name:            "Maya Lin",
		Role:            "Content Strategist",
		Category:        "Content",
		DefaultTask:     "Building multi-channel editorial pillars and thought leadership calendar",
		Recommendation:  "Create a downloadable PDF checklist: 'The 10 Costly Operational Leaks in Private School Management'.",
		ConfidenceScore: 90.0,
	},
	{
		Key:             "copywriter",
		Name:            "Julian Cross",
		Role:            "AI Copywriter",
		Category:        "Content",
		DefaultTask:     "Crafting 4-part personalized cold email sequence for school principals",
		Recommendation:  "Use short 3-line pattern-interrupt subject lines with recipient institution name token.",
		ConfidenceScore: 95.0,
	},
	{
		Key:             "campaign_manager",
		Name:            "Devon Reed",
		Role:            "Campaign Manager",
		Category:        "Strategy",
		DefaultTask:     "Orchestrating stage gating and execution triggers across live campaigns",
		Recommendation:  "Schedule email drops between 8:15 AM - 9:30 AM West Africa Time for peak mobile inbox opens.",
		ConfidenceScore: 93.0,
	},
	{
		Key:             "outreach_manager",
		Name:            "Noah Sterling",
		Role:            "Outreach Manager",
		Category:        "Outreach",
		DefaultTask:     "Managing sending cadence, warmups, and automated reply sentiment analysis",
		Recommendation:  "12 prospect replies contain pricing queries. Hand off directly to sales calendar webhook.",
		ConfidenceScore: 97.0,
	},
	{
		Key:             "whatsapp_manager",
		Name:            "Amara Obi",
		Role:            "WhatsApp Manager",
		Category:        "Outreach",
		DefaultTask:     "Engaging warm opt-in leads via official WhatsApp Business API dialogues",
		Recommendation:  "Add quick-reply button 'Schedule 15-min Demo' directly to the second follow-up message.",
		ConfidenceScore: 96.0,
	},
	{
		Key:             "creative_director",
		Name:            "Chloe Vane",
		Role:            "Creative Director",
		Category:        "Content",
		DefaultTask:     "Analyzing uploaded brand assets and producing high-converting ad variants",
		Recommendation:  "Feature actual UI screenshot of the school financial dashboard in LinkedIn sponsored posts.",
		ConfidenceScore: 91.0,
	},
	{
		Key:             "ads_strategist",
		Name:            "Kieran Patel",
		Role:            "Ads Strategist",
		Category:        "Strategy",
		DefaultTask:     "Optimizing Meta & LinkedIn B2B audience retargeting and ROAS attribution",
		Recommendation:  "Increase daily ad spend by $150 on the top-performing school administrator lookalike audience.",
		ConfidenceScore: 92.0,
	},
	{
		Key:             "analytics_manager",
		Name:            "Siddharth Rao",
		Role:            "Analytics Manager",
		Category:        "Intelligence",
		DefaultTask:     "Generating multi-touch conversion attribution models across all channels",
		Recommendation:  "Email + WhatsApp hybrid sequences demonstrate 3.1x higher close rate than single-channel email.",
		ConfidenceScore: 98.0,
	},
	{
		Key:             "growth_advisor",
		Name:            "Zara Thorne",
		Role:            "Growth Advisor",
		Category:        "Advisory",
		DefaultTask:     "Identifying high-upside non-obvious revenue channels and partnership opportunities",
		Recommendation:  "Form an association partnership with the Private Schools Guild for a co-branded operations webinar.",
		ConfidenceScore: 93.0,
	},
	{
		Key:             "learning_agent",
		Name:            "Nexus Core",
		Role:            "Learning & Memory Agent",
		Category:        "Advisory",
		DefaultTask:     "Updating permanent organizational memory weights based on Q3 winning message patterns",
		Recommendation:  "Messages highlighting 'Tuition collection leakages' have an 88% higher response rate than 'Attendance tracking'.",
		ConfidenceScore: 99.0,
	},
}

func GenerateDefaultAgentsForOrg(orgID string) []models.AIAgent {
	var list []models.AIAgent
	for _, def := range SwarmDefinitions {
		list = append(list, models.AIAgent{
			ID:                   uuid.New().String(),
			OrganizationID:       orgID,
			Key:                  def.Key,
			Name:                 def.Name,
			Role:                 def.Role,
			Category:             def.Category,
			Status:               "ONLINE",
			CurrentTask:          def.DefaultTask,
			TaskProgress:         85,
			ConfidenceScore:      def.ConfidenceScore,
			Recommendation:       def.Recommendation,
			CircuitBreakerActive: false,
			CreatedAt:            time.Now(),
			UpdatedAt:            time.Now(),
		})
	}
	return list
}

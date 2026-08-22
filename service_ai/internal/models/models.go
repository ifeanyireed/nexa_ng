package models

import (
	"time"
)

type Role string

const (
	RoleSuperAdmin  Role = "SUPER_ADMIN"
	RoleTenantOwner Role = "TENANT_OWNER"
	RoleGrowthLead  Role = "GROWTH_LEAD"
	RoleSalesRep    Role = "SALES_REP"
	RoleViewer      Role = "VIEWER"
	RoleClient      Role = "CLIENT"
	RolePro         Role = "PRO"
)

type User struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	Email     string    `gorm:"uniqueIndex;size:191;not null" json:"email"`
	Password  string    `gorm:"size:191;not null" json:"-"`
	Name      string    `gorm:"size:191" json:"name"`
	Role      Role      `gorm:"size:50;not null;default:'TENANT_OWNER'" json:"role"`
	Avatar    string    `gorm:"size:255" json:"avatar,omitempty"`
	Title     string    `gorm:"size:191" json:"title,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (User) TableName() string {
	return "User"
}

type Organization struct {
	ID           string    `gorm:"primaryKey;column:id;size:191" json:"id"`
	Name         string    `gorm:"column:name;size:191;not null" json:"name"`
	Slug         string    `gorm:"column:slug;uniqueIndex;size:191;not null" json:"slug"`
	OwnerID      string    `gorm:"column:ownerId;size:191;not null" json:"owner_id"`
	PlanTier     string    `gorm:"column:planTier;size:50;not null;default:'STARTER'" json:"plan_tier"`
	BillingCycle string    `gorm:"column:billingCycle;size:20;not null;default:'MONTHLY'" json:"billing_cycle"`
	Status       string    `gorm:"column:status;size:30;not null;default:'ACTIVE'" json:"status"`
	CreatedAt    time.Time `gorm:"column:createdAt" json:"created_at"`
	UpdatedAt    time.Time `gorm:"column:updatedAt" json:"updated_at"`
}

func (Organization) TableName() string {
	return "Organization"
}

type WorkspaceMember struct {
	ID             string    `gorm:"primaryKey;column:id;size:191" json:"id"`
	OrganizationID string    `gorm:"column:organizationId;size:191;not null;uniqueIndex:org_user_uniq" json:"organization_id"`
	UserID         string    `gorm:"column:userId;size:191;not null;uniqueIndex:org_user_uniq" json:"user_id"`
	Role           Role      `gorm:"column:role;size:50;not null;default:'GROWTH_LEAD'" json:"role"`
	CreatedAt      time.Time `gorm:"column:createdAt" json:"created_at"`
	User           *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (WorkspaceMember) TableName() string {
	return "WorkspaceMember"
}

type AIAgent struct {
	ID                   string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID       string    `gorm:"size:191;not null;uniqueIndex:org_agent_key_uniq" json:"organization_id"`
	Key                  string    `gorm:"size:50;not null;uniqueIndex:org_agent_key_uniq" json:"key"` // cro, lead_hunter, gtm_strategist...
	Name                 string    `gorm:"size:191;not null" json:"name"`
	Role                 string    `gorm:"size:191;not null" json:"role"`
	Category             string    `gorm:"size:50;not null" json:"category"`
	Status               string    `gorm:"size:30;not null;default:'ONLINE'" json:"status"` // WORKING, ONLINE, IDLE, TRIPPED
	CurrentTask          string    `gorm:"type:text" json:"current_task"`
	TaskProgress         int       `gorm:"default:0" json:"task_progress"`
	ConfidenceScore      float64   `gorm:"default:95.0" json:"confidence_score"`
	Recommendation       string    `gorm:"type:text" json:"recommendation"`
	CircuitBreakerActive bool      `gorm:"default:false" json:"circuit_breaker_active"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

func (AIAgent) TableName() string {
	return "gtm_agent"
}

type GTMStrategy struct {
	ID                string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID    string    `gorm:"size:191;not null" json:"organization_id"`
	Title             string    `gorm:"size:191;not null" json:"title"`
	TargetTAM         string    `gorm:"size:191" json:"target_tam"`
	ValueProposition  string    `gorm:"type:text;not null" json:"value_proposition"`
	StrategyGraphJSON string    `gorm:"type:json;not null" json:"strategy_graph_json"`
	Status            string    `gorm:"size:30;not null;default:'ACTIVE'" json:"status"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (GTMStrategy) TableName() string {
	return "gtm_strategy"
}

type GTMCampaign struct {
	ID             string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID string    `gorm:"size:191;not null" json:"organization_id"`
	Name           string    `gorm:"size:191;not null" json:"name"`
	TargetAudience string    `gorm:"type:text;not null" json:"target_audience"`
	Status         string    `gorm:"size:30;not null;default:'DRAFT'" json:"status"` // DRAFT, PLANNING, PRODUCTION, APPROVAL, ACTIVE, COMPLETED, PAUSED
	ChannelsJSON   string    `gorm:"type:json;not null" json:"channels_json"`        // ["Email", "WhatsApp", "LinkedIn"]
	ProspectsCount int       `gorm:"default:0" json:"prospects_count"`
	SentCount      int       `gorm:"default:0" json:"sent_count"`
	RepliesCount   int       `gorm:"default:0" json:"replies_count"`
	MeetingsCount  int       `gorm:"default:0" json:"meetings_count"`
	PipelineValue  float64   `gorm:"default:0.0" json:"pipeline_value"`
	StartDate      *time.Time `json:"start_date,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func (GTMCampaign) TableName() string {
	return "gtm_campaign"
}

type GTMLead struct {
	ID                string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID    string    `gorm:"size:191;not null" json:"organization_id"`
	CampaignID        *string   `gorm:"size:191" json:"campaign_id,omitempty"`
	CompanyName       string    `gorm:"size:191;not null" json:"company_name"`
	Website           string    `gorm:"size:191" json:"website"`
	Industry          string    `gorm:"size:191" json:"industry"`
	Location          string    `gorm:"size:191" json:"location"`
	ContactName       string    `gorm:"size:191;not null" json:"contact_name"`
	ContactTitle      string    `gorm:"size:191" json:"contact_title"`
	ContactEmail      string    `gorm:"size:191;not null" json:"contact_email"`
	ContactPhone      string    `gorm:"size:191" json:"contact_phone"`
	ICPFitScore       int       `gorm:"default:50" json:"icp_fit_score"`
	BuyingSignalsJSON string    `gorm:"type:json" json:"buying_signals_json"`
	Status            string    `gorm:"size:50;not null;default:'IDENTIFIED'" json:"status"` // IDENTIFIED, ENRICHED, QUEUED, CONTACTED, REPLIED, MEETING_BOOKED
	AssignedAgentKey  string    `gorm:"size:50" json:"assigned_agent_key"`
	LastActivity      string    `gorm:"size:255" json:"last_activity"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (GTMLead) TableName() string {
	return "gtm_lead"
}

type GTMApproval struct {
	ID                 string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID     string    `gorm:"size:191;not null" json:"organization_id"`
	CampaignID         *string   `gorm:"size:191" json:"campaign_id,omitempty"`
	Title              string    `gorm:"size:191;not null" json:"title"`
	Type               string    `gorm:"size:50;not null" json:"type"` // EMAIL_CAMPAIGN, WHATSAPP_BROADCAST, AD_SPEND, STRATEGY_SHIFT
	CreatorAgentKey    string    `gorm:"size:50;not null" json:"creator_agent_key"`
	RiskLevel          string    `gorm:"size:20;not null;default:'MEDIUM'" json:"risk_level"` // LOW, MEDIUM, HIGH
	TargetChannel      string    `gorm:"size:50;not null" json:"target_channel"`
	PreviewDataJSON    string    `gorm:"type:json;not null" json:"preview_data_json"`
	Status             string    `gorm:"size:30;not null;default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED
	AuthorizedByUserID *string   `gorm:"size:191" json:"authorized_by_user_id,omitempty"`
	AuthorizedAt       *time.Time `json:"authorized_at,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
}

func (GTMApproval) TableName() string {
	return "gtm_approval"
}

type GTMObservabilityTrace struct {
	ID               string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID   string    `gorm:"size:191;not null" json:"organization_id"`
	AgentKey         string    `gorm:"size:50;not null" json:"agent_key"`
	ModelProvider    string    `gorm:"size:50;not null" json:"model_provider"` // ANTHROPIC, OPENAI, GOOGLE, GROQ
	ModelName        string    `gorm:"size:100;not null" json:"model_name"`
	PromptTokens     int       `gorm:"default:0" json:"prompt_tokens"`
	CompletionTokens int       `gorm:"default:0" json:"completion_tokens"`
	TotalCostUSD     float64   `gorm:"default:0.0" json:"total_cost_usd"`
	LatencyMs        int       `gorm:"default:0" json:"latency_ms"`
	Status           string    `gorm:"size:20;not null;default:'SUCCESS'" json:"status"` // SUCCESS, ERROR, RETRIED
	CreatedAt        time.Time `json:"created_at"`
}

func (GTMObservabilityTrace) TableName() string {
	return "gtm_observability_trace"
}

type GTMTenantSettings struct {
	ID                           string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID               string    `gorm:"size:191;not null;uniqueIndex" json:"organization_id"`
	EmailProvider                string    `gorm:"size:50;not null;default:'NEXA_MANAGED'" json:"email_provider"` // NEXA_MANAGED, RESEND, BREVO, AWS_SES, SENDGRID, SMTP
	SMTPHost                     string    `gorm:"size:191" json:"smtp_host"`
	SMTPPort                     int       `gorm:"default:587" json:"smtp_port"`
	SMTPUser                     string    `gorm:"size:191" json:"smtp_user"`
	SMTPPasswordEncrypted        string    `gorm:"type:text" json:"-"`
	EmailFromName                string    `gorm:"size:191" json:"email_from_name"`
	EmailFromAddress             string    `gorm:"size:191" json:"email_from_address"`
	SendingDomain                string    `gorm:"size:191" json:"sending_domain"`
	DomainStatus                 string    `gorm:"size:50;default:'UNCONFIGURED'" json:"domain_status"` // UNCONFIGURED, PENDING, VERIFIED, FAILED
	DKIMRecord                   string    `gorm:"type:text" json:"dkim_record"`
	SPFRecord                    string    `gorm:"type:text" json:"spf_record"`
	DMARCRecord                  string    `gorm:"type:text" json:"dmarc_record"`
	MXRecord                     string    `gorm:"type:text" json:"mx_record"`
	ReplyToEmail                 string    `gorm:"size:191" json:"reply_to_email"`
	AWSRegion                    string    `gorm:"size:50" json:"aws_region"`
	AWSAccessKeyID               string    `gorm:"size:191" json:"aws_access_key_id"`
	AWSSecretKeyEncrypted        string    `gorm:"type:text" json:"-"`
	EmailAPIKeyEncrypted         string    `gorm:"type:text;column:email_api_key_encrypted" json:"-"`
	ResendAPIKeyEncrypted        string    `gorm:"type:text;column:resend_api_key_encrypted" json:"-"`
	BrevoAPIKeyEncrypted         string    `gorm:"type:text;column:brevo_api_key_encrypted" json:"-"`
	DailyEmailLimit              int       `gorm:"default:500" json:"daily_email_limit"`
	WhatsAppPhoneNumberID        string    `gorm:"size:191" json:"whatsapp_phone_number_id"`
	WhatsAppWABAID               string    `gorm:"size:191" json:"whatsapp_waba_id"`
	WhatsAppAccessTokenEncrypted string    `gorm:"type:text" json:"-"`
	WhatsAppWebhookVerifyToken   string    `gorm:"size:191" json:"whatsapp_webhook_verify_token"`
	WhatsAppQualityRating        string    `gorm:"size:30;default:'UNKNOWN'" json:"whatsapp_quality_rating"`
	AnthropicAPIKeyEncrypted     string    `gorm:"type:text" json:"-"`
	OpenAIAPIKeyEncrypted        string    `gorm:"type:text" json:"-"`
	GeminiAPIKeyEncrypted        string    `gorm:"type:text" json:"-"`
	GroqAPIKeyEncrypted          string    `gorm:"type:text" json:"-"`
	MistralAPIKeyEncrypted       string    `gorm:"type:text" json:"-"`
	AnthropicKeyPoolEncrypted    string    `gorm:"type:longtext" json:"-"`
	OpenAIKeyPoolEncrypted       string    `gorm:"type:longtext" json:"-"`
	GeminiKeyPoolEncrypted       string    `gorm:"type:longtext" json:"-"`
	GroqKeyPoolEncrypted         string    `gorm:"type:longtext" json:"-"`
	MistralKeyPoolEncrypted      string    `gorm:"type:longtext" json:"-"`
	UseTenantKeysOnly            bool      `gorm:"default:false" json:"use_tenant_keys_only"`
	MetaAdsAccountID             string    `gorm:"size:191" json:"meta_ads_account_id"`
	MetaAdsAccessTokenEncrypted  string    `gorm:"type:text" json:"-"`
	LinkedInClientID             string    `gorm:"size:191" json:"linkedin_client_id"`
	LinkedInClientSecretEncrypted string   `gorm:"type:text" json:"-"`
	HubspotAPIKeyEncrypted       string    `gorm:"type:text" json:"-"`
	SlackWebhookURLEncrypted     string    `gorm:"type:text" json:"-"`
	FacebookPageID               string    `gorm:"size:191" json:"facebook_page_id"`
	FacebookPageTokenEncrypted   string    `gorm:"type:text" json:"-"`
	InstagramAccountID           string    `gorm:"size:191" json:"instagram_account_id"`
	InstagramTokenEncrypted      string    `gorm:"type:text" json:"-"`
	LinkedInOrgURN               string    `gorm:"size:191" json:"linkedin_org_urn"`
	LinkedInAccessTokenEncrypted string    `gorm:"type:text" json:"-"`
	TwitterAPIKeyEncrypted       string    `gorm:"type:text" json:"-"`
	TwitterAPISecretEncrypted    string    `gorm:"type:text" json:"-"`
	TwitterAccessTokenEncrypted  string    `gorm:"type:text" json:"-"`
	TwitterTokenSecretEncrypted  string    `gorm:"type:text" json:"-"`
	CustomWebhookURLEncrypted    string    `gorm:"type:text" json:"-"`
	CustomWebhookSecret          string    `gorm:"size:191" json:"custom_webhook_secret"`
	AutoPublishEnabled           bool      `gorm:"default:true" json:"auto_publish_enabled"`
	TelegramBotTokenEncrypted    string    `gorm:"type:text" json:"-"`
	TelegramChatID               string    `gorm:"size:191" json:"telegram_chat_id"`
	CreatedAt                    time.Time `json:"created_at"`
	UpdatedAt                    time.Time `json:"updated_at"`
}

func (GTMTenantSettings) TableName() string {
	return "gtm_tenant_settings"
}

type GTMEmailDispatchLog struct {
	ID                string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID    string    `gorm:"size:191;not null;index" json:"organization_id"`
	CampaignID        string    `gorm:"size:191" json:"campaign_id"`
	RecipientEmail    string    `gorm:"size:191;not null" json:"recipient_email"`
	SenderEmail       string    `gorm:"size:191;not null" json:"sender_email"`
	Subject           string    `gorm:"size:255;not null" json:"subject"`
	Provider          string    `gorm:"size:50;not null" json:"provider"`
	Domain            string    `gorm:"size:191;not null" json:"domain"`
	Status            string    `gorm:"size:50;not null;default:'DELIVERED'" json:"status"`
	ExternalMessageID string    `gorm:"size:191" json:"external_message_id"`
	LatencyMs         int       `gorm:"default:120" json:"latency_ms"`
	CreatedAt         time.Time `json:"created_at"`
}

func (GTMEmailDispatchLog) TableName() string {
	return "gtm_email_dispatch_log"
}

type GTMGlobalEmailSettings struct {
	ID                         string    `gorm:"primaryKey;size:191" json:"id"`
	PlatformProvider           string    `gorm:"size:50;not null;default:'RESEND'" json:"platform_provider"`
	PlatformAPIKeyEncrypted    string    `gorm:"type:text;column:platform_api_key_encrypted" json:"-"`
	ResendAPIKeyEncrypted      string    `gorm:"type:text;column:resend_api_key_encrypted" json:"-"`
	BrevoAPIKeyEncrypted       string    `gorm:"type:text;column:brevo_api_key_encrypted" json:"-"`
	PlatformAWSRegion          string    `gorm:"size:50;default:'us-east-1'" json:"platform_aws_region"`
	PlatformAWSAccessKey       string    `gorm:"size:191" json:"platform_aws_access_key"`
	PlatformAWSSecretEncrypted string    `gorm:"type:text" json:"-"`
	PlatformFromAddress        string    `gorm:"size:191;not null;default:'outreach@ofia.ng'" json:"platform_from_address"`
	PlatformFromName           string    `gorm:"size:191;not null;default:'Ofia Autonomous GTM'" json:"platform_from_name"`
	PlatformReplyTo            string    `gorm:"size:191;not null;default:'support@ofia.ng'" json:"platform_reply_to"`
	EnforceDKIMVerification    bool      `gorm:"default:true" json:"enforce_dkim_verification"`
	MaxBounceRateThreshold     float64   `gorm:"default:5.0" json:"max_bounce_rate_threshold"`
	MaxSpamComplaintThreshold  float64   `gorm:"default:0.08" json:"max_spam_complaint_threshold"`
	FreeTierDailyLimit         int       `gorm:"default:50" json:"free_tier_daily_limit"`
	StarterDailyLimit          int       `gorm:"default:250" json:"starter_daily_limit"`
	GrowthDailyLimit           int       `gorm:"default:1000" json:"growth_daily_limit"`
	ScaleDailyLimit            int       `gorm:"default:4000" json:"scale_daily_limit"`
	EnterpriseDailyLimit       int       `gorm:"default:10000" json:"enterprise_daily_limit"`
	SuppressedDomains          string    `gorm:"type:text" json:"suppressed_domains"`
	AllowedProviders           string    `gorm:"type:text" json:"allowed_providers"`
	UpdatedAt                  time.Time `json:"updated_at"`
}

func (GTMGlobalEmailSettings) TableName() string {
	return "gtm_global_email_settings"
}

type GTMEmailReply struct {
	ID                 string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID     string    `gorm:"size:191;not null;index" json:"organization_id"`
	CampaignID         string    `gorm:"size:191" json:"campaign_id"`
	LeadID             string    `gorm:"size:191;index" json:"lead_id"`
	FromEmail          string    `gorm:"size:191;not null" json:"from_email"`
	FromName           string    `gorm:"size:191" json:"from_name"`
	ToEmail            string    `gorm:"size:191;not null" json:"to_email"`
	Subject            string    `gorm:"size:255;not null" json:"subject"`
	Snippet            string    `gorm:"type:text" json:"snippet"`
	FullBody           string    `gorm:"type:longtext" json:"full_body"`
	Sentiment          string    `gorm:"size:50;default:'POSITIVE_INTEREST'" json:"sentiment"` // POSITIVE_INTEREST, MEETING_REQUESTED, INFORMATION_REQUEST, OBJECTION, NOT_INTERESTED, OUT_OF_OFFICE, UNSUBSCRIBE
	IntentSummary      string    `gorm:"size:255" json:"intent_summary"`
	SuggestedReplyText string    `gorm:"type:text" json:"suggested_reply_text"`
	IsHandled          bool      `gorm:"default:false" json:"is_handled"`
	ThreadID           string    `gorm:"size:191" json:"thread_id"`
	ExternalMessageID  string    `gorm:"size:191" json:"external_message_id"`
	ReceivedAt         time.Time `json:"received_at"`
}

func (GTMEmailReply) TableName() string {
	return "gtm_email_reply"
}

type GTMSocialPostMetrics struct {
	ID             string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID string    `gorm:"size:191;not null;index" json:"organization_id"`
	CampaignID     string    `gorm:"size:191" json:"campaign_id"`
	Channel        string    `gorm:"size:50;not null" json:"channel"` // LINKEDIN, FACEBOOK, INSTAGRAM, TWITTER
	ExternalPostID string    `gorm:"size:191" json:"external_post_id"`
	ContentSnippet string    `gorm:"size:255;not null" json:"content_snippet"`
	Impressions    int       `gorm:"default:0" json:"impressions"`
	Reach          int       `gorm:"default:0" json:"reach"`
	Likes          int       `gorm:"default:0" json:"likes"`
	Comments       int       `gorm:"default:0" json:"comments"`
	Shares         int       `gorm:"default:0" json:"shares"`
	Clicks         int       `gorm:"default:0" json:"clicks"`
	EngagementRate float64   `gorm:"default:0.0" json:"engagement_rate"`
	PublishedAt    time.Time `json:"published_at"`
	LastPolledAt   time.Time `json:"last_polled_at"`
}

func (GTMSocialPostMetrics) TableName() string {
	return "gtm_social_post_metrics"
}

type GTMFeatureFlag struct {
	ID                string    `gorm:"primaryKey;size:191" json:"id"`
	Key               string    `gorm:"uniqueIndex;size:100;not null" json:"key"`
	Name              string    `gorm:"size:191;not null" json:"name"`
	Description       string    `gorm:"type:text" json:"description"`
	Category          string    `gorm:"size:50;not null" json:"category"`
	RolloutPercentage int       `gorm:"default:100" json:"rollout_percentage"`
	IsEnabledGlobally bool      `gorm:"default:true" json:"is_enabled_globally"`
	UpdatedBy         string    `gorm:"size:191" json:"updated_by"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func (GTMFeatureFlag) TableName() string {
	return "gtm_feature_flag"
}

type GTMAuditLog struct {
	ID         string    `gorm:"primaryKey;size:191" json:"id"`
	ActorEmail string    `gorm:"size:191;not null;index" json:"actor_email"`
	ActorName  string    `gorm:"size:191" json:"actor_name"`
	Action     string    `gorm:"size:191;not null" json:"action"`
	TargetType string    `gorm:"size:50" json:"target_type"`
	TargetID   string    `gorm:"size:191" json:"target_id"`
	Details    string    `gorm:"type:text" json:"details"`
	IPAddress  string    `gorm:"size:50" json:"ip_address"`
	Status     string    `gorm:"size:30;default:'SUCCESS'" json:"status"`
	CreatedAt  time.Time `gorm:"index" json:"created_at"`
}

func (GTMAuditLog) TableName() string {
	return "gtm_audit_log"
}

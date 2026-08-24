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

type PlanTier string

const (
	PlanFreeTrial  PlanTier = "FREE_TRIAL"
	PlanStarter    PlanTier = "STARTER"
	PlanGrowth     PlanTier = "GROWTH"
	PlanScale      PlanTier = "SCALE"
	PlanEnterprise PlanTier = "ENTERPRISE"
)

// User represents an identity account
type User struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	Email     string    `gorm:"uniqueIndex;size:191;not null" json:"email"`
	Password  string    `gorm:"size:191;not null" json:"-"`
	Name      string    `gorm:"size:191" json:"name"`
	Role      Role      `gorm:"size:50;not null;default:'CLIENT'" json:"role"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// Relationships
	Organizations    []Organization    `gorm:"foreignKey:OwnerID" json:"owned_organizations,omitempty"`
	WorkspaceMembers []WorkspaceMember `gorm:"foreignKey:UserID" json:"workspace_memberships,omitempty"`
	Wallet           *Wallet           `gorm:"foreignKey:UserID" json:"wallet,omitempty"`
}

func (User) TableName() string {
	return "User"
}

// Organization represents a multi-tenant workspace/business account
type Organization struct {
	ID           string    `gorm:"primaryKey;size:191" json:"id"`
	Name         string    `gorm:"size:191;not null" json:"name"`
	Slug         string    `gorm:"uniqueIndex;size:191;not null" json:"slug"`
	OwnerID      string    `gorm:"size:191;not null" json:"owner_id"`
	PlanTier     PlanTier  `gorm:"size:50;not null;default:'STARTER'" json:"plan_tier"`
	BillingCycle string    `gorm:"size:20;not null;default:'MONTHLY'" json:"billing_cycle"`
	Status       string    `gorm:"size:30;not null;default:'ACTIVE'" json:"status"` // ACTIVE, PAST_DUE, SUSPENDED
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`

	// Relationships
	Owner        *User             `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Members      []WorkspaceMember `gorm:"foreignKey:OrganizationID" json:"members,omitempty"`
	Subscription *Subscription     `gorm:"foreignKey:OrganizationID" json:"subscription,omitempty"`
	Usages       []OrganizationUsage `gorm:"foreignKey:OrganizationID" json:"usages,omitempty"`
}

func (Organization) TableName() string {
	return "Organization"
}

// WorkspaceMember maps users to organizations with RBAC
type WorkspaceMember struct {
	ID             string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID string    `gorm:"size:191;not null;uniqueIndex:org_user_uniq" json:"organization_id"`
	UserID         string    `gorm:"size:191;not null;uniqueIndex:org_user_uniq" json:"user_id"`
	Role           Role      `gorm:"size:50;not null;default:'GROWTH_LEAD'" json:"role"`
	CreatedAt      time.Time `json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (WorkspaceMember) TableName() string {
	return "WorkspaceMember"
}

// Subscription represents tenant billing state and payment gateway integration
type Subscription struct {
	ID                       string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID           string    `gorm:"size:191;not null;uniqueIndex" json:"organization_id"`
	PlanTier                 PlanTier  `gorm:"size:50;not null" json:"plan_tier"`
	PaystackSubscriptionCode string    `gorm:"size:191" json:"paystack_subscription_code,omitempty"`
	PaystackCustomerCode     string    `gorm:"size:191" json:"paystack_customer_code,omitempty"`
	Status                   string    `gorm:"size:50;not null;default:'ACTIVE'" json:"status"`
	CurrentPeriodStart       time.Time `json:"current_period_start"`
	CurrentPeriodEnd         time.Time `json:"current_period_end"`
	CancelAtPeriodEnd        bool      `gorm:"default:false" json:"cancel_at_period_end"`
	CreatedAt                time.Time `json:"created_at"`
	UpdatedAt                time.Time `json:"updated_at"`
}

func (Subscription) TableName() string {
	return "Subscription"
}

// SubscriptionPlan represents dynamic subscription blueprints stored in MySQL
type SubscriptionPlan struct {
	ID               string    `gorm:"primaryKey;size:191" json:"id"`
	Category         string    `gorm:"size:50;not null;index" json:"category"` // OFIA_AI, OFIA_SHOP, OFIA_ENTERPRISE, OFIA_COMPASS
	CategoryLabel    string    `gorm:"size:100;not null" json:"category_label"`
	Tier             PlanTier  `gorm:"size:50;not null" json:"tier"` // FREE_TRIAL, STARTER, GROWTH, SCALE, ENTERPRISE
	Name             string    `gorm:"size:191;not null" json:"name"`
	PriceNGN         float64   `gorm:"not null" json:"price_ngn"`
	PriceUSD         float64   `gorm:"default:0" json:"price_usd"`
	Period           string    `gorm:"size:50;default:'Monthly'" json:"period"`
	Badge            string    `gorm:"size:100" json:"badge"`
	Description      string    `gorm:"type:text" json:"description"`
	LeadsLimit       int       `gorm:"default:1000" json:"leads_limit"`
	CampaignsLimit   int       `gorm:"default:3" json:"campaigns_limit"`
	TeamSeats        int       `gorm:"default:5" json:"team_seats"`
	TokensLimit      int64     `gorm:"default:0" json:"tokens_limit"`
	StorefrontsLimit int       `gorm:"default:0" json:"storefronts_limit"`
	FeaturesJSON     string    `gorm:"type:text" json:"features_json"` // JSON string array
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (SubscriptionPlan) TableName() string {
	return "SubscriptionPlan"
}

// OrganizationUsage tracks monthly quota consumption for enforcement
type OrganizationUsage struct {
	ID                   string    `gorm:"primaryKey;size:191" json:"id"`
	OrganizationID       string    `gorm:"size:191;not null;uniqueIndex:org_period_uniq" json:"organization_id"`
	Period               string    `gorm:"size:7;not null;uniqueIndex:org_period_uniq" json:"period"` // YYYY-MM
	LeadsResearched      int       `gorm:"default:0" json:"leads_researched"`
	EmailsSent           int       `gorm:"default:0" json:"emails_sent"`
	WhatsAppMessagesSent int       `gorm:"default:0" json:"whatsapp_messages_sent"`
	AITokensUsed         int64     `gorm:"default:0" json:"ai_tokens_used"`
	AICostUSD            float64   `gorm:"default:0" json:"ai_cost_usd"`
	UpdatedAt            time.Time `json:"updated_at"`
}

func (OrganizationUsage) TableName() string {
	return "OrganizationUsage"
}

// Wallet for marketplace and Paystack transactions
type Wallet struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	UserID    string    `gorm:"size:191;not null;uniqueIndex" json:"user_id"`
	Balance   float64   `gorm:"default:0" json:"balance"`
	CreatedAt time.Time `json:"created_at"`
}

func (Wallet) TableName() string {
	return "Wallet"
}

type Transaction struct {
	ID        string    `gorm:"primaryKey;size:191" json:"id"`
	WalletID  string    `gorm:"size:191;not null" json:"wallet_id"`
	Amount    float64   `gorm:"not null" json:"amount"`
	Type      string    `gorm:"size:50;not null" json:"type"`
	Status    string    `gorm:"size:50;not null" json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

func (Transaction) TableName() string {
	return "Transaction"
}

// TenantRolePermission defines module access toggles per role for a tenant
type TenantRolePermission struct {
	ID             string    `gorm:"primaryKey;size:191" json:"id"`
	TenantID       string    `gorm:"column:tenantId;size:191;not null;uniqueIndex:tenant_role_module_uniq" json:"tenant_id"`
	Role           string    `gorm:"size:50;not null;uniqueIndex:tenant_role_module_uniq" json:"role"`
	ModuleKey      string    `gorm:"column:moduleKey;size:50;not null;uniqueIndex:tenant_role_module_uniq" json:"module_key"`
	IsEnabled      bool      `gorm:"column:isEnabled;not null;default:true" json:"is_enabled"`
	AllowedActions string    `gorm:"column:allowedActions;type:json" json:"allowed_actions,omitempty"`
	CreatedAt      time.Time `gorm:"column:createdAt" json:"created_at"`
	UpdatedAt      time.Time `gorm:"column:updatedAt" json:"updated_at"`
}

func (TenantRolePermission) TableName() string {
	return "TenantRolePermission"
}

// TenantPermissionAuditLog records changes made to role permissions
type TenantPermissionAuditLog struct {
	ID            string    `gorm:"primaryKey;size:191" json:"id"`
	TenantID      string    `gorm:"column:tenantId;size:191;not null;index:idx_audit_tenant" json:"tenant_id"`
	ActorUserID   string    `gorm:"column:actorUserId;size:191;not null" json:"actor_user_id"`
	TargetRole    string    `gorm:"column:targetRole;size:50;not null" json:"target_role"`
	ModuleKey     string    `gorm:"column:moduleKey;size:50;not null" json:"module_key"`
	PreviousState bool      `gorm:"column:previousState;not null" json:"previous_state"`
	NewState      bool      `gorm:"column:newState;not null" json:"new_state"`
	IPAddress     string    `gorm:"column:ipAddress;size:45" json:"ip_address,omitempty"`
	CreatedAt     time.Time `gorm:"column:createdAt" json:"created_at"`
}

func (TenantPermissionAuditLog) TableName() string {
	return "TenantPermissionAuditLog"
}


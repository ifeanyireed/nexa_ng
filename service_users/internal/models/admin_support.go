package models

import (
	"time"
)

type PlatformSetting struct {
	ID                     string    `gorm:"primaryKey;size:64" json:"id"`
	PlatformName           string    `gorm:"size:191;default:'Ofia Enterprise Cloud'" json:"platform_name"`
	RootDomain             string    `gorm:"size:191;default:'ofia.ng'" json:"root_domain"`
	SupportEmail           string    `gorm:"size:191;default:'support@ofia.ng'" json:"support_email"`
	SecurityEmail          string    `gorm:"size:191;default:'security@ofia.ng'" json:"security_email"`
	DefaultCurrency        string    `gorm:"size:20;default:'NGN'" json:"default_currency"`
	DefaultTimezone        string    `gorm:"size:100;default:'Africa/Lagos'" json:"default_timezone"`
	SessionTimeoutHours    int       `gorm:"default:168" json:"session_timeout_hours"`
	Enforce2FA             bool      `gorm:"column:enforce_2fa;default:false" json:"enforce_2fa"`
	MaintenanceMode        bool      `gorm:"default:false" json:"maintenance_mode"`
	BroadcastBannerEnabled bool      `gorm:"default:false" json:"broadcast_banner_enabled"`
	BroadcastBannerText    string    `gorm:"type:text" json:"broadcast_banner_text"`
	BroadcastBannerType    string    `gorm:"size:50;default:'info'" json:"broadcast_banner_type"`
	UpdatedAt              time.Time `json:"updated_at"`
}

func (PlatformSetting) TableName() string {
	return "platform_settings"
}

type TenantSmtpSetting struct {
	TenantSlug string    `gorm:"primaryKey;size:191" json:"tenant_slug"`
	Provider   string    `gorm:"size:50;default:'custom'" json:"provider"`
	Host       string    `gorm:"size:191" json:"host"`
	Port       int       `gorm:"default:587" json:"port"`
	Encryption string    `gorm:"size:20;default:'tls'" json:"encryption"`
	FromEmail  string    `gorm:"size:191" json:"from_email"`
	FromName   string    `gorm:"size:191" json:"from_name"`
	Username   string    `gorm:"size:191" json:"username"`
	Password   string    `gorm:"size:255" json:"password"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (TenantSmtpSetting) TableName() string {
	return "tenant_smtp_settings"
}

type ContactInquiry struct {
	ID              string    `gorm:"primaryKey;size:64" json:"id"`
	TicketNumber    string    `gorm:"size:64;index" json:"ticket_number"`
	Name            string    `gorm:"size:191" json:"name"`
	Email           string    `gorm:"size:191;index" json:"email"`
	Phone           string    `gorm:"size:50" json:"phone"`
	Subject         string    `gorm:"size:255" json:"subject"`
	Message         string    `gorm:"type:text" json:"message"`
	Priority        string    `gorm:"size:30;default:'MEDIUM'" json:"priority"`
	Status          string    `gorm:"size:30;default:'OPEN';index" json:"status"`
	AssignedTo      *string   `gorm:"size:191" json:"assigned_to"`
	ResolutionNotes *string   `gorm:"type:text" json:"resolution_notes"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (ContactInquiry) TableName() string {
	return "contact_inquiries"
}

type WaitlistLead struct {
	ID                 string    `gorm:"primaryKey;size:64" json:"id"`
	QueueNumber        int       `gorm:"default:1000;index" json:"queue_number"`
	FullName           string    `gorm:"size:191" json:"full_name"`
	BusinessName       string    `gorm:"size:191" json:"business_name"`
	Email              string    `gorm:"size:191;index" json:"email"`
	Phone              string    `gorm:"size:50;index" json:"phone"`
	Role               string    `gorm:"size:50;default:'MERCHANT'" json:"role"`
	BusinessType       string    `gorm:"size:100;default:'Retail Store'" json:"business_type"`
	ToolType           string    `gorm:"size:100;default:'Full Ecosystem'" json:"tool_type"`
	CustomBusinessType *string   `gorm:"size:191" json:"custom_business_type"`
	CustomToolType     *string   `gorm:"size:191" json:"custom_tool_type"`
	Niche              string    `gorm:"size:50;default:'general'" json:"niche"`
	State              string    `gorm:"size:50;default:'Lagos'" json:"state"`
	City               string    `gorm:"size:100;default:'Ikeja'" json:"city"`
	TeamSize           string    `gorm:"size:50;default:'1-5'" json:"team_size"`
	FeaturesInterest   string    `gorm:"type:text" json:"features_interest"`
	ReferralCode       string    `gorm:"size:64;uniqueIndex" json:"referral_code"`
	ReferredBy         *string   `gorm:"size:64" json:"referred_by"`
	Status             string    `gorm:"size:30;default:'PENDING';index" json:"status"`
	InviteCode         *string   `gorm:"size:64" json:"invite_code"`
	Notes              *string   `gorm:"type:text" json:"notes"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

func (WaitlistLead) TableName() string {
	return "waitlist_leads"
}

type SupportTicket struct {
	ID           string    `gorm:"primaryKey;size:64" json:"id"`
	TicketNumber string    `gorm:"size:64;uniqueIndex" json:"ticket_number"`
	Subject      string    `gorm:"size:255" json:"subject"`
	Category     string    `gorm:"size:100" json:"category"`
	Priority     string    `gorm:"size:30;default:'MEDIUM'" json:"priority"`
	Status       string    `gorm:"size:30;default:'open'" json:"status"`
	AssignedTo   *string   `gorm:"size:191" json:"assigned_to"`
	ContactName  string    `gorm:"size:191" json:"contact_name"`
	ContactEmail string    `gorm:"size:191" json:"contact_email"`
	TenantSlug   string    `gorm:"size:191;default:'global'" json:"tenant_slug"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (SupportTicket) TableName() string {
	return "support_tickets"
}

type SupportTicketMessage struct {
	ID         string    `gorm:"primaryKey;size:64" json:"id"`
	TicketID   string    `gorm:"size:64;index" json:"ticket_id"`
	SenderType string    `gorm:"size:30" json:"sender_type"`
	SenderName string    `gorm:"size:191" json:"sender_name"`
	Message    string    `gorm:"type:text" json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}

func (SupportTicketMessage) TableName() string {
	return "support_ticket_messages"
}

type SupportKbCategory struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	Name        string    `gorm:"size:191" json:"name"`
	Slug        string    `gorm:"size:191;uniqueIndex" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Order       int       `gorm:"default:0" json:"order"`
	CreatedAt   time.Time `json:"created_at"`
}

func (SupportKbCategory) TableName() string {
	return "support_kb_categories"
}

type SupportKbArticle struct {
	ID         string    `gorm:"primaryKey;size:64" json:"id"`
	Title      string    `gorm:"size:255" json:"title"`
	Slug       string    `gorm:"size:255;uniqueIndex" json:"slug"`
	Content    string    `gorm:"type:text" json:"content"`
	Category   string    `gorm:"size:100" json:"category"`
	CategoryID *string   `gorm:"size:64" json:"category_id"`
	Status     string    `gorm:"size:30;default:'published'" json:"status"`
	Views      int       `gorm:"default:0" json:"views"`
	Order      int       `gorm:"default:0" json:"order"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func (SupportKbArticle) TableName() string {
	return "support_kb_articles"
}

type SupportChatSession struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	VisitorName string    `gorm:"size:191" json:"visitor_name"`
	Email       string    `gorm:"size:191" json:"email"`
	Status      string    `gorm:"size:30;default:'active'" json:"status"`
	TenantSlug  string    `gorm:"size:191;default:'global'" json:"tenant_slug"`
	LastMessage *string   `gorm:"type:text" json:"last_message"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (SupportChatSession) TableName() string {
	return "support_chat_sessions"
}

type SupportChatMessage struct {
	ID        string    `gorm:"primaryKey;size:64" json:"id"`
	SessionID string    `gorm:"size:64;index" json:"session_id"`
	Sender    string    `gorm:"size:50" json:"sender"`
	Text      string    `gorm:"type:text" json:"text"`
	Timestamp time.Time `json:"timestamp"`
}

func (SupportChatMessage) TableName() string {
	return "support_chat_messages"
}

type SupportStaffStatus struct {
	ID            string    `gorm:"primaryKey;size:64" json:"id"`
	StaffEmail    string    `gorm:"size:191;uniqueIndex" json:"staff_email"`
	StaffName     string    `gorm:"size:191" json:"staff_name"`
	IsOnline      bool      `gorm:"default:false" json:"is_online"`
	LastHeartbeat time.Time `json:"last_heartbeat"`
}

func (SupportStaffStatus) TableName() string {
	return "support_staff_status"
}

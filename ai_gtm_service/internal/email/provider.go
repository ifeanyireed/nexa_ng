package email

import (
	"context"
	"time"
)

type OutboundEmail struct {
	OrganizationID string            `json:"organization_id"`
	CampaignID     string            `json:"campaign_id,omitempty"`
	To             string            `json:"to"`
	ToName         string            `json:"to_name,omitempty"`
	From           string            `json:"from,omitempty"`
	FromName       string            `json:"from_name,omitempty"`
	ReplyTo        string            `json:"reply_to,omitempty"`
	Subject        string            `json:"subject"`
	HTMLBody       string            `json:"html_body"`
	TextBody       string            `json:"text_body,omitempty"`
	Headers        map[string]string `json:"headers,omitempty"`
}

type SendResult struct {
	MessageID string        `json:"message_id"`
	Provider  string        `json:"provider"`
	Domain    string        `json:"domain"`
	Status    string        `json:"status"` // DELIVERED, QUEUED, FAILED
	Latency   time.Duration `json:"latency"`
}

type DNSRecord struct {
	RecordType string `json:"record_type"` // TXT, CNAME, MX
	Name       string `json:"name"`
	Value      string `json:"value"`
	TTL        string `json:"ttl"`
	Status     string `json:"status"` // VERIFIED, PENDING, FAILED
	Purpose    string `json:"purpose"` // DKIM, SPF, DMARC, Return-Path
}

type DomainVerificationResult struct {
	Domain      string      `json:"domain"`
	Status      string      `json:"status"` // PENDING, VERIFIED, FAILED
	Records     []DNSRecord `json:"records"`
	DKIMRecord  string      `json:"dkim_record"`
	SPFRecord   string      `json:"spf_record"`
	DMARCRecord string      `json:"dmarc_record"`
	MXRecord    string      `json:"mx_record"`
}

type DomainStatus struct {
	Domain      string `json:"domain"`
	Status      string `json:"status"` // VERIFIED, PENDING, FAILED, UNCONFIGURED
	DKIMValid   bool   `json:"dkim_valid"`
	SPFValid    bool   `json:"spf_valid"`
	DMARCValid  bool   `json:"dmarc_valid"`
	MXValid     bool   `json:"mx_valid"`
	LastChecked string `json:"last_checked"`
}

type ProviderHealth struct {
	ProviderName string `json:"provider_name"`
	Status       string `json:"status"` // HEALTHY, DEGRADED, OFFLINE
	LatencyMs    int    `json:"latency_ms"`
	DailySent    int    `json:"daily_sent"`
	DailyQuota   int    `json:"daily_quota"`
}

// EmailProvider defines the clean provider-agnostic interface
type EmailProvider interface {
	GetProviderName() string
	Send(ctx context.Context, email OutboundEmail) (*SendResult, error)
	VerifyDomain(ctx context.Context, domain string) (*DomainVerificationResult, error)
	CheckDomainStatus(ctx context.Context, domain string) (*DomainStatus, error)
	GetHealth(ctx context.Context) (*ProviderHealth, error)
}

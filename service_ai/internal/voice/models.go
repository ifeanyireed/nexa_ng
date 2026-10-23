package voice

import (
	"time"
)

type DialogueSpeaker string

const (
	SpeakerAssistant DialogueSpeaker = "assistant"
	SpeakerProspect  DialogueSpeaker = "prospect"
	SpeakerSystem    DialogueSpeaker = "system"
)

type DialogueTurn struct {
	Speaker   DialogueSpeaker `json:"speaker"`
	Text      string          `json:"text"`
	Timestamp time.Time       `json:"timestamp"`
	LatencyMs int             `json:"latency_ms,omitempty"`
}

type QualificationResult struct {
	Status            string   `json:"status"` // QUALIFIED, NEEDS_REVIEW, NOT_INTERESTED, CALLBACK_REQUESTED
	Score             int      `json:"score"`
	NeedsIdentified   []string `json:"needs_identified"`
	Objections        []string `json:"objections"`
	FleetSizeEstimate string   `json:"fleet_size_estimate,omitempty"`
	BudgetConfirmed   bool     `json:"budget_confirmed"`
	KeyPainPoints     []string `json:"key_pain_points"`
	Reason            string   `json:"reason"`
}

type VoiceSession struct {
	ID              string               `json:"id"`
	OrganizationID  string               `json:"organization_id"`
	LeadID          string               `json:"lead_id,omitempty"`
	CampaignID      string               `json:"campaign_id,omitempty"`
	ContactName     string               `json:"contact_name"`
	Company         string               `json:"company"`
	PhoneNumber     string               `json:"phone_number"`
	State           string               `json:"state"` // GREETING, DISCOVERY, OBJECTION_HANDLING, CLOSING, COMPLETED, TRANSFERRED
	Turns           []DialogueTurn       `json:"turns"`
	StartedAt       time.Time            `json:"started_at"`
	EndedAt         *time.Time           `json:"ended_at,omitempty"`
	DurationSeconds int                  `json:"duration_seconds"`
	Outcome         string               `json:"outcome"`
	Qualification   *QualificationResult `json:"qualification,omitempty"`
	Summary         string               `json:"summary"`
	NextAction      string               `json:"next_action"`
	FollowupDate    string               `json:"followup_date,omitempty"`
	TelephonySID    string               `json:"telephony_sid,omitempty"`
	Provider        string               `json:"provider"` // WEBRTC_BROWSER, TWILIO, TERMII, AFRICASTALKING
	RecordingURL    string               `json:"recording_url,omitempty"`
}

type VoiceConfig struct {
	OrganizationID       string `json:"organization_id"`
	AgentName            string `json:"agent_name"`
	VoiceID              string `json:"voice_id"`
	ModelName            string `json:"model_name"`
	AIDisclosureEnabled  bool   `json:"ai_disclosure_enabled"`
	AIDisclosureText     string `json:"ai_disclosure_text"`
	MaxDurationSec       int    `json:"max_duration_sec"`
	HumanEscalationPhone string `json:"human_escalation_phone"`
	OpeningHook          string `json:"opening_hook"`
	ValueProposition     string `json:"value_proposition"`
	TelephonyProvider    string `json:"telephony_provider"`
	TelephonyAccountSID  string `json:"telephony_account_sid,omitempty"`
	TelephonyAuthToken   string `json:"telephony_auth_token,omitempty"`
	FromPhoneNumber      string `json:"from_phone_number,omitempty"`
	TermiiAPIKey         string `json:"termii_api_key,omitempty"`
	VoicebipAPIKey       string `json:"voicebip_api_key,omitempty"`
	VoicebipAPISecret    string `json:"voicebip_api_secret,omitempty"`
	VoicebipSIPEndpoint  string `json:"voicebip_sip_endpoint,omitempty"`
	ElevenLabsAPIKey     string `json:"elevenlabs_api_key,omitempty"`
	CallingHoursStart    string `json:"calling_hours_start,omitempty"`
	CallingHoursEnd      string `json:"calling_hours_end,omitempty"`
	MaxRetries           int    `json:"max_retries,omitempty"`
	AutoWhatsAppDeck     bool   `json:"auto_whatsapp_deck"`
}

type OutboundCallRequest struct {
	LeadID      string `json:"leadId"`
	ContactName string `json:"contactName"`
	Company     string `json:"company"`
	PhoneNumber string `json:"phoneNumber"`
	CampaignID  string `json:"campaignId"`
	Provider    string `json:"provider"` // "WEBRTC_BROWSER" | "TWILIO" | "TERMII"
}

type OutboundCallResponse struct {
	Success      bool          `json:"success"`
	SessionID    string        `json:"sessionId"`
	TelephonySID string        `json:"telephonySid,omitempty"`
	Status       string        `json:"status"`
	Session      *VoiceSession `json:"session,omitempty"`
	Message      string        `json:"message"`
}

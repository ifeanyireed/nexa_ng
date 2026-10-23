package voice

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all frontend origins for testing
	},
}

type VoiceEngine struct {
	db        *gorm.DB
	gemini    *GeminiClient
	crmSync   *CRMSyncService
	telephony *TelephonyGateway

	sessionsMu sync.RWMutex
	sessions   map[string]*VoiceSession
	configsMu  sync.RWMutex
	configs    map[string]*VoiceConfig
}

func NewVoiceEngine(db *gorm.DB) *VoiceEngine {
	return &VoiceEngine{
		db:        db,
		gemini:    NewGeminiClient(""),
		crmSync:   NewCRMSyncService(db),
		telephony: NewTelephonyGateway(),
		sessions:  make(map[string]*VoiceSession),
		configs:   make(map[string]*VoiceConfig),
	}
}

func (e *VoiceEngine) GetConfig(orgID string) *VoiceConfig {
	e.configsMu.RLock()
	defer e.configsMu.RUnlock()

	if cfg, ok := e.configs[orgID]; ok {
		return cfg
	}

	// Default Ofia Corporate Outreach Voice Agent configuration
	return &VoiceConfig{
		OrganizationID:       orgID,
		AgentName:            "Ofia Executive Assistant",
		VoiceID:              "en-NG-Standard-A",
		ModelName:            "gemini-1.5-flash",
		AIDisclosureEnabled:  true,
		AIDisclosureText:     "Hello, I am Ofia's automated executive assistant calling on behalf of Ofia Mobility.",
		MaxDurationSec:       300,
		HumanEscalationPhone: "+2348000000000",
		OpeningHook:          "We help corporate teams in Lagos and Abuja eliminate staff transit delays with dedicated bus shuttles and real-time tracking.",
		ValueProposition:     "25-35% cost reduction on corporate transport with guaranteed standby replacement buses.",
		TelephonyProvider:    "VOICEBIP",
	}
}

func (e *VoiceEngine) SaveConfig(cfg *VoiceConfig) {
	e.configsMu.Lock()
	defer e.configsMu.Unlock()
	e.configs[cfg.OrganizationID] = cfg
}

func (e *VoiceEngine) CreateSession(req OutboundCallRequest, orgID string) (*VoiceSession, error) {
	sessionID := fmt.Sprintf("CALL-AI-%d", time.Now().UnixMilli())
	if req.LeadID == "" {
		req.LeadID = fmt.Sprintf("LEAD-%s", uuid.New().String()[:8])
	}

	session := &VoiceSession{
		ID:              sessionID,
		OrganizationID:  orgID,
		LeadID:          req.LeadID,
		CampaignID:      req.CampaignID,
		ContactName:     req.ContactName,
		Company:         req.Company,
		PhoneNumber:     req.PhoneNumber,
		State:           "INITIATED",
		Turns:           []DialogueTurn{},
		StartedAt:       time.Now(),
		DurationSeconds: 0,
		Provider:        req.Provider,
	}

	if session.Provider == "" {
		session.Provider = "VOICEBIP"
	}

	e.sessionsMu.Lock()
	e.sessions[sessionID] = session
	e.sessionsMu.Unlock()

	// Initial greeting turn
	config := e.GetConfig(orgID)
	greeting := fmt.Sprintf("Good day, %s. %s I am calling from Ofia regarding staff transportation and corporate shuttle logistics for %s.",
		session.ContactName, config.AIDisclosureText, session.Company)

	session.Turns = append(session.Turns, DialogueTurn{
		Speaker:   SpeakerAssistant,
		Text:      greeting,
		Timestamp: time.Now(),
	})
	session.State = "GREETING"

	return session, nil
}

func (e *VoiceEngine) GetSession(sessionID string) (*VoiceSession, bool) {
	e.sessionsMu.RLock()
	defer e.sessionsMu.RUnlock()
	sess, ok := e.sessions[sessionID]
	return sess, ok
}

func (e *VoiceEngine) ListSessions(orgID string) []*VoiceSession {
	e.sessionsMu.RLock()
	defer e.sessionsMu.RUnlock()

	var list []*VoiceSession
	for _, s := range e.sessions {
		if orgID == "" || s.OrganizationID == orgID {
			list = append(list, s)
		}
	}
	return list
}

func (e *VoiceEngine) ProcessProspectSpeech(ctx context.Context, sessionID string, speechText string) (string, error) {
	e.sessionsMu.Lock()
	session, ok := e.sessions[sessionID]
	if !ok {
		e.sessionsMu.Unlock()
		return "", fmt.Errorf("session %s not found", sessionID)
	}

	session.Turns = append(session.Turns, DialogueTurn{
		Speaker:   SpeakerProspect,
		Text:      speechText,
		Timestamp: time.Now(),
	})
	session.State = "DISCOVERY"
	e.sessionsMu.Unlock()

	// Generate assistant voice reply via Gemini
	reply, err := e.gemini.GenerateVoiceTurn(ctx, session, speechText)
	if err != nil {
		reply = "Thank you. Could we arrange for our corporate transport specialist to send you a 1-page overview and schedule a brief follow-up?"
	}

	e.sessionsMu.Lock()
	session.Turns = append(session.Turns, DialogueTurn{
		Speaker:   SpeakerAssistant,
		Text:      reply,
		Timestamp: time.Now(),
	})
	e.sessionsMu.Unlock()

	return reply, nil
}

func (e *VoiceEngine) FinalizeCall(ctx context.Context, sessionID string) (*VoiceSession, error) {
	e.sessionsMu.Lock()
	session, ok := e.sessions[sessionID]
	if !ok {
		e.sessionsMu.Unlock()
		return nil, fmt.Errorf("session %s not found", sessionID)
	}

	now := time.Now()
	session.EndedAt = &now
	session.DurationSeconds = int(now.Sub(session.StartedAt).Seconds())
	if session.DurationSeconds <= 0 {
		session.DurationSeconds = 15
	}
	session.State = "COMPLETED"
	e.sessionsMu.Unlock()

	// Extract qualification, outcome, summary via Gemini
	qual, outcome, summary, nextAction, _ := e.gemini.ExtractCallOutcome(ctx, session)

	e.sessionsMu.Lock()
	session.Outcome = outcome
	session.Qualification = qual
	session.Summary = summary
	session.NextAction = nextAction
	e.sessionsMu.Unlock()

	// Asynchronously sync directly to PostgreSQL CRM tables
	go func() {
		if err := e.crmSync.SyncCompletedCall(session); err != nil {
			log.Printf("[VoiceEngine] CRM sync failed for call %s: %v", session.ID, err)
		}
	}()

	return session, nil
}

// HandleWebSocketStream handles real-time audio and text streaming for both browser testing and telephony media streams
func (e *VoiceEngine) HandleWebSocketStream(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[Voice-WS] Upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	log.Printf("[Voice-WS] Client connected from %s", r.RemoteAddr)

	var currentSession *VoiceSession
	ctx := context.Background()

	// Send ready event
	_ = conn.WriteJSON(map[string]interface{}{
		"event":   "ready",
		"message": "Ofia Voice Agent engine active. Ready for streaming dialogue.",
	})

	for {
		var incoming map[string]interface{}
		if err := conn.ReadJSON(&incoming); err != nil {
			log.Printf("[Voice-WS] Disconnected: %v", err)
			break
		}

		eventType, _ := incoming["event"].(string)

		switch eventType {
		case "start_session":
			contactName, _ := incoming["contactName"].(string)
			company, _ := incoming["company"].(string)
			phone, _ := incoming["phoneNumber"].(string)
			leadID, _ := incoming["leadId"].(string)
			campaignID, _ := incoming["campaignId"].(string)
			orgID, _ := incoming["orgId"].(string)
			if orgID == "" {
				orgID = r.URL.Query().Get("tenant")
			}
			if orgID == "" {
				orgID = r.URL.Query().Get("orgId")
			}
			if orgID == "" {
				orgID = r.Header.Get("x-tenant-slug")
			}
			if orgID == "" {
				orgID = "default"
			}
			orgID = strings.ToLower(strings.TrimSpace(orgID))
			prov, _ := incoming["provider"].(string)
			if prov == "" {
				prov = "VOICEBIP"
			}
			if contactName == "" {
				contactName = "Prospective Partner"
			}
			if company == "" {
				company = "Enterprise Prospect"
			}

			sess, err := e.CreateSession(OutboundCallRequest{
				LeadID:      leadID,
				ContactName: contactName,
				Company:     company,
				PhoneNumber: phone,
				CampaignID:  campaignID,
				Provider:    prov,
			}, orgID)

			if err != nil {
				_ = conn.WriteJSON(map[string]interface{}{
					"event": "error",
					"error": err.Error(),
				})
				continue
			}

			currentSession = sess
			firstTurn := sess.Turns[0]

			_ = conn.WriteJSON(map[string]interface{}{
				"event":        "session_started",
				"sessionId":    sess.ID,
				"greeting":     firstTurn.Text,
				"state":        sess.State,
				"contactName":  sess.ContactName,
				"company":      sess.Company,
			})

		case "user_speech", "prospect_input":
			text, _ := incoming["text"].(string)
			if text == "" {
				continue
			}

			if currentSession == nil {
				// Auto-create dummy session if not started explicitly
				currentSession, _ = e.CreateSession(OutboundCallRequest{
					ContactName: "Executive Prospect",
					Company:     "Corporate Prospect Ltd",
					PhoneNumber: "+2348000000000",
				}, "default")
			}

			_ = conn.WriteJSON(map[string]interface{}{
				"event":   "agent_thinking",
				"message": "Analyzing dialogue and retrieving Ofia fleet context...",
			})

			reply, err := e.ProcessProspectSpeech(ctx, currentSession.ID, text)
			if err != nil {
				reply = "Understood. I will have our fleet solutions director send our corporate shuttle overview to your team."
			}

			_ = conn.WriteJSON(map[string]interface{}{
				"event":     "assistant_reply",
				"sessionId": currentSession.ID,
				"text":      reply,
				"state":     currentSession.State,
			})

		case "end_call", "hangup":
			if currentSession != nil {
				finalSession, _ := e.FinalizeCall(ctx, currentSession.ID)
				_ = conn.WriteJSON(map[string]interface{}{
					"event":          "call_completed",
					"sessionId":      finalSession.ID,
					"outcome":        finalSession.Outcome,
					"duration":       finalSession.DurationSeconds,
					"summary":        finalSession.Summary,
					"qualification":  finalSession.Qualification,
					"nextAction":     finalSession.NextAction,
					"crmSynced":      true,
				})
				currentSession = nil
			}
		}
	}

	if currentSession != nil && currentSession.State != "COMPLETED" {
		_, _ = e.FinalizeCall(ctx, currentSession.ID)
	}
}

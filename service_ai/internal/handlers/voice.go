package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/voice"
)

type VoiceHandler struct {
	engine *voice.VoiceEngine
	db     *gorm.DB
}

func NewVoiceHandler(db *gorm.DB) *VoiceHandler {
	return &VoiceHandler{
		engine: voice.NewVoiceEngine(db),
		db:     db,
	}
}

// HandleVoiceStream routes WebSocket connections to the VoiceEngine
func (h *VoiceHandler) HandleVoiceStream(w http.ResponseWriter, r *http.Request) {
	h.engine.HandleWebSocketStream(w, r)
}

// InitiateOutboundCall starts an outbound voice outreach call
func (h *VoiceHandler) InitiateOutboundCall(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = "default"
	}

	var req voice.OutboundCallRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if strings.TrimSpace(req.ContactName) == "" {
		http.Error(w, `{"error": "Contact name is required"}`, http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.PhoneNumber) == "" {
		http.Error(w, `{"error": "Phone number is required"}`, http.StatusBadRequest)
		return
	}

	session, err := h.engine.CreateSession(req, orgID)
	if err != nil {
		http.Error(w, `{"error": "Failed to create voice session"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(voice.OutboundCallResponse{
		Success:      true,
		SessionID:    session.ID,
		TelephonySID: session.TelephonySID,
		Status:       session.State,
		Session:      session,
		Message:      "Voice session initiated successfully",
	})
}

// ListVoiceCalls returns call history for an organization
func (h *VoiceHandler) ListVoiceCalls(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	sessions := h.engine.ListSessions(orgID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"calls":   sessions,
		"count":   len(sessions),
	})
}

// GetVoiceCall retrieves a single call session by ID
func (h *VoiceHandler) GetVoiceCall(w http.ResponseWriter, r *http.Request) {
	callID := chi.URLParam(r, "id")
	session, found := h.engine.GetSession(callID)
	if !found {
		http.Error(w, `{"error": "Voice session not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(session)
}

// FinalizeVoiceCall manually triggers post-call processing and CRM sync
func (h *VoiceHandler) FinalizeVoiceCall(w http.ResponseWriter, r *http.Request) {
	callID := chi.URLParam(r, "id")
	session, err := h.engine.FinalizeCall(r.Context(), callID)
	if err != nil {
		http.Error(w, `{"error": "Failed to finalize voice call"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"session":   session,
		"crmSynced": true,
	})
}

// GetVoiceConfig returns the current tenant voice configuration
func (h *VoiceHandler) GetVoiceConfig(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = r.URL.Query().Get("tenant")
	}
	if orgID == "" {
		orgID = r.URL.Query().Get("slug")
	}
	if orgID == "" {
		orgID = r.Header.Get("x-tenant-slug")
	}
	if orgID == "" {
		orgID = "default"
	}
	orgID = strings.ToLower(strings.TrimSpace(orgID))

	cfg := h.engine.GetConfig(orgID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(cfg)
}

// UpdateVoiceConfig updates tenant voice settings
func (h *VoiceHandler) UpdateVoiceConfig(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var cfg voice.VoiceConfig
	if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
		http.Error(w, `{"error": "Invalid JSON"}`, http.StatusBadRequest)
		return
	}

	if orgID == "" {
		orgID = cfg.OrganizationID
	}
	if orgID == "" {
		orgID = r.URL.Query().Get("tenant")
	}
	if orgID == "" {
		orgID = r.Header.Get("x-tenant-slug")
	}
	if orgID == "" {
		orgID = "default"
	}
	cfg.OrganizationID = strings.ToLower(strings.TrimSpace(orgID))
	h.engine.SaveConfig(&cfg)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"config":  cfg,
		"message": "Voice configuration updated successfully",
	})
}

// HandleTelephonyWebhook receives status updates from telephony providers
func (h *VoiceHandler) HandleTelephonyWebhook(w http.ResponseWriter, r *http.Request) {
	_ = r.ParseForm()
	callStatus := r.FormValue("CallStatus")
	callSID := r.FormValue("CallSid")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"received":   true,
		"callStatus": callStatus,
		"callSid":    callSID,
	})
}

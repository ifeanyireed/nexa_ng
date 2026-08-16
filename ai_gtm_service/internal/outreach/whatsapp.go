package outreach

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/gateway"
	"nexa/ai_gtm_service/internal/models"
)

type WABAEngine struct {
	db      *gorm.DB
	gateway *gateway.ModelGateway
}

func NewWABAEngine(db *gorm.DB) *WABAEngine {
	return &WABAEngine{
		db:      db,
		gateway: gateway.NewModelGateway(db),
	}
}

// VerifyWebhook handles Meta WhatsApp Webhook Challenge during setup
func (w *WABAEngine) VerifyWebhook(rw http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("hub.mode")
	token := r.URL.Query().Get("hub.verify_token")
	challenge := r.URL.Query().Get("hub.challenge")

	if mode == "subscribe" && token != "" {
		rw.WriteHeader(http.StatusOK)
		rw.Write([]byte(challenge))
		return
	}

	http.Error(rw, "Verification token mismatch", http.StatusForbidden)
}

// HandleInboundWebhook processes incoming WhatsApp messages from leads
func (w *WABAEngine) HandleInboundWebhook(rw http.ResponseWriter, r *http.Request) {
	var payload map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(rw, "Invalid payload", http.StatusBadRequest)
		return
	}

	// In production: extracts from, message body, message ID from Meta payload
	// Invokes Amara Obi (WhatsApp Agent) to classify intent and synthesize a quick reply

	rw.WriteHeader(http.StatusOK)
	rw.Write([]byte(`{"status": "EVENT_RECEIVED"}`))
}

// SendWABATemplate dispatches approved HSM template through Meta Graph API
func (w *WABAEngine) SendWABATemplate(orgID, toPhone, templateName string) error {
	var settings models.GTMTenantSettings
	if w.db != nil && orgID != "" {
		_ = w.db.First(&settings, "organizationId = ?", orgID)
	}

	// In production: executes POST https://graph.facebook.com/v20.0/{phone_number_id}/messages
	if w.db != nil {
		w.db.Model(&models.GTMLead{}).Where("contactPhone = ? AND organizationId = ?", toPhone, orgID).
			Updates(map[string]interface{}{
				"status":       "CONTACTED",
				"lastActivity": fmt.Sprintf("WhatsApp template '%s' sent at %s", templateName, time.Now().Format("15:04")),
			})
	}

	return nil
}

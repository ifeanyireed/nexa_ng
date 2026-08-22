package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"
	"nexa/ai_gtm_service/internal/agents"
	"nexa/ai_gtm_service/internal/gateway"
	"nexa/ai_gtm_service/internal/models"
)

type AgentsHandler struct {
	db      *gorm.DB
	gateway *gateway.ModelGateway
}

func NewAgentsHandler(db *gorm.DB) *AgentsHandler {
	return &AgentsHandler{
		db:      db,
		gateway: gateway.NewModelGateway(db),
	}
}

type AgentChatRequest struct {
	Message string `json:"message"`
}

type AgentChatResponse struct {
	Sender    string `json:"sender"`
	Text      string `json:"text"`
	ModelUsed string `json:"model_used"`
	LatencyMs int    `json:"latency_ms"`
}

func (h *AgentsHandler) ListAgents(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = "default-org"
	}

	var agentList []models.AIAgent
	if h.db != nil {
		h.db.Where("organizationId = ?", orgID).Find(&agentList)
	}

	if len(agentList) == 0 {
		agentList = agents.GenerateDefaultAgentsForOrg(orgID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(agentList)
}

func (h *AgentsHandler) GetAgent(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	agentKey := chi.URLParam(r, "agentKey")

	var agent models.AIAgent
	if h.db != nil {
		if err := h.db.First(&agent, "organizationId = ? AND `key` = ?", orgID, agentKey).Error; err != nil {
			http.Error(w, `{"error": "Agent not found"}`, http.StatusNotFound)
			return
		}
	} else {
		for _, def := range agents.SwarmDefinitions {
			if def.Key == agentKey {
				agent = models.AIAgent{
					Key:             def.Key,
					Name:            def.Name,
					Role:            def.Role,
					Category:        def.Category,
					CurrentTask:     def.DefaultTask,
					Recommendation:  def.Recommendation,
					ConfidenceScore: def.ConfidenceScore,
					Status:          "ONLINE",
				}
				break
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(agent)
}

func (h *AgentsHandler) ChatWithAgent(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	agentKey := chi.URLParam(r, "agentKey")

	var req AgentChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	resp, _ := h.gateway.Complete(gateway.CompletionRequest{
		OrganizationID: orgID,
		AgentKey:       agentKey,
		Prompt:         req.Message,
	})

	output := AgentChatResponse{
		Sender:    agentKey,
		Text:      fmt.Sprintf("Understood. I have integrated your instruction: '%s' into my autonomous pipeline.", req.Message),
		ModelUsed: resp.ModelUsed,
		LatencyMs: resp.LatencyMs,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(output)
}

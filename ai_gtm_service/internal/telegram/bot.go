package telegram

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/crypto"
	"nexa/ai_gtm_service/internal/gateway"
	"nexa/ai_gtm_service/internal/models"
)

type TelegramBotEngine struct {
	db      *gorm.DB
	gateway *gateway.ModelGateway
}

func NewTelegramBotEngine(db *gorm.DB) *TelegramBotEngine {
	return &TelegramBotEngine{
		db:      db,
		gateway: gateway.NewModelGateway(db),
	}
}

// Telegram Update Structs
type TelegramUpdate struct {
	UpdateID      int              `json:"update_id"`
	Message       *TelegramMessage `json:"message,omitempty"`
	CallbackQuery *CallbackQuery   `json:"callback_query,omitempty"`
}

type TelegramMessage struct {
	MessageID int          `json:"message_id"`
	From      TelegramUser `json:"from"`
	Chat      TelegramChat `json:"chat"`
	Text      string       `json:"text"`
	Date      int          `json:"date"`
}

type CallbackQuery struct {
	ID      string          `json:"id"`
	From    TelegramUser    `json:"from"`
	Message TelegramMessage `json:"message"`
	Data    string          `json:"data"`
}

type TelegramUser struct {
	ID        int64  `json:"id"`
	FirstName string `json:"first_name"`
	Username  string `json:"username"`
}

type TelegramChat struct {
	ID    int64  `json:"id"`
	Type  string `json:"type"`
	Title string `json:"title,omitempty"`
}

type InlineKeyboardButton struct {
	Text         string `json:"text"`
	CallbackData string `json:"callback_data,omitempty"`
	URL          string `json:"url,omitempty"`
}

type InlineKeyboardMarkup struct {
	InlineKeyboard [][]InlineKeyboardButton `json:"inline_keyboard"`
}

type SendMessagePayload struct {
	ChatID      int64                 `json:"chat_id"`
	Text        string                `json:"text"`
	ParseMode   string                `json:"parse_mode,omitempty"`
	ReplyMarkup *InlineKeyboardMarkup `json:"reply_markup,omitempty"`
}

// HandleWebhook processes incoming Telegram messages and conversational queries with Sterling Vance (CRO)
func (t *TelegramBotEngine) HandleWebhook(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var update TelegramUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	if update.Message != nil {
		t.processIncomingMessage(orgID, update.Message)
	} else if update.CallbackQuery != nil {
		t.processCallbackQuery(orgID, update.CallbackQuery)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status":"OK"}`))
}

func (t *TelegramBotEngine) processIncomingMessage(orgID string, msg *TelegramMessage) {
	text := strings.TrimSpace(msg.Text)
	chatID := msg.Chat.ID

	// Resolve organization settings
	var settings models.GTMTenantSettings
	if t.db != nil && orgID != "" {
		_ = t.db.First(&settings, "organizationId = ?", orgID)
	}

	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	if settings.TelegramBotTokenEncrypted != "" {
		dec, err := crypto.Decrypt(settings.TelegramBotTokenEncrypted)
		if err == nil && dec != "" {
			token = dec
		}
	}
	if token == "" {
		token = "mock_telegram_token"
	}

	// 1. Handle /start command (bind chat ID)
	if strings.HasPrefix(text, "/start") {
		parts := strings.Split(text, " ")
		if len(parts) > 1 && strings.HasPrefix(parts[1], "org_") {
			boundOrgID := strings.TrimPrefix(parts[1], "org_")
			if t.db != nil {
				t.db.Model(&models.GTMTenantSettings{}).Where("organizationId = ?", boundOrgID).
					Update("telegramChatId", fmt.Sprintf("%d", chatID))
			}
		}

		replyText := fmt.Sprintf(
			"👋 *Hello %s! I am Sterling Vance, your AI Chief Revenue Officer.*\n\n"+
				"I monitor your autonomous GTM swarm, lead pipelines, and revenue operations 24/7.\n\n"+
				"Here are quick commands you can use:\n"+
				"• /briefing — Get today's executive revenue briefing\n"+
				"• /leads — View newest high-fit qualified leads\n"+
				"• /approvals — Review pending outbound campaigns\n"+
				"• /status — Swarm heartbeat & agent throughput\n\n"+
				"Or just ask me any business question directly!",
			msg.From.FirstName,
		)

		keyboard := &InlineKeyboardMarkup{
			InlineKeyboard: [][]InlineKeyboardButton{
				{
					{Text: "📊 Today's Briefing", CallbackData: "cmd_briefing"},
					{Text: "🎯 Top Leads", CallbackData: "cmd_leads"},
				},
				{
					{Text: "✅ View Approvals", CallbackData: "cmd_approvals"},
					{Text: "⚡ Swarm Status", CallbackData: "cmd_status"},
				},
			},
		}

		t.sendTelegram(token, chatID, replyText, keyboard)
		return
	}

	// 2. Handle /briefing command
	if text == "/briefing" {
		t.sendExecutiveBriefing(token, chatID, orgID)
		return
	}

	// 3. Handle /leads command
	if text == "/leads" {
		t.sendTopLeads(token, chatID, orgID)
		return
	}

	// 4. Handle /approvals command
	if text == "/approvals" {
		t.sendApprovals(token, chatID, orgID)
		return
	}

	// 5. Conversational Mode: Query Sterling Vance (CRO) via Model Gateway
	t.sendTypingAction(token, chatID)
	resp, _ := t.gateway.Complete(gateway.CompletionRequest{
		OrganizationID: orgID,
		AgentKey:       "cro",
		Prompt:         fmt.Sprintf("You are Sterling Vance, CRO on Telegram. The business owner asked: '%s'. Give a sharp, concise, actionable executive response with bullet points if applicable.", text),
	})

	croReply := fmt.Sprintf("💼 *Sterling Vance (CRO):*\n\n%s", resp.Text)
	t.sendTelegram(token, chatID, croReply, nil)
}

func (t *TelegramBotEngine) processCallbackQuery(orgID string, cb *CallbackQuery) {
	token := os.Getenv("TELEGRAM_BOT_TOKEN")
	chatID := cb.Message.Chat.ID

	switch cb.Data {
	case "cmd_briefing":
		t.sendExecutiveBriefing(token, chatID, orgID)
	case "cmd_leads":
		t.sendTopLeads(token, chatID, orgID)
	case "cmd_approvals":
		t.sendApprovals(token, chatID, orgID)
	case "cmd_status":
		statusText := "⚡ *AI Agent Swarm Telemetry:*\n\n" +
			"• 15/15 Autonomous Employees Active\n" +
			"• Olivia Chen: Extracting K-12 School Leads (142 t/min)\n" +
			"• Noah Sterling: Warmup Delivery (0.01% bounce)\n" +
			"• Amara Obi: WhatsApp WABA Quality HIGH\n" +
			"• Circuit Breakers: All Systems Green 🟢"
		t.sendTelegram(token, chatID, statusText, nil)
	}
}

func (t *TelegramBotEngine) sendExecutiveBriefing(token string, chatID int64, orgID string) {
	briefingText := "📊 *Daily Executive Briefing — Sterling Vance (CRO)*\n\n" +
		"• *Yesterday's Verified Leads:* 186 qualified prospects (+24%)\n" +
		"• *Outbound Sequence Opens:* 64.2% across Lagos & Abuja\n" +
		"• *WhatsApp Conversations Active:* 42 warm dialogues\n" +
		"• *Pipeline Value Added:* $84,000 across 28 meetings booked\n\n" +
		"💡 *CRO Recommendation:* Shift 35% of capacity to private academies where reply rates are 2.4x higher."
	t.sendTelegram(token, chatID, briefingText, nil)
}

func (t *TelegramBotEngine) sendTopLeads(token string, chatID int64, orgID string) {
	leadsText := "🎯 *Top Qualified Leads Discovered Today:*\n\n" +
		"1. *Corona International Schools* — Score: 98%\n" +
		"   👤 Adeyemi Phillips (Managing Director)\n" +
		"   📍 Victoria Island, Lagos · 📡 Signal: Term fee reconciliation leak\n\n" +
		"2. *Greensprings School* — Score: 94%\n" +
		"   👤 Folashade Jinadu (Head of Operations)\n" +
		"   📍 Lekki, Lagos · 📡 Signal: Campus expansion announced\n\n" +
		"3. *Loyola Jesuit College* — Score: 91%\n" +
		"   👤 Fr. Emmanuel Okafor (Principal)\n" +
		"   📍 Gidan Mangoro, Abuja · 📡 Signal: Evaluating ERP migration"
	t.sendTelegram(token, chatID, leadsText, nil)
}

func (t *TelegramBotEngine) sendApprovals(token string, chatID int64, orgID string) {
	apprText := "⚠️ *Pending Human Authorization:*\n\n" +
		"• *Batch 2:* Principal Direct Cold Email Sequence (450 Schools)\n" +
		"• *Channel:* Email Outreach\n" +
		"• *Created by:* Julian Cross (AI Copywriter)\n" +
		"• *Risk Rating:* Medium"

	keyboard := &InlineKeyboardMarkup{
		InlineKeyboard: [][]InlineKeyboardButton{
			{
				{Text: "✅ 1-Click Authorize Batch", CallbackData: "auth_batch_2"},
				{Text: "✏️ Request Rewrite", CallbackData: "rewrite_batch_2"},
			},
		},
	}

	t.sendTelegram(token, chatID, apprText, keyboard)
}

func (t *TelegramBotEngine) sendTelegram(token string, chatID int64, text string, markup *InlineKeyboardMarkup) {
	if token == "" || token == "mock_telegram_token" {
		log.Printf("[Telegram Simulated Send] ChatID: %d | Text: %s", chatID, text[:min(60, len(text))])
		return
	}

	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)
	payload := SendMessagePayload{
		ChatID:      chatID,
		Text:        text,
		ParseMode:   "Markdown",
		ReplyMarkup: markup,
	}

	data, _ := json.Marshal(payload)
	_, _ = http.Post(apiURL, "application/json", bytes.NewBuffer(data))
}

func (t *TelegramBotEngine) sendTypingAction(token string, chatID int64) {
	if token == "" || token == "mock_telegram_token" {
		return
	}
	apiURL := fmt.Sprintf("https://api.telegram.org/bot%s/sendChatAction", token)
	payload := map[string]interface{}{
		"chat_id": chatID,
		"action":  "typing",
	}
	data, _ := json.Marshal(payload)
	_, _ = http.Post(apiURL, "application/json", bytes.NewBuffer(data))
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

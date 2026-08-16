package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"nexa/ai_gtm_service/internal/db"
	"nexa/ai_gtm_service/internal/email"
	"nexa/ai_gtm_service/internal/handlers"
	"nexa/ai_gtm_service/internal/outreach"
	"nexa/ai_gtm_service/internal/telegram"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	database := db.InitDB()

	agentsHandler := handlers.NewAgentsHandler(database)
	campaignsHandler := handlers.NewCampaignsHandler(database)
	leadsHandler := handlers.NewLeadsHandler(database)
	approvalsHandler := handlers.NewApprovalsHandler(database)
	strategyHandler := handlers.NewStrategyHandler(database)
	settingsHandler := handlers.NewSettingsHandler(database)
	voiceHandler := handlers.NewVoiceHandler()
	obsHandler := handlers.NewObservabilityHandler(database)
	wabaEngine := outreach.NewWABAEngine(database)
	telegramEngine := telegram.NewTelegramBotEngine(database)
	emailOrchestrator := email.InitEmailOrchestrator(database)
	emailWizardHandler := handlers.NewEmailWizardHandler(database, emailOrchestrator)
	adminEmailHandler := handlers.NewAdminEmailHandler(database, emailOrchestrator)
	analyticsHandler := handlers.NewAnalyticsHandler(database)

	r := chi.NewRouter()

	// Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001", "https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"service": "ai-gtm-service", "status": "healthy", "port": 8082, "database": "u721451974_nexa_db", "agents_count": 15, "telegram_bot": "enabled"}`))
	})

	// Real-Time Voice WebSocket Stream
	r.Get("/ws/voice", voiceHandler.HandleVoiceStream)

	// API v1 Routes
	r.Route("/api/v1/gtm", func(r chi.Router) {
		// Global & Tenant-specific Telegram Webhook
		r.Post("/telegram/webhook", telegramEngine.HandleWebhook)
		r.Post("/{orgId}/telegram/webhook", telegramEngine.HandleWebhook)

		// Tenant Integration Settings
		r.Route("/{orgId}/settings", func(r chi.Router) {
			r.Get("/", settingsHandler.GetSettings)
			r.Put("/email", settingsHandler.UpdateEmailSettings)
			r.Put("/waba", settingsHandler.UpdateWABASettings)
			r.Put("/byok", settingsHandler.UpdateBYOKKeys)
			r.Put("/ads", settingsHandler.UpdateAdsSettings)
			r.Put("/telegram", settingsHandler.UpdateTelegramSettings)
			r.Put("/social", settingsHandler.UpdateSocialSettings)
			r.Post("/test", settingsHandler.TestConnection)
		})

		// Provider-Agnostic Email Infrastructure & 3-Step Guided Domain Wizard
		r.Route("/{orgId}/email", func(r chi.Router) {
			r.Get("/providers", emailWizardHandler.GetProviderStatus)
			r.Post("/verify-domain", emailWizardHandler.InitiateDomainVerification)
			r.Post("/check-dns", emailWizardHandler.CheckDNSPropagation)
			r.Post("/switch-provider", emailWizardHandler.SwitchActiveProvider)
			r.Post("/test-dispatch", emailWizardHandler.TestDispatchEmail)
		})

		// WhatsApp Meta Cloud API Webhook
		r.Route("/{orgId}/whatsapp/webhook", func(r chi.Router) {
			r.Get("/", wabaEngine.VerifyWebhook)
			r.Post("/", wabaEngine.HandleInboundWebhook)
		})

		// Agents Swarm
		r.Route("/{orgId}/agents", func(r chi.Router) {
			r.Get("/", agentsHandler.ListAgents)
			r.Get("/{agentKey}", agentsHandler.GetAgent)
			r.Post("/{agentKey}/chat", agentsHandler.ChatWithAgent)
		})

		// GTM Strategy
		r.Route("/{orgId}/strategy", func(r chi.Router) {
			r.Get("/", strategyHandler.GetStrategy)
		})

		// Campaigns
		r.Route("/{orgId}/campaigns", func(r chi.Router) {
			r.Get("/", campaignsHandler.ListCampaigns)
			r.Post("/", campaignsHandler.CreateCampaign)
		})

		// Leads & Extraction
		r.Route("/{orgId}/leads", func(r chi.Router) {
			r.Get("/", leadsHandler.ListLeads)
			r.Post("/extract", leadsHandler.ExtractLeads)
		})

		// Approvals
		r.Route("/{orgId}/approvals", func(r chi.Router) {
			r.Get("/", approvalsHandler.ListApprovals)
			r.Post("/{id}/authorize", approvalsHandler.AuthorizeApproval)
			r.Post("/{id}/reject", approvalsHandler.RejectApproval)
		})

		// Inbound Email Webhook (Reply Tracking & AI Sentiment Extraction)
		r.Post("/{orgId}/email/inbound-webhook", analyticsHandler.HandleInboundEmailWebhook)

		// Analytics, Reply Intelligence & Social Engagement
		r.Route("/{orgId}/analytics", func(r chi.Router) {
			r.Get("/overview", analyticsHandler.GetOverviewAnalytics)
			r.Get("/replies", analyticsHandler.GetEmailReplies)
			r.Get("/social", analyticsHandler.GetSocialAnalytics)
		})

		// Observability Traces & Circuit Breakers
		r.Get("/{orgId}/observability/traces", obsHandler.GetTraces)
		r.Post("/admin/circuit-breaker/{agentKey}", obsHandler.TripCircuitBreaker)

		// Admin Global Email Infrastructure & Cross-Tenant Limits
		r.Route("/admin/email", func(r chi.Router) {
			r.Get("/settings", adminEmailHandler.GetGlobalSettings)
			r.Put("/settings", adminEmailHandler.UpdateGlobalSettings)
			r.Post("/test-platform", adminEmailHandler.TestPlatformDispatch)
			r.Get("/analytics", adminEmailHandler.GetEmailAnalytics)
		})
	})

	addr := fmt.Sprintf(":%s", port)
	log.Printf("🤖 AI GTM Microservice starting on port %s (Telegram CRO Bot Active)...", port)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

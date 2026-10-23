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
	"nexa/ai_gtm_service/internal/handlers"
	"nexa/ai_gtm_service/internal/middleware"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	database := db.InitDB()

	authHandler := handlers.NewAuthHandler(database)
	campaignsHandler := handlers.NewCampaignsHandler(database)
	leadsHandler := handlers.NewLeadsHandler(database)
	settingsHandler := handlers.NewSettingsHandler(database)
	voiceHandler := handlers.NewVoiceHandler(database)

	r := chi.NewRouter()

	// Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"service": "ofia-voice-agent-service", "status": "healthy", "port": 8082, "voice_agent": "active"}`))
	})

	// Real-Time Voice WebSocket Stream (Audio, Text, State & CRM Events)
	r.Get("/ws/voice", voiceHandler.HandleVoiceStream)

	// Public & Protected Auth Routes
	r.Route("/api/v1/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)

		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)
			r.Get("/me", authHandler.GetMe)
		})
	})

	// Primary Dedicated Voice Agent Routes
	r.Route("/api/v1/voice", func(r chi.Router) {
		r.Post("/calls/initiate", voiceHandler.InitiateOutboundCall)
		r.Get("/calls", voiceHandler.ListVoiceCalls)
		r.Get("/calls/{id}", voiceHandler.GetVoiceCall)
		r.Post("/calls/{id}/finalize", voiceHandler.FinalizeVoiceCall)
		r.Get("/config", voiceHandler.GetVoiceConfig)
		r.Put("/config", voiceHandler.UpdateVoiceConfig)
		r.Post("/webhook/telephony", voiceHandler.HandleTelephonyWebhook)
	})

	// Backward-compatible Organization-scoped Voice & Campaign Routes
	r.Route("/api/v1/gtm", func(r chi.Router) {
		// Workspace Users
		r.Route("/{orgId}/users", func(r chi.Router) {
			r.Get("/", authHandler.ListWorkspaceUsers)
			r.Post("/invite", authHandler.InviteUser)
			r.Put("/{userId}/role", authHandler.UpdateUserRole)
		})

		// Dedicated Voice Endpoints
		r.Route("/{orgId}/voice", func(r chi.Router) {
			r.Post("/calls/initiate", voiceHandler.InitiateOutboundCall)
			r.Get("/calls", voiceHandler.ListVoiceCalls)
			r.Get("/calls/{id}", voiceHandler.GetVoiceCall)
			r.Post("/calls/{id}/finalize", voiceHandler.FinalizeVoiceCall)
			r.Get("/config", voiceHandler.GetVoiceConfig)
			r.Put("/config", voiceHandler.UpdateVoiceConfig)
			r.Post("/webhook/telephony", voiceHandler.HandleTelephonyWebhook)
		})

		// Outreach Campaigns for Voice
		r.Route("/{orgId}/campaigns", func(r chi.Router) {
			r.Get("/", campaignsHandler.ListCampaigns)
			r.Post("/", campaignsHandler.CreateCampaign)
		})

		// CRM Leads for Voice
		r.Route("/{orgId}/leads", func(r chi.Router) {
			r.Get("/", leadsHandler.ListLeads)
			r.Post("/extract", leadsHandler.ExtractLeads)
		})

		// Tenant Settings
		r.Route("/{orgId}/settings", func(r chi.Router) {
			r.Get("/", settingsHandler.GetSettings)
			r.Put("/email", settingsHandler.UpdateEmailSettings)
			r.Put("/byok", settingsHandler.UpdateBYOKKeys)
		})
	})

	addr := fmt.Sprintf(":%s", port)
	log.Printf("🎙️ Ofia Voice Agent Microservice starting on port %s...", port)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

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

	"nexa/user_subscription_service/internal/db"
	"nexa/user_subscription_service/internal/handlers"
	"nexa/user_subscription_service/internal/middleware"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	database := db.InitDB()

	authHandler := handlers.NewAuthHandler(database)
	orgHandler := handlers.NewOrgHandler(database)
	subHandler := handlers.NewSubscriptionHandler(database)

	r := chi.NewRouter()

	// Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"service": "user-subscription-service", "status": "healthy", "port": 8081, "database": "u721451974_nexa_db"}`))
	})

	// Public Routes
	r.Route("/api/v1", func(r chi.Router) {
		// Catalog of plans & CRUD Endpoints
		r.Get("/plans", subHandler.ListPlans)
		r.Route("/subscriptions", func(r chi.Router) {
			r.Get("/plans", subHandler.ListPlans)
			r.Post("/plans", subHandler.CreatePlan)
			r.Get("/plans/{id}", subHandler.GetPlan)
			r.Put("/plans/{id}", subHandler.UpdatePlan)
			r.Delete("/plans/{id}", subHandler.DeletePlan)
			r.Get("/tiers", subHandler.GetAllPlanTiers)
		})

		// Auth
		r.Route("/auth", func(r chi.Router) {
			r.Post("/register", authHandler.Register)
			r.Post("/login", authHandler.Login)
		})

		// Paystack / Stripe Billing Webhooks
		r.Post("/webhooks/paystack", subHandler.HandlePaystackWebhook)

		// Subdomain & Storefront Availability Check
		r.Get("/subdomains/check", orgHandler.CheckSubdomainAvailability)

		// Tenant RBAC Access Control Matrix & Subscription Direct
		r.Get("/organizations/{orgId}/rbac", orgHandler.GetTenantRBAC)
		r.Put("/organizations/{orgId}/rbac", orgHandler.SaveTenantRBAC)
		r.Get("/organizations/{orgId}/subscription", subHandler.GetSubscriptionDetails)
		r.Put("/organizations/{orgId}/subscription", subHandler.UpdateTenantSubscription)
		r.Post("/organizations/{orgId}/subscription/override", subHandler.OverrideTenantQuotas)
		r.Post("/organizations/{orgId}/subscription/checkout", subHandler.InitializeCheckout)

		// Protected Workspace & User Routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.AuthMiddleware)

			r.Get("/auth/me", authHandler.GetMe)

			// Organizations
			r.Route("/organizations", func(r chi.Router) {
				r.Get("/", orgHandler.ListUserOrgs)
				r.Post("/", orgHandler.CreateOrg)
				r.Get("/{orgId}", orgHandler.GetOrgDetails)

				// Tenant RBAC & Access Control
				r.Get("/{orgId}/rbac", orgHandler.GetTenantRBAC)
				r.Put("/{orgId}/rbac", orgHandler.SaveTenantRBAC)

				// Subscription & Limits
				r.Get("/{orgId}/subscription", subHandler.GetSubscriptionDetails)
				r.Put("/{orgId}/subscription", subHandler.UpdateTenantSubscription)
				r.Post("/{orgId}/subscription/override", subHandler.OverrideTenantQuotas)
				r.Post("/{orgId}/subscription/checkout", subHandler.InitializeCheckout)
			})
		})
	})

	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 User & Subscription Microservice starting on port %s...", port)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

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

	"nexa/logistics_service/internal/db"
	"nexa/logistics_service/internal/handlers"
)

func main() {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	database := db.InitDB()
	logisticsHandler := handlers.NewLogisticsHandler(database)

	r := chi.NewRouter()

	// Middlewares
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)

	// CORS configuration with tenant headers allowed
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "X-Org-ID", "X-Tenant-Slug", "X-Rider-ID"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"service_logistics","port":"` + port + `"}`))
	})

	// Logistics API Routes
	r.Route("/api/v1/logistics", func(r chi.Router) {
		// Shipments (Dispatch Manager Console)
		r.Get("/shipments", logisticsHandler.ListShipments)
		r.Post("/shipments", logisticsHandler.CreateShipment)
		r.Get("/shipments/{id}", logisticsHandler.GetShipment)
		r.Patch("/shipments/{id}/status", logisticsHandler.UpdateShipmentStatus)

		// Couriers & Live Radar Telemetry for Map
		r.Get("/couriers", logisticsHandler.ListCouriers)
		r.Get("/telemetry", logisticsHandler.GetFleetTelemetry)

		// Pricing & Rates
		r.Post("/rates/calculate", logisticsHandler.CalculateRates)

		// Mobile Rider App Endpoints
		r.Route("/rider", func(r chi.Router) {
			r.Post("/lookup", logisticsHandler.RiderPhoneLookup)
			r.Post("/login", logisticsHandler.RiderLogin)
			r.Get("/profile", logisticsHandler.RiderGetProfile)
			r.Put("/profile", logisticsHandler.RiderUpdateProfile)
			r.Get("/performance", logisticsHandler.RiderGetPerformance)
			r.Get("/payout-methods", logisticsHandler.RiderGetPayoutMethods)
			r.Post("/payout-methods", logisticsHandler.RiderAddPayoutMethod)
			r.Delete("/payout-methods/{id}", logisticsHandler.RiderDeletePayoutMethod)
			r.Patch("/status", logisticsHandler.RiderUpdateStatus)
			r.Get("/active-job", logisticsHandler.RiderGetActiveJob)
			r.Get("/offers", logisticsHandler.RiderGetOffers)
			r.Post("/jobs/{id}/accept", logisticsHandler.RiderAcceptJob)
			r.Post("/jobs/{id}/pickup", logisticsHandler.RiderPickupJob)
			r.Post("/jobs/{id}/deliver", logisticsHandler.RiderDeliverJob)
			r.Post("/jobs/{id}/exception", logisticsHandler.RiderReportException)
			r.Post("/telemetry", logisticsHandler.RiderIngestTelemetry)
		})
	})

	addr := fmt.Sprintf(":%s", port)
	log.Printf("🚀 service_logistics listening on %s", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

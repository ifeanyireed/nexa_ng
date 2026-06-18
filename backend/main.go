package main

import (
	"log"
	"net/http"
	"nexa/backend/internal/db"
	"nexa/backend/internal/handlers"
	nexaMiddleware "nexa/backend/internal/middleware"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Initialize Database
	db.Init()
	defer db.Close()

	r := chi.NewRouter()

	// Basic Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Public Routes
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/signup", handlers.Signup)
		r.Post("/login", handlers.Login)
	})

	r.Route("/api/discovery", func(r chi.Router) {
		r.Get("/pros", handlers.ListPros)
		r.Get("/pros/{id}", handlers.GetPro)
		r.Get("/products", handlers.ListProducts)
		r.Get("/products/{id}", handlers.GetProduct)
		r.Get("/articles", handlers.ListArticles)
		r.Get("/articles/{id}", handlers.GetArticle)
	})

	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(nexaMiddleware.AuthMiddleware)
		r.Get("/api/auth/me", handlers.GetMe)
		r.Post("/api/pro/onboard", handlers.UpdateProProfile)

		// Pro Only Routes
		r.Group(func(r chi.Router) {
			r.Use(nexaMiddleware.RoleMiddleware("PRO", "ADMIN"))
			r.Post("/api/pro/profile", handlers.UpdateProProfile)
			r.Post("/api/pro/services", handlers.CreateService)
			r.Post("/api/pro/articles", handlers.CreateArticle)
		})

		// Booking Routes
		r.Post("/api/bookings", handlers.CreateBooking)
		r.Get("/api/bookings", handlers.ListMyBookings)
		r.Put("/api/bookings/{id}/status", handlers.UpdateBookingStatus)

		// Wallet Routes
		r.Get("/api/wallet", handlers.GetWallet)
		r.Post("/api/wallet/deposit", handlers.Deposit)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}

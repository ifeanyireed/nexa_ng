package main

import (
	"log"
	"net/http"
	"nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/handlers"
	nexaMiddleware "nexa/marketplace_service/internal/middleware"
	"nexa/marketplace_service/internal/models"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env.development if it exists
	godotenv.Load(".env.development")
	// Load .env (it won't overwrite variables already loaded from .env.development)
	godotenv.Load(".env")

	// Initialize Database via GORM
	db.Init()
	defer db.Close()

	// Populate missing slugs for existing profiles
	populateSlugs()

	r := chi.NewRouter()

	// Basic Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)

	// CORS
	allowedOrigins := strings.Split(os.Getenv("ALLOWED_ORIGINS"), ",")
	if len(allowedOrigins) == 0 || allowedOrigins[0] == "" {
		allowedOrigins = []string{"https://*", "http://*"}
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health Check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"service": "marketplace_service", "status": "healthy", "port": 8085, "database": "u721451974_nexa_db"}`))
	})

	// Public Routes
	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/signup", handlers.Signup)
		r.Post("/login", handlers.Login)
	})

	r.Route("/api/discovery", func(r chi.Router) {
		r.Get("/pros", handlers.ListPros)
		r.Get("/pros/{id}", handlers.GetPro)
		r.Get("/stats/niches", handlers.GetNicheStats)
		r.Get("/products", handlers.ListProducts)
		r.Get("/products/{id}", handlers.GetProduct)
		r.Get("/articles", handlers.ListArticles)
		r.Get("/articles/{id}", handlers.GetArticle)
	})

	// 7 Master Layout Templates & Subdomain Assignments
	r.Route("/api/layouts", func(r chi.Router) {
		r.Get("/", handlers.ListLayoutTemplates)
		r.Post("/", handlers.CreateLayoutTemplate)
		r.Get("/{key}", handlers.GetLayoutTemplate)
		r.Put("/{key}", handlers.UpdateLayoutTemplate)
		r.Delete("/{key}", handlers.DeleteLayoutTemplate)
	})

	r.Route("/api/subdomain-layouts", func(r chi.Router) {
		r.Get("/", handlers.ListSubdomainLayouts)
		r.Post("/seed", handlers.SeedDefaultSubdomainLayouts)
		r.Get("/{slug}", handlers.GetSubdomainLayout)
		r.Put("/{slug}", handlers.UpdateSubdomainLayout)
	})

	r.Get("/api/ws", handlers.HandleWSConnection)

	// Protected Routes
	r.Group(func(r chi.Router) {
		r.Use(nexaMiddleware.AuthMiddleware)
		r.Get("/api/auth/me", handlers.GetMe)
		r.Post("/api/pro/onboard", handlers.UpdateProProfile)
		r.Put("/api/users/settings", handlers.UpdateUserSettings)
		r.Put("/api/users/password", handlers.UpdateUserPassword)
		r.Delete("/api/users/me", handlers.DeleteUserAccount)

		// Pro Only Routes
		r.Group(func(r chi.Router) {
			r.Use(nexaMiddleware.RoleMiddleware("PRO", "ADMIN"))
			r.Post("/api/pro/profile", handlers.UpdateProProfile)
			r.Post("/api/pro/services", handlers.CreateService)
			r.Post("/api/pro/articles", handlers.CreateArticle)
			r.Post("/api/pro/products", handlers.CreateProduct)
			r.Get("/api/pro/availability", handlers.GetProAvailability)
			r.Put("/api/pro/availability", handlers.UpdateProAvailability)
			r.Get("/api/pro/analytics", handlers.GetProAnalytics)
		})

		// Admin Only Routes
		r.Group(func(r chi.Router) {
			r.Use(nexaMiddleware.RoleMiddleware("ADMIN"))
			r.Post("/api/admin/push", handlers.SendAdminPushNotification)
			r.Post("/api/admin/subscriptions/renewals/trigger", handlers.TriggerSubscriptionRenewals)
		})

		// Booking Routes
		r.Post("/api/bookings", handlers.CreateBooking)
		r.Get("/api/bookings", handlers.ListMyBookings)
		r.Get("/api/bookings/{id}", handlers.GetBooking)
		r.Put("/api/bookings/{id}/status", handlers.UpdateBookingStatus)
		r.Post("/api/bookings/reminders/trigger", handlers.TriggerBookingReminders)

		// Order Routes
		r.Post("/api/orders", handlers.CreateOrder)
		r.Get("/api/orders", handlers.ListMyOrders)
		r.Get("/api/orders/{id}", handlers.GetOrder)
		r.Put("/api/orders/{id}/status", handlers.UpdateOrderStatus)

		// Delivery Routes
		r.Get("/api/deliveries/{orderId}", handlers.GetDelivery)
		r.Put("/api/deliveries/{orderId}/status", handlers.UpdateDeliveryStatus)

		// Chat Routes
		r.Post("/api/chat/messages", handlers.SendMessage)
		r.Get("/api/chat/messages/{otherUserId}", handlers.GetChatHistory)
		r.Get("/api/chat/conversations", handlers.GetConversations)
		r.Post("/api/users/status", handlers.UpdateOnlineStatus)

		// Wallet Routes
		r.Get("/api/wallet", handlers.GetWallet)
		r.Post("/api/wallet/deposit", handlers.Deposit)

		// Notification Routes
		r.Get("/api/notifications", handlers.ListMyNotifications)
		r.Put("/api/notifications/{id}/read", handlers.MarkNotificationRead)
		r.Put("/api/notifications/read-all", handlers.MarkAllNotificationsRead)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	log.Printf("🛍️ Nexa Marketplace Microservice starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}

func populateSlugs() {
	if db.DB == nil {
		return
	}

	var pros []models.ProProfile
	err := db.DB.Preload("User").Where("slug IS NULL OR slug = ''").Find(&pros).Error
	if err != nil {
		log.Printf("Warning: Failed to fetch profiles for slug populator: %v", err)
		return
	}

	if len(pros) == 0 {
		return
	}

	log.Printf("Checking %d profiles for missing slugs...", len(pros))
	for _, pro := range pros {
		nameForSlug := pro.BusinessName
		if nameForSlug == "" && pro.User != nil {
			nameForSlug = pro.User.Name
		}
		if nameForSlug == "" {
			nameForSlug = pro.ID
		}

		slugVal := strings.ToLower(nameForSlug)
		reg, _ := regexp.Compile("[^a-z0-9]+")
		slugVal = reg.ReplaceAllString(slugVal, "-")
		slugVal = strings.Trim(slugVal, "-")

		if slugVal == "" {
			slugVal = pro.ID
		}

		finalSlug := slugVal
		suffix := 1
		for {
			var count int64
			db.DB.Model(&models.ProProfile{}).Where("slug = ? AND id != ?", finalSlug, pro.ID).Count(&count)
			if count == 0 {
				break
			}
			finalSlug = slugVal + "-" + strconv.Itoa(suffix)
			suffix++
		}

		db.DB.Model(&models.ProProfile{}).Where("id = ?", pro.ID).Update("slug", finalSlug)
		log.Printf("Successfully populated slug '%s' for pro %s", finalSlug, pro.ID)
	}
}

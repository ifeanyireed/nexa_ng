package main

import (
	"context"
	"log"
	"net/http"
	"nexa/backend/internal/db"
	"nexa/backend/internal/handlers"
	nexaMiddleware "nexa/backend/internal/middleware"
	prismaDb "nexa/backend/prisma/db"
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

	// Initialize Database
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
		allowedOrigins = []string{"http://localhost:3000"}
	}

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   allowedOrigins,
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
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("could not start server: %v", err)
	}
}

func populateSlugs() {
	ctx := context.Background()
	pros, err := db.Client.ProProfile.FindMany(
		prismaDb.ProProfile.Slug.IsNull(),
	).With(
		prismaDb.ProProfile.User.Fetch(),
	).Exec(ctx)
	if err != nil {
		log.Printf("Warning: Failed to fetch profiles for slug populator: %v", err)
		return
	}

	log.Printf("Checking %d profiles for missing slugs...", len(pros))
	for _, pro := range pros {
		nameForSlug := ""
		if busName, ok := pro.BusinessName(); ok && busName != "" {
			nameForSlug = busName
		} else if uName, ok := pro.User().Name(); ok && uName != "" {
			nameForSlug = uName
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
			existing, err := db.Client.ProProfile.FindUnique(
				prismaDb.ProProfile.Slug.Equals(finalSlug),
			).Exec(ctx)
			if err != nil || existing == nil {
				break
			}
			finalSlug = slugVal + "-" + strconv.Itoa(suffix)
			suffix++
		}

		_, err = db.Client.ProProfile.FindUnique(
			prismaDb.ProProfile.ID.Equals(pro.ID),
		).Update(
			prismaDb.ProProfile.Slug.Set(finalSlug),
		).Exec(ctx)
		if err != nil {
			log.Printf("Failed to set slug for pro %s: %v", pro.ID, err)
		} else {
			log.Printf("Successfully populated slug '%s' for pro %s", finalSlug, pro.ID)
		}
	}
}

package main

import (
	"bufio"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"service_erp/db"
	"service_erp/handlers"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func loadEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
		log.Printf("Note: .env file not found at %s, relying on environment variables", filepath)
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") || strings.TrimSpace(line) == "" {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			value := strings.Trim(strings.TrimSpace(parts[1]), "\"")
			os.Setenv(key, value)
		}
	}
}

func main() {
	// Load environment variables
	loadEnv(".env")

	// Initialize database connection
	database, err := db.InitDB()
	if err != nil {
		log.Printf("Warning: MySQL database initialization returned: %v (falling back to graceful handling)", err)
	} else {
		handlers.SetGormDB(database)
	}

	// Set up unified router & register all ERP routes (Finance, HR, Team Quests)
	registerRoutes()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084" // Default port for service_erp
	}

	log.Printf("🚀 Unified Enterprise ERP Service listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("ERP service failed to start: %v", err)
	}
}

func registerRoute(path string, handler http.HandlerFunc) {
	http.HandleFunc(path, enableCORS(handler))
}

func registerRoutes() {
	// 1. Health check & Telemetry
	registerRoute("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "HEALTHY",
			"service":   "service_erp",
			"modules":   []string{"finance", "hr", "quests"},
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// 2. HR & Performance Appraisal Endpoints
	registerRoute("/users", handlers.HandleUsers)
	registerRoute("/objectives", handlers.HandleObjectives)
	registerRoute("/cycles", handlers.HandleCycles)
	registerRoute("/reviews", handlers.HandleReviews)
	registerRoute("/seed", handlers.HandleSeed)
	registerRoute("/send-reset-email", handlers.HandleSendResetEmail)
	registerRoute("/send-bulk-notification", handlers.HandleSendBulkNotification)
	registerRoute("/update-password", handlers.HandleUpdatePassword)

	// Prefix aliases for /api/v1/erp/*
	registerRoute("/api/v1/erp/users", handlers.HandleUsers)
	registerRoute("/api/v1/erp/objectives", handlers.HandleObjectives)
	registerRoute("/api/v1/erp/cycles", handlers.HandleCycles)
	registerRoute("/api/v1/erp/reviews", handlers.HandleReviews)

	// 3. Finance & General Ledger Endpoints
	registerRoute("/stats", handlers.HandleStats)
	registerRoute("/expenses", handlers.HandleExpenses)
	registerRoute("/invoices", handlers.HandleInvoices)
	registerRoute("/reconciliations", handlers.HandleReconciliations)
	registerRoute("/transactions", handlers.HandleTransactions)
	registerRoute("/clients", handlers.HandleClients)
	registerRoute("/accounts", handlers.HandleAccounts)
	registerRoute("/journal-entries", handlers.HandleJournalEntries)
	registerRoute("/recurring-journals", handlers.HandleRecurringJournals)
	registerRoute("/proposals", handlers.HandleProposals)
	registerRoute("/estimates", handlers.HandleEstimates)
	registerRoute("/retainers", handlers.HandleRetainers)
	registerRoute("/credit-notes", handlers.HandleCreditNotes)
	registerRoute("/orders", handlers.HandleOrders)
	registerRoute("/vendors", handlers.HandleVendors)
	registerRoute("/bills", handlers.HandleBills)
	registerRoute("/debit-notes", handlers.HandleDebitNotes)
	registerRoute("/bank-accounts", handlers.HandleBankAccounts)
	registerRoute("/bank-reconciliations", handlers.HandleBankReconciliations)
	registerRoute("/products", handlers.HandleProducts)
	registerRoute("/inventory-transactions", handlers.HandleInventoryTransactions)
	registerRoute("/payrolls", handlers.HandlePayrolls)
	registerRoute("/employee-salaries", handlers.HandleEmployeeSalaries)
	registerRoute("/statutory-remittances", handlers.HandleStatutoryRemittances)
	registerRoute("/send-email", handlers.HandleSendEmail)

	// Prefix aliases for /api/v1/finance/*
	registerRoute("/api/v1/finance/coa", handlers.HandleAccounts)
	registerRoute("/api/v1/finance/ledger", handlers.HandleJournalEntries)
	registerRoute("/api/v1/finance/invoices", handlers.HandleInvoices)
	registerRoute("/api/v1/finance/bills", handlers.HandleBills)

	// 4. Team Quests & Engagement Competition Engine
	registerRoute("/quests", handlers.HandleQuests)
	registerRoute("/quests/detail", handlers.HandleQuestDetail)
	registerRoute("/quests/teams", handlers.HandleQuestTeams)
	registerRoute("/quests/challenges", handlers.HandleQuestChallenges)
	registerRoute("/quests/scoreboard", handlers.HandleQuestScoreboard)
	registerRoute("/quests/scores", handlers.HandleQuestScores)

	// Prefix aliases for /api/v1/quests/*
	registerRoute("/api/v1/quests", handlers.HandleQuests)
	registerRoute("/api/v1/quests/detail", handlers.HandleQuestDetail)
	registerRoute("/api/v1/quests/teams", handlers.HandleQuestTeams)
	registerRoute("/api/v1/quests/challenges", handlers.HandleQuestChallenges)
	registerRoute("/api/v1/quests/scoreboard", handlers.HandleQuestScoreboard)
	registerRoute("/api/v1/quests/scores", handlers.HandleQuestScores)
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With, x-tenant-slug")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

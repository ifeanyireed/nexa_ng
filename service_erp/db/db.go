package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() (*sql.DB, error) {
	dsn := getDSN()
	var err error
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("error opening database: %w", err)
	}

	// Configure connection pooling
	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(10 * time.Minute)

	// Verify connection
	err = DB.Ping()
	if err != nil {
		return nil, fmt.Errorf("error pinging database: %w", err)
	}

	log.Println("Successfully connected to the finance database")

	// Run migrations
	err = setupSchema()
	if err != nil {
		return nil, fmt.Errorf("error setting up database schema: %w", err)
	}

	return DB, nil
}

func getDSN() string {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		// Fallback local/default configuration
		return "u721451974_finance:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_finance_db?parseTime=true&loc=Local"
	}

	if strings.HasPrefix(dbURL, "mysql://") {
		dbURL = strings.TrimPrefix(dbURL, "mysql://")
		parts := strings.SplitN(dbURL, "@", 2)
		if len(parts) == 2 {
			creds := parts[0]
			hostPath := parts[1]
			hostParts := strings.SplitN(hostPath, "/", 2)
			if len(hostParts) == 2 {
				hostPort := hostParts[0]
				dbNameAndParams := hostParts[1]
				if !strings.Contains(dbNameAndParams, "parseTime=") {
					if strings.Contains(dbNameAndParams, "?") {
						dbNameAndParams += "&parseTime=true&loc=Local"
					} else {
						dbNameAndParams += "?parseTime=true&loc=Local"
					}
				}
				return fmt.Sprintf("%s@tcp(%s)/%s", creds, hostPort, dbNameAndParams)
			}
		}
	}
	return dbURL
}

func setupSchema() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS expenses (
			id VARCHAR(36) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			category VARCHAR(100) NOT NULL,
			amount DECIMAL(10, 2) NOT NULL,
			status VARCHAR(50) NOT NULL,
			requested_by VARCHAR(255) NOT NULL,
			approved_by VARCHAR(255) NULL,
			description TEXT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS invoices (
			id VARCHAR(36) PRIMARY KEY,
			invoice_number VARCHAR(100) UNIQUE NOT NULL,
			customer_name VARCHAR(255) NOT NULL,
			customer_email VARCHAR(255) NOT NULL,
			amount DECIMAL(10, 2) NOT NULL,
			due_date DATE NOT NULL,
			status VARCHAR(50) NOT NULL,
			description TEXT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS reconciliations (
			id VARCHAR(36) PRIMARY KEY,
			title VARCHAR(255) NOT NULL,
			type VARCHAR(100) NOT NULL,
			period_start DATE NOT NULL,
			period_end DATE NOT NULL,
			expected_amount DECIMAL(10, 2) NOT NULL,
			actual_amount DECIMAL(10, 2) NOT NULL,
			discrepancy DECIMAL(10, 2) NOT NULL,
			status VARCHAR(50) NOT NULL,
			prepared_by VARCHAR(255) NOT NULL,
			notes TEXT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS transactions (
			id VARCHAR(36) PRIMARY KEY,
			reference_id VARCHAR(100) NULL,
			type VARCHAR(50) NOT NULL,
			category VARCHAR(100) NOT NULL,
			amount DECIMAL(10, 2) NOT NULL,
			date DATE NOT NULL,
			description TEXT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS clients (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			sub_name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			category VARCHAR(100) NOT NULL,
			status VARCHAR(50) NOT NULL,
			company_name VARCHAR(255) NOT NULL,
			phone VARCHAR(100) NOT NULL,
			website VARCHAR(255) NOT NULL,
			vat VARCHAR(100) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS accounts (
			id VARCHAR(36) PRIMARY KEY,
			code VARCHAR(50) UNIQUE NOT NULL,
			name VARCHAR(255) NOT NULL,
			category VARCHAR(50) NOT NULL,
			normal_balance VARCHAR(50) NOT NULL,
			opening_balance DECIMAL(15, 2) DEFAULT 0.00,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS journal_entries (
			id VARCHAR(36) PRIMARY KEY,
			entry_date DATE NOT NULL,
			reference_no VARCHAR(100) UNIQUE NULL,
			description TEXT NULL,
			status VARCHAR(50) DEFAULT 'Draft',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS journal_items (
			id VARCHAR(36) PRIMARY KEY,
			journal_entry_id VARCHAR(36) NOT NULL,
			account_id VARCHAR(36) NOT NULL,
			description TEXT NULL,
			debit DECIMAL(15, 2) DEFAULT 0.00,
			credit DECIMAL(15, 2) DEFAULT 0.00,
			FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
			FOREIGN KEY (account_id) REFERENCES accounts(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS recurring_journals (
			id VARCHAR(36) PRIMARY KEY,
			profile_name VARCHAR(255) NOT NULL,
			frequency VARCHAR(50) NOT NULL,
			start_date DATE NOT NULL,
			end_date DATE NULL,
			next_run_date DATE NOT NULL,
			status VARCHAR(50) DEFAULT 'Active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS proposals (
			id VARCHAR(36) PRIMARY KEY,
			proposal_number VARCHAR(100) UNIQUE NOT NULL,
			client_id VARCHAR(36) NOT NULL,
			amount DECIMAL(15, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'Draft',
			valid_until DATE NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (client_id) REFERENCES clients(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS estimates (
			id VARCHAR(36) PRIMARY KEY,
			estimate_number VARCHAR(100) UNIQUE NOT NULL,
			client_id VARCHAR(36) NOT NULL,
			amount DECIMAL(15, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'Draft',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (client_id) REFERENCES clients(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS retainers (
			id VARCHAR(36) PRIMARY KEY,
			retainer_number VARCHAR(100) UNIQUE NOT NULL,
			client_id VARCHAR(36) NOT NULL,
			amount DECIMAL(15, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'Pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (client_id) REFERENCES clients(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS credit_notes (
			id VARCHAR(36) PRIMARY KEY,
			credit_note_number VARCHAR(100) UNIQUE NOT NULL,
			client_id VARCHAR(36) NOT NULL,
			invoice_id VARCHAR(36) NULL,
			amount DECIMAL(15, 2) NOT NULL,
			reason TEXT NULL,
			status VARCHAR(50) DEFAULT 'Unused',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (client_id) REFERENCES clients(id),
			FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS vendors (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			phone VARCHAR(100) NOT NULL,
			company_name VARCHAR(255) NOT NULL,
			status VARCHAR(50) DEFAULT 'Active',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS bills (
			id VARCHAR(36) PRIMARY KEY,
			bill_number VARCHAR(100) UNIQUE NOT NULL,
			vendor_id VARCHAR(36) NOT NULL,
			amount DECIMAL(15, 2) NOT NULL,
			due_date DATE NOT NULL,
			status VARCHAR(50) DEFAULT 'Unpaid',
			description TEXT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (vendor_id) REFERENCES vendors(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS debit_notes (
			id VARCHAR(36) PRIMARY KEY,
			debit_note_number VARCHAR(100) UNIQUE NOT NULL,
			vendor_id VARCHAR(36) NOT NULL,
			bill_id VARCHAR(36) NULL,
			amount DECIMAL(15, 2) NOT NULL,
			reason TEXT NULL,
			status VARCHAR(50) DEFAULT 'Unused',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (vendor_id) REFERENCES vendors(id),
			FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE SET NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS bank_accounts (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			account_no VARCHAR(100) NOT NULL,
			bank_name VARCHAR(255) NOT NULL,
			currency VARCHAR(10) DEFAULT 'NGN',
			status VARCHAR(50) DEFAULT 'Active',
			balance DECIMAL(15, 2) DEFAULT 0.00,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS bank_reconciliations (
			id VARCHAR(36) PRIMARY KEY,
			bank_account_id VARCHAR(36) NOT NULL,
			statement_date DATE NOT NULL,
			ending_balance DECIMAL(15, 2) NOT NULL,
			reconciled_balance DECIMAL(15, 2) NOT NULL,
			difference DECIMAL(15, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'In Progress',
			prepared_by VARCHAR(255) NOT NULL,
			notes TEXT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS products (
			id VARCHAR(36) PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			sku VARCHAR(100) UNIQUE NOT NULL,
			type VARCHAR(50) NOT NULL,
			sale_price DECIMAL(15, 2) NOT NULL,
			purchase_price DECIMAL(15, 2) NOT NULL,
			quantity DECIMAL(15, 6) DEFAULT 0.00,
			can_purchase BOOLEAN DEFAULT TRUE,
			image VARCHAR(255) DEFAULT '/favicon.png',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS inventory_transactions (
			id VARCHAR(36) PRIMARY KEY,
			product_id VARCHAR(36) NOT NULL,
			transaction_type VARCHAR(50) NOT NULL,
			quantity DECIMAL(15, 6) NOT NULL,
			reference VARCHAR(255) NULL,
			date DATE NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (product_id) REFERENCES products(id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS payrolls (
			id VARCHAR(36) PRIMARY KEY,
			period_month INT NOT NULL,
			period_year INT NOT NULL,
			total_amount DECIMAL(15, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'Draft',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS employee_salaries (
			id VARCHAR(36) PRIMARY KEY,
			payroll_id VARCHAR(36) NOT NULL,
			employee_name VARCHAR(255) NOT NULL,
			basic_salary DECIMAL(15, 2) NOT NULL,
			allowances DECIMAL(15, 2) DEFAULT 0.00,
			deductions DECIMAL(15, 2) DEFAULT 0.00,
			net_salary DECIMAL(15, 2) NOT NULL,
			status VARCHAR(50) DEFAULT 'Pending',
			FOREIGN KEY (payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS statutory_remittances (
			id VARCHAR(36) PRIMARY KEY,
			type VARCHAR(50) NOT NULL,
			amount DECIMAL(15, 2) NOT NULL,
			period_month INT NOT NULL,
			period_year INT NOT NULL,
			due_date DATE NOT NULL,
			status VARCHAR(50) DEFAULT 'Pending',
			payment_date DATE NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,

		`CREATE TABLE IF NOT EXISTS orders (
			id VARCHAR(36) PRIMARY KEY,
			client VARCHAR(255) NOT NULL,
			total DECIMAL(15, 2) NOT NULL,
			order_date DATE NOT NULL,
			note TEXT NULL,
			status VARCHAR(50) DEFAULT 'Pending',
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`,
	}

	for i, q := range queries {
		_, err := DB.Exec(q)
		if err != nil {
			return fmt.Errorf("error executing query %d: %w", i+1, err)
		}
	}

	log.Println("Database tables initialized successfully")

	// Seed some initial data if tables are empty
	err := seedInitialData()
	if err != nil {
		log.Printf("Warning: Seeding initial data failed: %v", err)
	}

	return nil
}

func seedInitialData() error {
	// Ensure clients table is seeded
	seedClientsTable()

	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM expenses").Scan(&count)
	if err != nil {
		return err
	}

	if count > 0 {
		log.Println("Database already seeded")
		return nil
	}

	log.Println("Seeding initial mock data into u721451974_finance_db...")

	// 1. Seed Expenses
	expensesSeeds := []struct {
		ID          string
		Title       string
		Category    string
		Amount      float64
		Status      string
		RequestedBy string
		ApprovedBy  string
		Description string
	}{
		{"exp-1", "Weekly Fuel Imprest - Lagos Fleet", "Fleet Operations", 450000.00, "Approved", "Arotile Rotimi Seyi", "System Administrator", "Fuel replenishment for buses running the Lagos-Ibadan expressway route."},
		{"exp-2", "Office Internet Subscription", "Office Administration", 75000.00, "Approved", "Emmanuel Victor Okon", "System Administrator", "Monthly subscription for enterprise fiber connection at HQ."},
		{"exp-3", "Bus Repair & Spare Parts (Bus 04)", "Fleet Operations", 280000.00, "Pending", "Arotile Rotimi Seyi", "", "Replacement of brake pads and engine tuning for vehicle with plate no. NETS-04."},
		{"exp-4", "Weekly Petty Cash - Front Desk Support", "Petty Cash", 30000.00, "Disbursed", "Victoria Aghogho Otojareri", "Arotile Rotimi Seyi", "Weekly allocation for minor office consumables and guest refreshments."},
		{"exp-5", "Marketing Banner Printing & CSR", "Marketing & CSR", 120000.00, "Rejected", "Ogundipe Femi Felix", "", "Rejected due to lack of budget clearance from the MD."},
	}

	for _, e := range expensesSeeds {
		_, err := DB.Exec(
			"INSERT INTO expenses (id, title, category, amount, status, requested_by, approved_by, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			e.ID, e.Title, e.Category, e.Amount, e.Status, e.RequestedBy, e.ApprovedBy, e.Description,
		)
		if err != nil {
			return err
		}
	}

	// 2. Seed Invoices
	invoicesSeeds := []struct {
		ID            string
		InvoiceNumber string
		CustomerName  string
		CustomerEmail string
		Amount        float64
		DueDate       string
		Status        string
		Description   string
	}{
		{"inv-1", "INV-2026-001", "Dangote Group Plc", "billing@dangote.com", 1850000.00, "2026-07-25", "Unpaid", "Corporate staff shuttle services contract for June 2026."},
		{"inv-2", "INV-2026-002", "Jumia Nigeria", "finance@jumia.com.ng", 920000.00, "2026-07-15", "Paid", "Fleet rental services for e-commerce deliveries (5 vans, 1 month)."},
		{"inv-3", "INV-2026-003", "Interswitch Group", "vendor-mgmt@interswitch.com", 2400000.00, "2026-08-05", "Unpaid", "Annual logistics and bulk cargo dispatch retainership."},
		{"inv-4", "INV-2026-004", "Andela Devs Ltd", "ops-payments@andela.com", 680000.00, "2026-07-01", "Overdue", "Staff transit booking services (Mid-Year appraisal events transport)."},
	}

	for _, inv := range invoicesSeeds {
		_, err := DB.Exec(
			"INSERT INTO invoices (id, invoice_number, customer_name, customer_email, amount, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
			inv.ID, inv.InvoiceNumber, inv.CustomerName, inv.CustomerEmail, inv.Amount, inv.DueDate, inv.Status, inv.Description,
		)
		if err != nil {
			return err
		}
	}

	// 3. Seed Reconciliations
	reconcileSeeds := []struct {
		ID             string
		Title          string
		Type           string
		PeriodStart    string
		PeriodEnd      string
		ExpectedAmount float64
		ActualAmount   float64
		Discrepancy    float64
		Status         string
		PreparedBy     string
		Notes          string
	}{
		{"rec-1", "Weekly Shuttle Services Reconciliation (W27)", "Shuttle", "2026-07-01", "2026-07-07", 1250000.00, 1250000.00, 0.0, "Resolved", "Victoria Aghogho Otojareri", "All accounts match perfectly with system trip logs."},
		{"rec-2", "KHLC Training Bus Fuel & Operations", "KHLC", "2026-07-01", "2026-07-07", 320000.00, 315000.00, -5000.0, "Resolved", "Victoria Aghogho Otojareri", "Minor mismatch due to 5,000 NGN bank transfer charge, resolved manually."},
		{"rec-3", "Rental Bus Operations - Airport Runs", "Rental Bus", "2026-07-08", "2026-07-14", 850000.00, 800000.00, -50000.0, "Flagged", "Victoria Aghogho Otojareri", "50,000 NGN discrepancy on booking reference #NETS-R-981. Escalated to Fleet Ops for confirmation."},
	}

	for _, r := range reconcileSeeds {
		_, err := DB.Exec(
			"INSERT INTO reconciliations (id, title, type, period_start, period_end, expected_amount, actual_amount, discrepancy, status, prepared_by, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			r.ID, r.Title, r.Type, r.PeriodStart, r.PeriodEnd, r.ExpectedAmount, r.ActualAmount, r.Discrepancy, r.Status, r.PreparedBy, r.Notes,
		)
		if err != nil {
			return err
		}
	}

	// 4. Seed Transactions (historicals)
	txnSeeds := []struct {
		ID          string
		ReferenceID string
		Type        string
		Category    string
		Amount      float64
		Date        string
		Description string
	}{
		{"txn-1", "inv-2", "Credit", "Revenue - Fleet Rental", 920000.00, "2026-07-14", "Payment received from Jumia Nigeria for invoice INV-2026-002."},
		{"txn-2", "exp-1", "Debit", "Expense - Fleet Operations", 450000.00, "2026-07-05", "Fuel Imprest disbursement for Lagos fleet operations."},
		{"txn-3", "exp-4", "Debit", "Expense - Petty Cash", 30000.00, "2026-07-02", "Disbursement of weekly petty cash to admin desk."},
		{"txn-4", "", "Credit", "Revenue - Bus Ticket Sales", 1500000.00, "2026-07-10", "Weekly cash and card ticket sales from terminals."},
	}

	for _, tx := range txnSeeds {
		_, err := DB.Exec(
			"INSERT INTO transactions (id, reference_id, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
			tx.ID, tx.ReferenceID, tx.Type, tx.Category, tx.Amount, tx.Date, tx.Description,
		)
		if err != nil {
			return err
		}
	}

	log.Println("Database seeded successfully with mock finance logs")
	return nil
}

func seedClientsTable() {
	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM clients").Scan(&count)
	if err != nil {
		log.Printf("Warning: Failed to check clients table count: %v", err)
		return
	}
	if count > 0 {
		return
	}

	log.Println("Seeding initial mock data into clients table...")
	clientsSeeds := []struct {
		ID          string
		Name        string
		SubName     string
		Email       string
		Category    string
		Status      string
		CompanyName string
		Phone       string
		Website     string
		Vat         string
	}{
		{"cli-1", "Ecologique Transport Solution", "Ecologique Transport Solution", "semiu.abolade@ecologiqueltd.com", "COOPERATE CLIENT", "Active", "Ecologique Transport Solution", "08164473371", "https://www.ecologiqueltd.com", ""},
		{"cli-2", "Dulux - Chemical & Allied Product PLC", "Dulux - Chemical & Allied Product Plc", "careline@capplc.com", "COOPERATE CLIENT", "Active", "Dulux - Chemical & Allied Product PLC", "08159492865", "https://duluxnigeria.com.ng", ""},
		{"cli-3", "7UP Bottling Company", "7Up Bottling Company", "info@sevenup.org", "COOPERATE CLIENT", "Active", "7UP Bottling Company", "0805 6900 900", "https://www.sevenup.org", ""},
		{"cli-4", "YNV - Teknowledge Operations Nigeria Ltd", "Ymv - Teknowledge Operations Nigeria Ltd", "voke.dabonur@teknowledge.com", "COOPERATE CLIENT", "Active", "YMV - Teknowledge Operations Nigeria Ltd", "08135771574", "https://teknowledge.com", ""},
		{"cli-5", "GAIO System Nigeria ltd", "Gaio System Nigeria Ltd", "esalomo@gaiosystem.com.ng", "COOPERATE CLIENT", "Active", "GAIO System Nigeria ltd", "08028416180", "https://www.en.gaio.co.jp/company", ""},
		{"cli-6", "IHS - Holding Limited", "Ihs - Holding Limited", "hauwa.ohize@ihstowers.com", "COOPERATE CLIENT", "Active", "IHS - Holding Limited", "+234 700 0777777", "https://www.ihstowers.com", ""},
		{"cli-7", "Nigerian Bottling Company (NBC)", "Nigerian Bottling Company (Nbc)", "reace.odimba@cchellenic.com", "COOPERATE CLIENT", "Active", "Nigerian Bottling Company (NBC)", "08150594417", "https://www.coca-colahellenic.com", ""},
		{"cli-8", "Yikodeen COMPANY LIMITED", "Yikodeen Company Limited", "", "", "Active", "YIKODEEN COMPANY LIMITED", "", "", "19853071-0001"},
	}

	for _, c := range clientsSeeds {
		_, err := DB.Exec(
			"INSERT INTO clients (id, name, sub_name, email, category, status, company_name, phone, website, vat) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
			c.ID, c.Name, c.SubName, c.Email, c.Category, c.Status, c.CompanyName, c.Phone, c.Website, c.Vat,
		)
		if err != nil {
			log.Printf("Warning: Failed to seed client %s: %v", c.Name, err)
		}
	}
	log.Println("Clients table seeded successfully")
}

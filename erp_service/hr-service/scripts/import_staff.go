package main

import (
	"bufio"
	"bytes"
	"database/sql"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"os"
	"regexp"
	"strings"

	_ "github.com/go-sql-driver/mysql"
)

type User struct {
	ID             string   `json:"id"`
	Name           string   `json:"name"`
	Email          string   `json:"email"`
	Role           string   `json:"role"`
	Department     string   `json:"department"`
	Avatar         string   `json:"avatar"`
	ManagerName    *string  `json:"managerName,omitempty"`
	ManagerID      *string  `json:"managerId,omitempty"`
	Designation    *string  `json:"designation,omitempty"`
	GradeLevel     *string  `json:"gradeLevel,omitempty"`
	EmploymentDate *string  `json:"employmentDate,omitempty"`
	Company        *string  `json:"company,omitempty"`
	Location       *string  `json:"location,omitempty"`
	Password       *string  `json:"password,omitempty"`
	RatingTrend    []float64 `json:"ratingTrend,omitempty"` // empty
}

func loadEnv(filepath string) {
	file, err := os.Open(filepath)
	if err != nil {
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

func getDSN() string {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		return "u721451974_nets:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nets_db?parseTime=true&loc=Local"
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

func main() {
	loadEnv("/Users/user/Downloads/nets_erp/hr-service/.env")

	// Read CSV
	csvFile, err := os.Open("/Users/user/Downloads/nets_erp/nets_staff.csv")
	if err != nil {
		log.Fatalf("Error opening CSV: %v", err)
	}
	defer csvFile.Close()

	reader := csv.NewReader(csvFile)
	// Read header
	header, err := reader.Read()
	if err != nil {
		log.Fatalf("Error reading CSV header: %v", err)
	}

	fmt.Printf("CSV Columns: %v\n", header)

	// Admin account to preserve
	adminUser := User{
		ID:          "ADM001",
		Name:        "System Administrator",
		Email:       "ifeanyireed@gmail.com",
		Role:        "admin",
		Department:  "Administration",
		Avatar:      "/character1.jpg",
		Designation: stringPtr("IT Administrator"),
		GradeLevel:  stringPtr("L1"),
		Company:     stringPtr("NETS"),
		Location:    stringPtr("Lagos"),
		Password:    stringPtr("*Reedb4b4"),
	}

	usersList := []User{adminUser}

	mdCount := 0
	hrCount := 0
	mgrCount := 0
	empCount := 0

	avatarCycle := 1

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			log.Fatalf("Error reading CSV row: %v", err)
		}

		name := toTitleCase(strings.TrimSpace(record[1]))
		designation := strings.TrimSpace(record[2])
		dept := strings.TrimSpace(record[3])
		perfRole := strings.TrimSpace(record[4])
		lineManager := strings.TrimSpace(record[5])
		if lineManager != "" {
			lineManager = toTitleCase(lineManager)
		}
		email := strings.TrimSpace(record[6])

		if name == "" {
			continue
		}

		// Map Role
		role := "employee"
		switch strings.ToLower(perfRole) {
		case "md":
			role = "md"
			mdCount++
		case "hr admin":
			role = "hr"
			hrCount++
		case "line manager":
			role = "manager"
			mgrCount++
		default:
			role = "employee"
			empCount++
		}

		// Generate ID
		var id string
		switch role {
		case "md":
			id = fmt.Sprintf("MD%03d", mdCount)
		case "hr":
			id = fmt.Sprintf("HR%03d", hrCount)
		case "manager":
			id = fmt.Sprintf("MGR%03d", mgrCount)
		default:
			id = fmt.Sprintf("EMP%03d", empCount)
		}

		// Handle empty email
		if email == "" {
			cleanName := strings.ToLower(regexp.MustCompile(`[^a-zA-Z]`).ReplaceAllString(strings.ReplaceAll(name, " ", "."), ""))
			email = cleanName + "@neweratransports.com"
		}

		// Avatar
		avatar := fmt.Sprintf("/character%d.jpg", avatarCycle)
		avatarCycle = (avatarCycle % 12) + 1

		user := User{
			ID:          id,
			Name:        name,
			Email:       email,
			Role:        role,
			Department:  dept,
			Avatar:      avatar,
			Company:     stringPtr("NETS"),
			Location:    stringPtr("Lagos"),
			Password:    stringPtr("12345678"),
			Designation: stringPtr(designation),
		}

		if lineManager != "" {
			user.ManagerName = stringPtr(lineManager)
		}

		usersList = append(usersList, user)
	}

	// Build name-to-ID map for manager resolution
	nameToID := make(map[string]string)
	for _, u := range usersList {
		nameToID[normalizeName(u.Name)] = u.ID
	}

	// Resolve manager IDs
	for i := range usersList {
		if usersList[i].ManagerName != nil {
			normMgr := normalizeName(*usersList[i].ManagerName)
			if id, ok := nameToID[normMgr]; ok {
				usersList[i].ManagerID = stringPtr(id)
			} else {
				fmt.Printf("Warning: Manager name %s not found in user roster for user %s\n", *usersList[i].ManagerName, usersList[i].Name)
			}
		}
	}

	fmt.Printf("Total mapped users: %d\n", len(usersList))

	// Connect to Database
	dsn := getDSN()
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error opening database connection: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error pinging database: %v", err)
	}
	fmt.Println("Connected to Hostinger Database successfully.")

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Failed to start transaction: %v", err)
	}
	defer tx.Rollback()

	// Truncate / Clear tables (except admin)
	fmt.Println("Clearing old users and reviews...")
	_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 0")
	_, err = tx.Exec("DELETE FROM PerformanceReview")
	if err != nil {
		log.Fatalf("Failed to clear PerformanceReview table: %v", err)
	}
	_, err = tx.Exec("DELETE FROM User WHERE id != 'ADM001'")
	if err != nil {
		log.Fatalf("Failed to clear User table: %v", err)
	}

	// Upsert Admin user (to ensure it has the correct properties)
	fmt.Println("Upserting Admin user ADM001...")
	_, err = tx.Exec(`
		INSERT INTO User (id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON DUPLICATE KEY UPDATE name=?, email=?, role=?, department=?, avatar=?, managerName=?, managerId=?, ratingTrend=?, designation=?, gradeLevel=?, employmentDate=?, company=?, location=?, password=?
	`,
		adminUser.ID, adminUser.Name, adminUser.Email, adminUser.Role, adminUser.Department, adminUser.Avatar, adminUser.ManagerName, adminUser.ManagerID, nil, adminUser.Designation, adminUser.GradeLevel, adminUser.EmploymentDate, adminUser.Company, adminUser.Location, adminUser.Password,
		adminUser.Name, adminUser.Email, adminUser.Role, adminUser.Department, adminUser.Avatar, adminUser.ManagerName, adminUser.ManagerID, nil, adminUser.Designation, adminUser.GradeLevel, adminUser.EmploymentDate, adminUser.Company, adminUser.Location, adminUser.Password,
	)
	if err != nil {
		log.Fatalf("Failed to upsert Admin user: %v", err)
	}

	// Insert other users
	stmt, err := tx.Prepare(`
		INSERT INTO User (id, name, email, role, department, avatar, managerName, managerId, ratingTrend, designation, gradeLevel, employmentDate, company, location, password)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		log.Fatalf("Failed to prepare user insert statement: %v", err)
	}
	defer stmt.Close()

	for _, u := range usersList {
		if u.ID == "ADM001" {
			continue // Already inserted/upserted
		}
		_, err = stmt.Exec(
			u.ID, u.Name, u.Email, u.Role, u.Department, u.Avatar, u.ManagerName, u.ManagerID, nil, u.Designation, u.GradeLevel, u.EmploymentDate, u.Company, u.Location, u.Password,
		)
		if err != nil {
			log.Fatalf("Failed to insert user %s: %v", u.Name, err)
		}
	}

	_, _ = tx.Exec("SET FOREIGN_KEY_CHECKS = 1")
	err = tx.Commit()
	if err != nil {
		log.Fatalf("Failed to commit transaction: %v", err)
	}

	fmt.Println("Database seeded successfully with new staff roster.")

	// Now update seed_data.json
	fmt.Println("Updating seed_data.json...")
	updateSeedData(usersList)

	// Now update erp-store.ts
	fmt.Println("Updating erp-store.ts...")
	updateErpStore(usersList)

	fmt.Println("All systems synchronized successfully!")
}

func stringPtr(s string) *string {
	return &s
}

func normalizeName(name string) string {
	name = strings.ToLower(name)
	name = regexp.MustCompile(`[^a-z]`).ReplaceAllString(name, "")
	return name
}

func toTitleCase(s string) string {
	words := strings.Fields(strings.ToLower(s))
	for i, w := range words {
		if len(w) > 0 {
			words[i] = strings.ToUpper(w[:1]) + w[1:]
		}
	}
	return strings.Join(words, " ")
}

func updateSeedData(users []User) {
	filePath := "/Users/user/Downloads/nets_erp/hr-service/seed_data.json"
	data, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatalf("Error reading seed_data.json: %v", err)
	}

	var seedData map[string]interface{}
	if err := json.Unmarshal(data, &seedData); err != nil {
		log.Fatalf("Error unmarshaling seedData: %v", err)
	}

	var jsonUsers [][]interface{}
	for _, u := range users {
		var mgrName interface{} = nil
		if u.ManagerName != nil {
			mgrName = *u.ManagerName
		}
		var mgrId interface{} = nil
		if u.ManagerID != nil {
			mgrId = *u.ManagerID
		}
		var desig interface{} = nil
		if u.Designation != nil {
			desig = *u.Designation
		}
		var company interface{} = "NETS"
		if u.Company != nil {
			company = *u.Company
		}
		var location interface{} = "Lagos"
		if u.Location != nil {
			location = *u.Location
		}
		var pass interface{} = "12345678"
		if u.Password != nil {
			pass = *u.Password
		}

		userRow := []interface{}{
			u.ID,
			u.Name,
			u.Email,
			u.Role,
			u.Department,
			u.Avatar,
			mgrName,
			mgrId,
			nil, // ratingTrend
			desig,
			nil, // gradeLevel
			nil, // employmentDate
			company,
			location,
			pass,
		}
		jsonUsers = append(jsonUsers, userRow)
	}

	seedData["users"] = jsonUsers
	// Clear reviews in seed_data.json to match clean slate
	seedData["reviews"] = [][]interface{}{}

	updatedData, err := json.MarshalIndent(seedData, "", "    ")
	if err != nil {
		log.Fatalf("Error marshaling updated seedData: %v", err)
	}

	err = os.WriteFile(filePath, updatedData, 0644)
	if err != nil {
		log.Fatalf("Error writing seed_data.json: %v", err)
	}
	fmt.Println("seed_data.json updated successfully.")
}

func updateErpStore(users []User) {
	filePath := "/Users/user/Downloads/nets_erp/web-app/src/lib/erp-store.ts"
	content, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatalf("Error reading erp-store.ts: %v", err)
	}

	// Format INITIAL_USERS block
	var buf bytes.Buffer
	buf.WriteString("const INITIAL_USERS: User[] = [\n")
	for i, u := range users {
		mgrVal := "undefined"
		if u.ManagerName != nil {
			mgrVal = fmt.Sprintf(`"%s"`, *u.ManagerName)
		}
		mgrIdVal := "undefined"
		if u.ManagerID != nil {
			mgrIdVal = fmt.Sprintf(`"%s"`, *u.ManagerID)
		}
		desigVal := "undefined"
		if u.Designation != nil {
			desigVal = fmt.Sprintf(`"%s"`, *u.Designation)
		}
		passVal := "12345678"
		if u.Password != nil {
			passVal = *u.Password
		}

		buf.WriteString(fmt.Sprintf(
			`  { id: "%s", name: "%s", email: "%s", password: "%s", role: "%s", department: "%s", avatar: "%s", managerName: %s, managerId: %s, ratingTrend: undefined, designation: %s, gradeLevel: undefined, employmentDate: undefined, company: "NETS", location: "Lagos" }`,
			u.ID, u.Name, u.Email, passVal, u.Role, u.Department, u.Avatar, mgrVal, mgrIdVal, desigVal,
		))

		if i < len(users)-1 {
			buf.WriteString(",\n")
		} else {
			buf.WriteString("\n")
		}
	}
	buf.WriteString("];")

	// Find and replace the INITIAL_USERS definition
	re := regexp.MustCompile(`(?s)const INITIAL_USERS: User\[] = \[.*?\n];`)
	updatedContent := re.ReplaceAll(content, buf.Bytes())

	// Also clear INITIAL_REVIEWS in erp-store.ts to match clean slate
	reReviews := regexp.MustCompile(`(?s)const INITIAL_REVIEWS: PerformanceReview\[] = \[.*?\n];`)
	updatedContent = reReviews.ReplaceAll(updatedContent, []byte("const INITIAL_REVIEWS: PerformanceReview[] = [];"))

	err = os.WriteFile(filePath, updatedContent, 0644)
	if err != nil {
		log.Fatalf("Error writing erp-store.ts: %v", err)
	}
	fmt.Println("erp-store.ts updated successfully.")
}

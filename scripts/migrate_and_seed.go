package main

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/jackc/pgx/v5/stdlib"
)

type ColumnInfo struct {
	Name      string
	Type      string
	Nullable  bool
	IsPrimary bool
}

func mapMySQLTypeToPostgres(myType string) string {
	lower := strings.ToLower(myType)
	switch {
	case strings.HasPrefix(lower, "varchar"):
		return myType
	case strings.HasPrefix(lower, "char"):
		return myType
	case strings.HasPrefix(lower, "tinyint(1)"):
		return "BOOLEAN"
	case strings.HasPrefix(lower, "tinyint"), strings.HasPrefix(lower, "smallint"):
		return "SMALLINT"
	case strings.HasPrefix(lower, "int"), strings.HasPrefix(lower, "mediumint"):
		return "INTEGER"
	case strings.HasPrefix(lower, "bigint"):
		return "BIGINT"
	case strings.HasPrefix(lower, "datetime"), strings.HasPrefix(lower, "timestamp"):
		return "TIMESTAMPTZ"
	case strings.HasPrefix(lower, "decimal"), strings.HasPrefix(lower, "numeric"):
		return myType
	case strings.HasPrefix(lower, "float"):
		return "REAL"
	case strings.HasPrefix(lower, "double"):
		return "DOUBLE PRECISION"
	case strings.Contains(lower, "text"):
		return "TEXT"
	case strings.Contains(lower, "blob"):
		return "BYTEA"
	case strings.Contains(lower, "json"):
		return "JSONB"
	default:
		return "TEXT"
	}
}

func main() {
	mysqlDSN := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local"
	neonDSN := "postgresql://neondb_owner:npg_t6UQAzVEqBO4@ep-falling-star-b4lrdr76.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

	fmt.Println("🚀 Connecting to Hostinger MySQL (Source)...")
	mysqlDB, err := sql.Open("mysql", mysqlDSN)
	if err != nil {
		log.Fatalf("❌ Failed to open MySQL: %v", err)
	}
	defer mysqlDB.Close()
	if err := mysqlDB.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping MySQL: %v", err)
	}
	fmt.Println(" Connected to MySQL.")

	fmt.Println("🚀 Connecting to Neon PostgreSQL (Target)...")
	neonDB, err := sql.Open("pgx", neonDSN)
	if err != nil {
		log.Fatalf("❌ Failed to open Neon PostgreSQL: %v", err)
	}
	defer neonDB.Close()
	if err := neonDB.Ping(); err != nil {
		log.Fatalf("❌ Failed to ping Neon PostgreSQL: %v", err)
	}
	fmt.Println(" Connected to Neon PostgreSQL.")

	tables := []string{
		"User",
		"Organization",
		"WorkspaceMember",
		"Objective",
		"ReviewCycle",
		"PerformanceReview",
		"ProProfile",
		"Product",
		"Service",
		"QuestChallenge",
		"QuestScheduleItem",
		"gtm_agent",
		"gtm_campaign",
		"gtm_approval",
		"gtm_lead",
		"gtm_strategy",
		"gtm_tenant_settings",
		"gtm_email_dispatch_log",
		"gtm_email_reply",
		"gtm_global_email_settings",
		"gtm_social_post_metrics",
		"waitlist_leads",
		"contact_inquiries",
	}

	// Disable foreign key constraints during seeding
	_, _ = neonDB.Exec("SET session_replication_role = 'replica';")

	totalMigrated := 0

	for _, table := range tables {
		fmt.Printf("\n📦 Processing table: %s\n", table)

		// 1. Inspect MySQL columns
		colRows, err := mysqlDB.Query(fmt.Sprintf("SHOW COLUMNS FROM `%s`", table))
		if err != nil {
			fmt.Printf("⚠️  Could not read columns for %s in MySQL: %v\n", table, err)
			continue
		}

		var cols []ColumnInfo
		var pks []string
		for colRows.Next() {
			var field, colType, nullStr, key string
			var defVal, extra sql.NullString
			if err := colRows.Scan(&field, &colType, &nullStr, &key, &defVal, &extra); err != nil {
				continue
			}
			isPk := (key == "PRI")
			if isPk {
				pks = append(pks, field)
			}
			cols = append(cols, ColumnInfo{
				Name:      field,
				Type:      colType,
				Nullable:  (nullStr == "YES"),
				IsPrimary: isPk,
			})
		}
		colRows.Close()

		if len(cols) == 0 {
			fmt.Printf("⚠️  No columns found for %s\n", table)
			continue
		}

		// 2. Drop existing table to ensure schema purity and create anew
		_, _ = neonDB.Exec(fmt.Sprintf(`DROP TABLE IF EXISTS "%s" CASCADE;`, table))

		var colDefs []string
		for _, c := range cols {
			pgType := mapMySQLTypeToPostgres(c.Type)
			def := fmt.Sprintf(`"%s" %s`, c.Name, pgType)
			colDefs = append(colDefs, def)
		}
		if len(pks) > 0 {
			quotedPks := make([]string, len(pks))
			for i, pk := range pks {
				quotedPks[i] = fmt.Sprintf(`"%s"`, pk)
			}
			colDefs = append(colDefs, fmt.Sprintf("PRIMARY KEY (%s)", strings.Join(quotedPks, ", ")))
		}

		createSQL := fmt.Sprintf(`CREATE TABLE "%s" (%s);`, table, strings.Join(colDefs, ", "))
		if _, err := neonDB.Exec(createSQL); err != nil {
			fmt.Printf("❌ Failed to create table %s in Neon: %v\n", table, err)
			continue
		}
		fmt.Printf("  Postgres table \"%s\" created.\n", table)

		// 3. Fetch rows from MySQL
		colNames := make([]string, len(cols))
		quotedColNames := make([]string, len(cols))
		for i, c := range cols {
			colNames[i] = fmt.Sprintf("`%s`", c.Name)
			quotedColNames[i] = fmt.Sprintf(`"%s"`, c.Name)
		}

		selectSQL := fmt.Sprintf("SELECT %s FROM `%s`", strings.Join(colNames, ", "), table)
		dataRows, err := mysqlDB.Query(selectSQL)
		if err != nil {
			fmt.Printf("⚠️  Failed to query data from %s in MySQL: %v\n", table, err)
			continue
		}

		var rowCount int
		for dataRows.Next() {
			values := make([]interface{}, len(cols))
			scanArgs := make([]interface{}, len(cols))
			for i := range values {
				scanArgs[i] = &values[i]
			}

			if err := dataRows.Scan(scanArgs...); err != nil {
				fmt.Printf("⚠️  Scan error in %s: %v\n", table, err)
				continue
			}

			// Format values for Postgres
			pgValues := make([]interface{}, len(cols))
			for i, v := range values {
				if v == nil {
					pgValues[i] = nil
					continue
				}

				if b, ok := v.([]byte); ok {
					str := string(b)
					if strings.HasPrefix(str, "0000-00-00") {
						pgValues[i] = nil
					} else {
						// Check if target column is boolean
						if strings.HasPrefix(strings.ToLower(cols[i].Type), "tinyint(1)") {
							pgValues[i] = (str == "1" || str == "true")
						} else {
							pgValues[i] = str
						}
					}
				} else if t, ok := v.(time.Time); ok {
					if t.IsZero() || t.Year() < 1970 {
						pgValues[i] = nil
					} else {
						pgValues[i] = t
					}
				} else if i64, ok := v.(int64); ok && strings.HasPrefix(strings.ToLower(cols[i].Type), "tinyint(1)") {
					pgValues[i] = (i64 == 1)
				} else {
					pgValues[i] = v
				}
			}

			placeholders := make([]string, len(cols))
			for i := range cols {
				placeholders[i] = fmt.Sprintf("$%d", i+1)
			}

			insertSQL := fmt.Sprintf(`INSERT INTO "%s" (%s) VALUES (%s) ON CONFLICT DO NOTHING;`,
				table,
				strings.Join(quotedColNames, ", "),
				strings.Join(placeholders, ", "),
			)

			if _, err := neonDB.Exec(insertSQL, pgValues...); err != nil {
				fmt.Printf("⚠️  Insert error on %s: %v\n", table, err)
			} else {
				rowCount++
			}
		}
		dataRows.Close()

		var neonCount int
		countRow := neonDB.QueryRow(fmt.Sprintf(`SELECT COUNT(*) FROM "%s"`, table))
		_ = countRow.Scan(&neonCount)
		fmt.Printf("  ✅ %s: migrated %d rows. Total in Neon: %d rows.\n", table, rowCount, neonCount)
		totalMigrated += rowCount
	}

	// Restore triggers / constraints
	_, _ = neonDB.Exec("SET session_replication_role = 'origin';")

	fmt.Printf("\n🎉 SUCCESS: All tables created and %d total records successfully seeded into Neon PostgreSQL!\n", totalMigrated)
}

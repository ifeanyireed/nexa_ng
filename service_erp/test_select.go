package main

import (
	"fmt"
	"log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := "postgresql://neondb_owner:npg_t6UQAzVEqBO4@ep-falling-star-b4lrdr76-pooler.c-6.us-east-2.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	
	sqlDB, _ := db.DB()
	rows, err := sqlDB.Query("SELECT id, name FROM \"reviewcycle\"")
	if err != nil {
		fmt.Println("Select Error lower:", err)
		rows, err = sqlDB.Query("SELECT id, name FROM \"ReviewCycle\"")
		if err != nil {
			fmt.Println("Select Error upper:", err)
			return
		}
	}
	defer rows.Close()
	
	count := 0
	for rows.Next() {
		var id, name string
		rows.Scan(&id, &name)
		fmt.Println("Row:", id, name)
		count++
	}
	fmt.Println("Total rows in Postgres:", count)
}

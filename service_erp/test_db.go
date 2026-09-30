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
	var exists int
	err = sqlDB.QueryRow("SELECT 1 FROM information_schema.tables WHERE table_name = 'ReviewCycle'").Scan(&exists)
	if err != nil {
		fmt.Println("Error:", err)
	}
	fmt.Println("ReviewCycle exists:", exists)
}

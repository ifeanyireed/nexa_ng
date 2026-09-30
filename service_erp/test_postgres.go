package main

import (
	"fmt"
	"log"
	"gorm.io/gorm"
)

func main() {
	dsn := "u721451974_nexa:*Reedb4b4@tcp(srv2113.hstgr.io:3306)/u721451974_nexa_db?charset=utf8mb4&parseTime=True&loc=Local&tls=preferred"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	
	sqlDB, _ := db.DB()
	rows, err := sqlDB.Query("SELECT id, name FROM ReviewCycle")
	if err != nil {
		fmt.Println("Select Error:", err)
		return
	}
	defer rows.Close()
	
	count := 0
	for rows.Next() {
		var id, name string
		rows.Scan(&id, &name)
		fmt.Println("MySQL Row:", id, name)
		count++
	}
	fmt.Println("Total rows in MySQL:", count)
}

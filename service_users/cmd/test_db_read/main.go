package main

import (
	"log"
	"nexa/user_subscription_service/internal/db"
	"nexa/user_subscription_service/internal/models"
)

func main() {
	dbInstance := db.InitDB()
	if dbInstance == nil {
		log.Fatal("Failed to init DB")
	}
	
	var org models.Organization
	err := dbInstance.First(&org).Error
	if err != nil {
		log.Fatal("Error fetching org:", err)
	}
	
	log.Printf("Org: ID=%s, Slug=%s, Logo=%s, PrimaryColor=%s, SecondaryColor=%s\n", org.ID, org.Slug, org.Logo, org.PrimaryColor, org.SecondaryColor)
}

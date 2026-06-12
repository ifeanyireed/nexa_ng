package main

import (
	"context"
	"log"
	"nexa/backend/prisma/db"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	client := db.NewClient()
	if err := client.Connect(); err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect()

	ctx := context.Background()

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	// Create a Pro
	proUser, err := client.User.CreateOne(
		db.User.Email.Set("chef@example.com"),
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set("PRO"),
		db.User.Name.Set("Chef Gbolahan"),
	).Exec(ctx)

	if err != nil {
		log.Printf("Error creating pro user: %v", err)
	} else {
		proProfile, _ := client.ProProfile.CreateOne(
			db.ProProfile.User.Link(db.User.ID.Equals(proUser.ID)),
			db.ProProfile.Bio.Set("Expert in local and continental dishes."),
			db.ProProfile.HourlyRate.Set(5000),
			db.ProProfile.Specialties.Set("Private Chef, Caterer"),
			db.ProProfile.Niche.Set("culinary-finders"),
			db.ProProfile.Verified.Set(true),
			db.ProProfile.Rating.Set(4.9),
		).Exec(ctx)

		client.Service.CreateOne(
			db.Service.Name.Set("Private Dinner Session"),
			db.Service.Price.Set(25000),
			db.Service.ProProfile.Link(db.ProProfile.ID.Equals(proProfile.ID)),
			db.Service.Description.Set("A 3-course meal for up to 4 people."),
		).Exec(ctx)
	}

	// Create another Pro
	proUser2, err := client.User.CreateOne(
		db.User.Email.Set("mechanic@example.com"),
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set("PRO"),
		db.User.Name.Set("Segun Auto Fix"),
	).Exec(ctx)

	if err != nil {
		log.Printf("Error creating pro user 2: %v", err)
	} else {
		client.ProProfile.CreateOne(
			db.ProProfile.User.Link(db.User.ID.Equals(proUser2.ID)),
			db.ProProfile.Bio.Set("Specialist in Japanese and German cars."),
			db.ProProfile.HourlyRate.Set(3000),
			db.ProProfile.Specialties.Set("Car Mechanic, Auto Electrician"),
			db.ProProfile.Niche.Set("repair-finders"),
			db.ProProfile.Verified.Set(true),
			db.ProProfile.Rating.Set(4.7),
		).Exec(ctx)
	}

	log.Println("Seed completed!")
}

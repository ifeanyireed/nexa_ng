package db

import (
	"log"
	"nexa/backend/prisma/db"
)

var Client *db.PrismaClient

func Init() {
	Client = db.NewClient()
	if err := Client.Connect(); err != nil {
		log.Fatalf("failed to connect to prisma: %v", err)
	}
}

func Close() {
	if err := Client.Disconnect(); err != nil {
		log.Fatalf("failed to disconnect from prisma: %v", err)
	}
}

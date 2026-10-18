package main

import (
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"nexa/logistics_service/internal/models"
)

type TenantUser struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	Email       string    `gorm:"uniqueIndex;size:128" json:"email"`
	Password    string    `gorm:"size:255" json:"password"`
	Name        string    `gorm:"size:128" json:"name"`
	Role        string    `gorm:"size:32" json:"role"`
	Department  string    `gorm:"size:64" json:"department"`
	Designation string    `gorm:"size:64" json:"designation"`
	TenantSlug  string    `gorm:"column:tenantSlug;size:64" json:"tenant_slug"`
	CreatedAt   time.Time `gorm:"column:createdAt" json:"created_at"`
	UpdatedAt   time.Time `gorm:"column:updatedAt" json:"updated_at"`
}

func (TenantUser) TableName() string {
	return "User"
}

type WorkspaceMember struct {
	ID             string    `gorm:"primaryKey;size:64" json:"id"`
	OrganizationID string    `gorm:"column:organizationId;size:64" json:"organization_id"`
	UserID         string    `gorm:"column:userId;size:64" json:"user_id"`
	Role           string    `gorm:"size:32" json:"role"`
	CreatedAt      time.Time `gorm:"column:createdAt" json:"created_at"`
}

func (WorkspaceMember) TableName() string {
	return "WorkspaceMember"
}

func main() {
	reedbreedDB := "postgresql://neondb_owner:npg_Nw9HiC5DWeXJ@ep-jolly-art-b47p157j-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  reedbreedDB,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
		PrepareStmt: false,
	})
	if err != nil {
		log.Fatalf("Failed to connect to reedbreed DB: %v", err)
	}

	orgID := "2bb399db-3689-5129-9b64-e53f0419fa07"
	tenantSlug := "reedbreed"

	// 1. AutoMigrate all logistics models + CourierPayoutAccount
	_ = db.AutoMigrate(
		&models.Shipment{},
		&models.Waypoint{},
		&models.CourierDriver{},
		&models.CourierPayoutAccount{},
		&models.DeliveryZoneRate{},
		&models.DispatchTicket{},
	)
	fmt.Println("✅ AutoMigrated logistics tables on reedbreed DB")

	// 2. Seed ERP / Tenant Users
	now := time.Now()
	hashedPwd := "$2a$10$w85Z5W7210xWbVqT1pYl0OCq61lT9R0zVfE7yE4E.p372bK45b3eC"

	users := []TenantUser{
		{
			ID:          "usr-reedbreed-01",
			Email:       "admin@reedbreed.com",
			Password:    hashedPwd,
			Name:        "Tunde Bakare",
			Role:        "admin",
			Department:  "Executive",
			Designation: "Managing Director",
			TenantSlug:  tenantSlug,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          "usr-reedbreed-02",
			Email:       "dispatch@reedbreed.com",
			Password:    hashedPwd,
			Name:        "Ngozi Okonjo",
			Role:        "manager",
			Department:  "Logistics & Dispatch",
			Designation: "Dispatch Operations Lead",
			TenantSlug:  tenantSlug,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
		{
			ID:          "usr-reedbreed-03",
			Email:       "operations@reedbreed.com",
			Password:    hashedPwd,
			Name:        "Chidi Anozie",
			Role:        "operations",
			Department:  "Fleet Management",
			Designation: "Fleet Supervisor",
			TenantSlug:  tenantSlug,
			CreatedAt:   now,
			UpdatedAt:   now,
		},
	}

	for _, u := range users {
		var existing TenantUser
		if err := db.Where("email = ?", u.Email).First(&existing).Error; err != nil {
			db.Create(&u)
			fmt.Printf("🌱 Seeded ERP User: %s (%s, Role: %s)\n", u.Name, u.Email, u.Role)
		} else {
			db.Model(&existing).Updates(map[string]interface{}{
				"tenantSlug":  tenantSlug,
				"name":        u.Name,
				"role":        u.Role,
				"department":  u.Department,
				"designation": u.Designation,
			})
			fmt.Printf("🔄 Updated ERP User: %s (%s)\n", u.Name, u.Email)
		}

		var wm WorkspaceMember
		if err := db.Where(`"organizationId" = ? AND "userId" = ?`, orgID, u.ID).First(&wm).Error; err != nil {
			db.Create(&WorkspaceMember{
				ID:             "wm-" + u.ID,
				OrganizationID: orgID,
				UserID:         u.ID,
				Role:           u.Role,
				CreatedAt:      now,
			})
		}
	}

	// 3. Seed / Update Courier Drivers for reedbreed
	couriers := []models.CourierDriver{
		{
			ID:               "drv-reedbreed-1",
			OrgID:            tenantSlug,
			Name:             "Ibrahim Musa",
			Phone:            "+2348033344455",
			Email:            "ibrahim.musa@reedbreed.com",
			Address:          "14 Admiralty Way, Lekki Phase 1, Lagos",
			EmergencyContact: "Aisha Musa (+2348030001122)",
			PIN:              "1234",
			VehicleType:      "MOTORBIKE",
			PlateNumber:      "KJA-482-XA",
			Status:           "AVAILABLE",
			IsAvailable:      true,
			CurrentLat:       6.4698,
			CurrentLng:       3.5852,
			Heading:          90.0,
			Speed:            28.0,
			BatteryPct:       95,
			CurrentZone:      "Lekki Phase 1",
			TotalTrips:       152,
			Rating:           4.9,
			LastPingAt:       now,
			CreatedAt:        now.Add(-30 * 24 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "drv-reedbreed-2",
			OrgID:            tenantSlug,
			Name:             "Emeka Okafor",
			Phone:            "+2348077788899",
			Email:            "emeka.okafor@reedbreed.com",
			Address:          "Plot 12, Commercial Ave, Ikeja, Lagos",
			EmergencyContact: "Ngozi Okafor (+2348071112233)",
			PIN:              "1234",
			VehicleType:      "VAN",
			PlateNumber:      "APP-912-LK",
			Status:           "AVAILABLE",
			IsAvailable:      true,
			CurrentLat:       6.5244,
			CurrentLng:       3.3792,
			Heading:          180.0,
			Speed:            0.0,
			BatteryPct:       88,
			CurrentZone:      "Ikeja GRA",
			TotalTrips:       96,
			Rating:           4.8,
			LastPingAt:       now,
			CreatedAt:        now.Add(-20 * 24 * time.Hour),
			UpdatedAt:        now,
		},
		{
			ID:               "drv-reedbreed-3",
			OrgID:            tenantSlug,
			Name:             "Adeyemi Johnson",
			Phone:            "+2348021112233",
			Email:            "adeyemi.johnson@reedbreed.com",
			Address:          "25 Bourdillon Rd, Ikoyi, Lagos",
			EmergencyContact: "Funke Johnson (+2348029998877)",
			PIN:              "1234",
			VehicleType:      "MOTORBIKE",
			PlateNumber:      "LND-302-XY",
			Status:           "AVAILABLE",
			IsAvailable:      true,
			CurrentLat:       6.4520,
			CurrentLng:       3.4350,
			Heading:          45.0,
			Speed:            32.0,
			BatteryPct:       91,
			CurrentZone:      "Ikoyi / VI",
			TotalTrips:       64,
			Rating:           4.95,
			LastPingAt:       now,
			CreatedAt:        now.Add(-10 * 24 * time.Hour),
			UpdatedAt:        now,
		},
	}

	for _, c := range couriers {
		var existing models.CourierDriver
		if err := db.Where("id = ?", c.ID).First(&existing).Error; err != nil {
			db.Create(&c)
			fmt.Printf("🌱 Seeded Courier: %s (%s, Phone: %s)\n", c.Name, c.ID, c.Phone)
		} else {
			db.Model(&existing).Updates(map[string]interface{}{
				"name":              c.Name,
				"phone":             c.Phone,
				"email":             c.Email,
				"address":           c.Address,
				"emergency_contact": c.EmergencyContact,
				"vehicle_type":      c.VehicleType,
				"plate_number":      c.PlateNumber,
				"status":            c.Status,
				"is_available":      c.IsAvailable,
				"current_lat":       c.CurrentLat,
				"current_lng":       c.CurrentLng,
				"updated_at":        now,
			})
			fmt.Printf("🔄 Updated Courier: %s (%s)\n", c.Name, c.ID)
		}

		var pCount int64
		db.Model(&models.CourierPayoutAccount{}).Where("courier_id = ?", c.ID).Count(&pCount)
		if pCount == 0 {
			db.Create(&models.CourierPayoutAccount{
				ID:            "payout-" + uuid.New().String()[:8],
				OrgID:         tenantSlug,
				CourierID:     c.ID,
				BankName:      "Access Bank PLC",
				BankCode:      "044",
				AccountNumber: "0124982789",
				AccountName:   c.Name,
				IsPrimary:     true,
				IsVerified:    true,
				CreatedAt:     now,
				UpdatedAt:     now,
			})
			db.Create(&models.CourierPayoutAccount{
				ID:            "payout-" + uuid.New().String()[:8],
				OrgID:         tenantSlug,
				CourierID:     c.ID,
				BankName:      "Kuda Microfinance Bank",
				BankCode:      "090267",
				AccountNumber: "2001489245",
				AccountName:   c.Name,
				IsPrimary:     false,
				IsVerified:    true,
				CreatedAt:     now,
				UpdatedAt:     now,
			})
			fmt.Printf("💳 Seeded Bank Accounts for %s\n", c.Name)
		}
	}

	// 5. Seed Delivered & Pending Shipments for realistic performance tracking
	driver1 := couriers[0]
	driverID := driver1.ID

	shipments := []models.Shipment{
		{
			ID:                "shp-reedbreed-del-01",
			OrgID:             tenantSlug,
			OrderID:           "ORD-RB-901",
			TrackingNumber:    "NX-RB-8801-NG",
			Carrier:           "IN_HOUSE",
			Status:            "DELIVERED",
			Priority:          "HIGH",
			CourierDriverID:   &driverID,
			SenderName:        "Apple Premium Reseller",
			SenderPhone:       "+2348023456789",
			SenderAddress:     "Palms Mall, Lekki Phase 1",
			SenderCity:        "Lagos",
			PickupLat:         6.4380,
			PickupLng:         3.4560,
			RecipientName:     "Dr. Chioma Adeyemi",
			RecipientPhone:    "+2348099887766",
			RecipientAddress:  "Bourdillon Rd, Ikoyi",
			RecipientCity:     "Lagos",
			DropoffLat:        6.4520,
			DropoffLng:        3.4735,
			ParcelDescription: "MacBook Pro 16\" M3 Max",
			WeightKg:          2.5,
			ShippingFee:       4500,
			DeliveryOTP:       "4821",
			DeliveredAt:       &now,
			CreatedAt:         now.Add(-3 * time.Hour),
			UpdatedAt:         now.Add(-1 * time.Hour),
		},
		{
			ID:                "shp-reedbreed-del-02",
			OrgID:             tenantSlug,
			OrderID:           "ORD-RB-902",
			TrackingNumber:    "NX-RB-8802-NG",
			Carrier:           "IN_HOUSE",
			Status:            "DELIVERED",
			Priority:          "STANDARD",
			CourierDriverID:   &driverID,
			SenderName:        "Lumina Solar Hub",
			SenderPhone:       "+2348033322114",
			SenderAddress:     "Victoria Island Depot",
			SenderCity:        "Lagos",
			PickupLat:         6.4281,
			PickupLng:         3.4219,
			RecipientName:     "Fidelity Bank HQ",
			RecipientPhone:    "+2348055566677",
			RecipientAddress:  "Ahmadu Bello Way, VI",
			RecipientCity:     "Lagos",
			DropoffLat:        6.4350,
			DropoffLng:        3.4150,
			ParcelDescription: "Solar Inverter 5kVA Module",
			WeightKg:          14.0,
			ShippingFee:       8500,
			DeliveryOTP:       "7192",
			DeliveredAt:       &now,
			CreatedAt:         now.Add(-5 * time.Hour),
			UpdatedAt:         now.Add(-2 * time.Hour),
		},
		{
			ID:                "shp-reedbreed-del-03",
			OrgID:             tenantSlug,
			OrderID:           "ORD-RB-903",
			TrackingNumber:    "NX-RB-8803-NG",
			Carrier:           "IN_HOUSE",
			Status:            "DELIVERED",
			Priority:          "URGENT",
			CourierDriverID:   &driverID,
			SenderName:        "Fresh Groceries Hub",
			SenderPhone:       "+2348077711223",
			SenderAddress:     "Admiralty Way, Lekki",
			SenderCity:        "Lagos",
			PickupLat:         6.4698,
			PickupLng:         3.5852,
			RecipientName:     "Chief Babatunde",
			RecipientPhone:    "+2348091122334",
			RecipientAddress:  "Plot 14, Commercial Ave, Ikeja",
			RecipientCity:     "Lagos",
			DropoffLat:        6.5922,
			DropoffLng:        3.3421,
			ParcelDescription: "Gourmet Organic Fruit Basket",
			WeightKg:          3.5,
			ShippingFee:       3500,
			DeliveryOTP:       "3829",
			DeliveredAt:       &now,
			CreatedAt:         now.Add(-7 * time.Hour),
			UpdatedAt:         now.Add(-4 * time.Hour),
		},
	}

	for _, s := range shipments {
		var existing models.Shipment
		if err := db.Where("id = ?", s.ID).First(&existing).Error; err != nil {
			db.Create(&s)
			fmt.Printf("📦 Seeded Delivered Shipment: %s (Fee: ₦%.2f)\n", s.TrackingNumber, s.ShippingFee)
		}
	}

	fmt.Println("\n🎉 SEEDING COMPLETED FOR TENANT 'reedbreed' SUCCESSFULLY!")
}

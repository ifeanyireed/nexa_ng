package main

import (
	"fmt"
	"log"
	internalDB "nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/models"
	"strings"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type NicheData struct {
	Slug     string
	ParentID string
	Name     string
	Pros     []ProData
}

type ProData struct {
	Name      string
	Email     string
	Bio       string
	Specialty string
	Area      string
}

type ProductSeed struct {
	Name  string
	Price float64
	Image string
	Desc  string
}

func main() {
	// Load .env / .env.development
	godotenv.Load(".env.development")
	godotenv.Load(".env")

	// Init GORM DB
	internalDB.Init()
	if internalDB.DB == nil {
		log.Fatal("Could not connect to database via GORM. Please check your DB credentials or Remote MySQL settings.")
	}

	db := internalDB.DB

	// Clear old records if desired
	db.Exec("SET FOREIGN_KEY_CHECKS = 0")
	db.Where("1 = 1").Delete(&models.Article{})
	db.Where("1 = 1").Delete(&models.Service{})
	db.Where("1 = 1").Delete(&models.Product{})
	db.Exec("SET FOREIGN_KEY_CHECKS = 1")

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	hashStr := string(hashedPassword)

	// Admin Account
	var adminUser models.User
	if err := db.Where("email = ?", "admin@nexa.ng").First(&adminUser).Error; err != nil {
		adminUser = models.User{
			Email:    "admin@nexa.ng",
			Password: hashStr,
			Role:     "ADMIN",
			Name:     "Nexa Super Admin",
			IsOnline: true,
		}
		db.Create(&adminUser)
		log.Println("✅ Seeded admin user: admin@nexa.ng / password123")
	}

	// Client Account
	var clientUser models.User
	if err := db.Where("email = ?", "client@nexa.ng").First(&clientUser).Error; err != nil {
		clientUser = models.User{
			Email:    "client@nexa.ng",
			Password: hashStr,
			Role:     "CLIENT",
			Name:     "Test Client",
			IsOnline: false,
		}
		db.Create(&clientUser)

		wallet := models.Wallet{
			UserID:  clientUser.ID,
			Balance: 50000,
		}
		db.Create(&wallet)
		log.Println("✅ Seeded client user: client@nexa.ng / password123")
	}

	niches := []NicheData{
		{Slug: "handyman-finders", ParentID: "home-services", Name: "Handyman Finders", Pros: []ProData{
			{Name: "Bisi Fix-It", Email: "bisi@handyman.ng", Bio: "Expert leakage repairs and piping installations.", Specialty: "Plumber", Area: "Ikeja"},
			{Name: "Alabi Spark", Email: "alabi@handyman.ng", Bio: "Residential wiring and fault clearing specialist.", Specialty: "Electrician", Area: "Garki"},
			{Name: "Tunde Woodworks", Email: "tunde@handyman.ng", Bio: "Custom furniture and structural repairs.", Specialty: "Carpenter", Area: "Lekki"},
			{Name: "PaintPro Lagos", Email: "paint@handyman.ng", Bio: "Flawless wall finishing and premium coat application.", Specialty: "Painter", Area: "Surulere"},
		}},
		{Slug: "specialist-finders", ParentID: "home-services", Name: "Specialist Finders", Pros: []ProData{
			{Name: "SunVolt Solar", Email: "info@sunvolt.ng", Bio: "Sustainable energy solutions for homes.", Specialty: "Solar Installer", Area: "Wuse"},
			{Name: "CoolAir Tech", Email: "repair@coolair.ng", Bio: "AC and cooling system specialists.", Specialty: "AC Technician", Area: "Yaba"},
		}},
		{Slug: "sanitation-finders", ParentID: "home-services", Name: "Sanitation Finders", Pros: []ProData{
			{Name: "Sparkle Cleaners", Email: "clean@sparkle.ng", Bio: "Professional home and office cleaning.", Specialty: "Home Cleaner", Area: "Victoria-Island"},
			{Name: "EcoPest Solutions", Email: "pest@ecopest.ng", Bio: "Safe and effective pest control.", Specialty: "Fumigator", Area: "Maitama"},
		}},
		{Slug: "style-finders", ParentID: "fashion", Name: "Style Finders", Pros: []ProData{
			{Name: "Dapper Cuts", Email: "cuts@dapper.ng", Bio: "Modern haircuts and grooming for men.", Specialty: "Barber", Area: "Ikeja"},
			{Name: "StitchPerfect Bespoke", Email: "bespoke@stitch.ng", Bio: "Exquisite tailor-made traditional and formal wear.", Specialty: "Tailor", Area: "Surulere"},
		}},
		{Slug: "wardrobe-finders", ParentID: "fashion", Name: "Wardrobe Finders", Pros: []ProData{
			{Name: "FreshPress Laundry", Email: "fresh@press.ng", Bio: "Fast and reliable laundry services.", Specialty: "Laundry", Area: "Garki"},
			{Name: "Chic Curations", Email: "shop@chic.ng", Bio: "Personal styling and shopping assistance.", Specialty: "Personal Shopper", Area: "Lekki"},
		}},
		{Slug: "tech-finders", ParentID: "professionals", Name: "Tech Finders", Pros: []ProData{
			{Name: "CodeCraft Studios", Email: "hello@codecraft.ng", Bio: "Building world-class web and mobile applications.", Specialty: "Web Developer", Area: "Yaba"},
			{Name: "PixelPerfect Design", Email: "design@pixel.ng", Bio: "Intuitive UI/UX design and branding.", Specialty: "UI/UX Designer", Area: "Wuse"},
		}},
		{Slug: "corporate-finders", ParentID: "professionals", Name: "Corporate Finders", Pros: []ProData{
			{Name: "LexAdvocate Partners", Email: "legal@lex.ng", Bio: "Comprehensive legal services for businesses.", Specialty: "Lawyer", Area: "Ikoyi"},
			{Name: "AuditPro Consulting", Email: "tax@auditpro.ng", Bio: "Expert accounting and tax management.", Specialty: "Accountant", Area: "Ikeja"},
		}},
		{Slug: "content-finders", ParentID: "professionals", Name: "Content Finders", Pros: []ProData{
			{Name: "WordSmith Media", Email: "write@wordsmith.ng", Bio: "Compelling copywriting and content strategy.", Specialty: "Copywriter", Area: "Garki"},
			{Name: "SocialSphere Agency", Email: "manage@social.ng", Bio: "Strategic social media management and growth.", Specialty: "Social Media Manager", Area: "Lekki"},
		}},
		{Slug: "talent-finders", ParentID: "professionals", Name: "Talent Finders", Pros: []ProData{
			{Name: "EliteTalent Nigeria", Email: "booking@elitetalent.ng", Bio: "Connecting top models and actors with brands.", Specialty: "Model", Area: "Surulere"},
			{Name: "SonicVibe Voices", Email: "voice@sonicvibe.ng", Bio: "Professional voice-over services for commercials.", Specialty: "Voice-Over Artist", Area: "Wuse"},
		}},
		{Slug: "academic-finders", ParentID: "education", Name: "Academic Finders", Pros: []ProData{
			{Name: "Prime Tutors", Email: "learn@prime.ng", Bio: "Expert home tutoring for all subjects.", Specialty: "Home Tutor", Area: "Yaba"},
			{Name: "Melody Academy", Email: "music@melody.ng", Bio: "Professional music lessons for kids and adults.", Specialty: "Music Instructor", Area: "Victoria-Island"},
		}},
		{Slug: "vocational-finders", ParentID: "education", Name: "Vocational Finders", Pros: []ProData{
			{Name: "SafetyFirst Driving", Email: "drive@safety.ng", Bio: "Comprehensive driving lessons and license processing.", Specialty: "Driving School", Area: "Maitama"},
			{Name: "SkillUp Hub", Email: "train@skillup.ng", Bio: "Hands-on tech and vocational skills training.", Specialty: "Tech Skill Trainer", Area: "Ikeja"},
		}},
		{Slug: "planning-finders", ParentID: "events", Name: "Planning Finders", Pros: []ProData{
			{Name: "GrandEvents Planning", Email: "plan@grand.ng", Bio: "Exquisite event planning and coordination.", Specialty: "Event Planner", Area: "Surulere"},
			{Name: "DecoDreams Studio", Email: "decor@dreams.ng", Bio: "Creative event decoration and floral design.", Specialty: "Decorator", Area: "Garki"},
		}},
		{Slug: "entertainment-finders", ParentID: "events", Name: "Entertainment Finders", Pros: []ProData{
			{Name: "DJ SpinMaster", Email: "dj@spin.ng", Bio: "Premium music entertainment for all occasions.", Specialty: "DJ", Area: "Lekki"},
			{Name: "LensCraft Media", Email: "photo@lenscraft.ng", Bio: "Capturing life's beautiful moments through photography.", Specialty: "Photographer", Area: "Yaba"},
		}},
		{Slug: "medical-finders", ParentID: "health", Name: "Medical Finders", Pros: []ProData{
			{Name: "CareConnect Health", Email: "nurse@careconnect.ng", Bio: "Compassionate private nursing care at home.", Specialty: "Private Nurse", Area: "Ikoyi"},
			{Name: "PhysioFlex Clinic", Email: "rehab@physioflex.ng", Bio: "Specialized physiotherapy and rehabilitation services.", Specialty: "Physiotherapist", Area: "Wuse"},
		}},
		{Slug: "wellness-finders", ParentID: "health", Name: "Wellness Finders", Pros: []ProData{
			{Name: "FitBody Coaching", Email: "fit@fitbody.ng", Bio: "Personalized fitness training and weight loss programs.", Specialty: "Gym Instructor", Area: "Ikeja"},
			{Name: "ZenYoga Nigeria", Email: "yoga@zenyoga.ng", Bio: "Mindfulness and yoga classes for all levels.", Specialty: "Yoga Teacher", Area: "Surulere"},
		}},
		{Slug: "care-finders", ParentID: "health", Name: "Care Finders", Pros: []ProData{
			{Name: "NannyLink Agency", Email: "care@nannylink.ng", Bio: "Vetted and experienced nannies for your kids.", Specialty: "Nanny", Area: "Garki"},
			{Name: "Companion Care", Email: "support@companion.ng", Bio: "Dedicated care and companionship for the elderly.", Specialty: "Elderly Companion", Area: "Lekki"},
		}},
		{Slug: "transport-finders", ParentID: "logistics", Name: "Transport Finders", Pros: []ProData{
			{Name: "ProDrive Services", Email: "driver@prodrive.ng", Bio: "Reliable professional drivers for personal or business use.", Specialty: "Professional Driver", Area: "Yaba"},
			{Name: "RapidTow Nigeria", Email: "tow@rapid.ng", Bio: "24/7 emergency towing and roadside assistance.", Specialty: "Towing Van", Area: "Wuse"},
		}},
		{Slug: "delivery-finders", ParentID: "logistics", Name: "Delivery Finders", Pros: []ProData{
			{Name: "SwiftDelivery Express", Email: "dispatch@swift.ng", Bio: "Fast and secure intra-city delivery services.", Specialty: "Dispatch Rider", Area: "Surulere"},
			{Name: "ReloEase Movers", Email: "move@reloease.ng", Bio: "Stress-free residential and office relocation.", Specialty: "Moving Service", Area: "Ikeja"},
		}},
		{Slug: "repair-finders", ParentID: "auto", Name: "Repair Finders", Pros: []ProData{
			{Name: "Segun Auto Fix", Email: "segun@autofix.ng", Bio: "Specialist in Japanese and German cars.", Specialty: "Car Mechanic", Area: "Garki"},
			{Name: "QuickVulcanizer", Email: "fix@quickvul.ng", Bio: "Emergency tire repairs and maintenance.", Specialty: "Vulcanizer", Area: "Lekki"},
		}},
		{Slug: "auto-care-finders", ParentID: "auto", Name: "Auto Care Finders", Pros: []ProData{
			{Name: "GlossyWash Mobile", Email: "wash@glossy.ng", Bio: "Premium mobile car detailing at your doorstep.", Specialty: "Mobile Car Wash", Area: "Yaba"},
			{Name: "SecureDrive Tech", Email: "track@securedrive.ng", Bio: "Advanced car tracking and security installations.", Specialty: "Car Tracker Installer", Area: "Wuse"},
		}},
		{Slug: "culinary-finders", ParentID: "food", Name: "Culinary Finders", Pros: []ProData{
			{Name: "Chef Gbolahan", Email: "chef@gbolahan.ng", Bio: "Expert in local and continental dishes.", Specialty: "Private Chef", Area: "Ikoyi"},
			{Name: "SweetDelights Cakes", Email: "bake@sweetdelights.ng", Bio: "Custom cakes and desserts for all celebrations.", Specialty: "Cake Baker", Area: "Ikeja"},
		}},
		{Slug: "agro-finders", ParentID: "food", Name: "Agro Finders", Pros: []ProData{
			{Name: "GreenThumb Farms", Email: "info@greenthumb.ng", Bio: "Professional farm management and consultancy.", Specialty: "Farm Manager", Area: "Garki"},
			{Name: "HappyPets Vet", Email: "care@happypets.ng", Bio: "Expert veterinary care and pet grooming.", Specialty: "Veterinary Doctor", Area: "Lekki"},
		}},
		{Slug: "property-finders", ParentID: "realestate", Name: "Property Finders", Pros: []ProData{
			{Name: "LagosHome Finder", Email: "search@lagoshome.ng", Bio: "Helping you find the perfect property in Lagos.", Specialty: "Estate Agent", Area: "Lekki"},
			{Name: "PrimeFacility Management", Email: "mgt@primefac.ng", Bio: "Comprehensive facility management for residential estates.", Specialty: "Facility Manager", Area: "Yaba"},
		}},
		{Slug: "building-finders", ParentID: "realestate", Name: "Building Finders", Pros: []ProData{
			{Name: "ModernSpace Architects", Email: "design@modernspace.ng", Bio: "Innovative architectural design and project management.", Specialty: "Architect", Area: "Ikeja"},
			{Name: "BuildRight Construction", Email: "info@buildright.ng", Bio: "Quality masonry and building services.", Specialty: "Bricklayer", Area: "Surulere"},
		}},
	}

	avatarUrls := []string{
		"https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
		"https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=300&auto=format&fit=crop&q=80",
	}

	productSeeds := map[string][]ProductSeed{
		"home-services": {
			{"Premium Toolbox Set", 45000, "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60", "Complete set of high-quality tools for home repairs."},
			{"Smart Home Security Kit", 120000, "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=500&auto=format&fit=crop&q=60", "Advanced security cameras and sensors."},
		},
		"fashion": {
			{"Bespoke Native Fabric", 25000, "https://images.unsplash.com/photo-1603228254119-e6a4d015fb73?w=500&auto=format&fit=crop&q=60", "High-quality traditional fabric."},
			{"Men's Grooming Kit", 12000, "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60", "Premium beard oils and clippers."},
		},
		"professionals": {
			{"Ergonomic Office Chair", 85000, "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60", "Comfortable seating for long hours."},
			{"Mechanical Keyboard", 35000, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60", "Tactile typing experience."},
		},
		"education": {
			{"Interactive Whiteboard", 150000, "https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=500&auto=format&fit=crop&q=60", "Modern teaching tool."},
			{"Acoustic Guitar Pack", 45000, "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=60", "Perfect for beginners."},
		},
		"events": {
			{"Party Lighting System", 75000, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60", "Dynamic lights for any occasion."},
			{"DJ Controller", 180000, "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=500&auto=format&fit=crop&q=60", "Mix tracks like a pro."},
		},
		"health": {
			{"Yoga Mat & Blocks", 15000, "https://images.unsplash.com/photo-1601134599986-7e2831f2dc34?w=500&auto=format&fit=crop&q=60", "Essential fitness gear."},
			{"Adjustable Dumbbells", 40000, "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=60", "Space-saving workout equipment."},
		},
		"logistics": {
			{"Heavy Duty Moving Boxes", 10000, "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&auto=format&fit=crop&q=60", "Durable packaging."},
			{"GPS Tracker", 18000, "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60", "Real-time asset tracking."},
		},
		"auto": {
			{"Car Care Detailing Kit", 28000, "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&auto=format&fit=crop&q=60", "Keep your vehicle shining."},
			{"Smart Dash Cam", 45000, "https://images.unsplash.com/photo-1517005085862-e61b7b049d50?w=500&auto=format&fit=crop&q=60", "Record your journeys safely."},
		},
		"food": {
			{"Chef's Knife Set", 65000, "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&auto=format&fit=crop&q=60", "Professional grade culinary knives."},
			{"Premium Spice Collection", 15000, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60", "Exotic and rich flavors."},
		},
		"realestate": {
			{"Smart Door Lock", 85000, "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60", "Keyless and secure entry."},
			{"Interior Paint Premium Set", 40000, "https://images.unsplash.com/photo-1562184552-997c461abbe6?w=500&auto=format&fit=crop&q=60", "Transform your living space."},
		},
	}

	for nicheIndex, niche := range niches {
		for proIndex, pro := range niche.Pros {
			var user models.User
			err := db.Where("email = ?", pro.Email).First(&user).Error
			if err != nil {
				user = models.User{
					Email:    pro.Email,
					Password: hashStr,
					Role:     "PRO",
					Name:     pro.Name,
					IsOnline: true,
				}
				db.Create(&user)
			}

			acceptsPos := (nicheIndex+proIndex)%2 == 0
			homeDelivery := (nicheIndex+proIndex)%3 == 0
			avatarUrl := avatarUrls[(nicheIndex*2+proIndex)%len(avatarUrls)]
			slugVal := strings.ToLower(strings.ReplaceAll(fmt.Sprintf("%s-services", pro.Name), " ", "-"))

			var profile models.ProProfile
			err = db.Where("user_id = ?", user.ID).First(&profile).Error
			if err != nil {
				profile = models.ProProfile{
					UserID:         user.ID,
					BusinessName:   fmt.Sprintf("%s Services", pro.Name),
					Slug:           slugVal,
					Bio:            pro.Bio,
					HourlyRate:     4000,
					Specialties:    pro.Specialty,
					Niche:          niche.ParentID,
					SubService:     niche.Slug,
					SpecialtyLevel: "Master",
					City:           "Lagos",
					Area:           pro.Area,
					Phone:          "+2348012345678",
					Whatsapp:       "+2348012345678",
					BusinessEmail:  pro.Email,
					Verified:       true,
					AcceptsPOS:     acceptsPos,
					HomeDelivery:   homeDelivery,
					Rating:         4.8,
					ProfileViews:   120,
					LogoURL:        avatarUrl,
				}
				db.Create(&profile)
			}

			// Service
			service := models.Service{
				Name:         fmt.Sprintf("%s Consultation", pro.Specialty),
				Description:  "Comprehensive initial consultation, inspection, and estimate.",
				Price:        5000,
				ProProfileID: profile.ID,
			}
			db.Create(&service)

			// Product
			catProds := productSeeds[niche.ParentID]
			prodData := catProds[proIndex%len(catProds)]
			product := models.Product{
				Name:         prodData.Name,
				Description:  prodData.Desc,
				Price:        prodData.Price,
				Image:        prodData.Image,
				ProProfileID: profile.ID,
			}
			db.Create(&product)

			// Article
			imgPath := fmt.Sprintf("/article_%s.jpg", niche.ParentID)
			if niche.ParentID == "home-services" {
				imgPath = "/article_home.jpg"
			}
			article := models.Article{
				Title:        fmt.Sprintf("How to choose the best %s in Lagos", pro.Specialty),
				Content:      fmt.Sprintf("This is an expert guide by %s detailing how to find, evaluate, and choose a top-quality %s for your project in Nigeria.", pro.Name, pro.Specialty),
				Image:        imgPath,
				Niche:        niche.ParentID,
				ProProfileID: profile.ID,
			}
			db.Create(&article)
		}
	}

	log.Println("✅ GORM Database seed completed successfully!")
}

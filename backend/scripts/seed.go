package main

import (
	"context"
	"fmt"
	"log"
	"nexa/backend/prisma/db"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

type NicheData struct {
	Slug       string
	ParentID   string
	Name       string
	Pros       []ProData
}

type ProData struct {
	Name       string
	Email      string
	Bio        string
	Specialty  string
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	client := db.NewClient()
	if err := client.Connect(); err != nil {
		log.Fatal(err)
	}
	defer client.Disconnect()

	ctx := context.Background()

	// Clear old articles to avoid duplicate keys or spam on subsequent runs
	client.Article.FindMany().Delete().Exec(ctx)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

	niches := []NicheData{
		{Slug: "handyman-finders", ParentID: "home-services", Name: "Handyman Finders", Pros: []ProData{
			{Name: "Bisi Fix-It", Email: "bisi@handyman.ng", Bio: "Expert leakage repairs and piping installations.", Specialty: "Plumber"},
			{Name: "Alabi Spark", Email: "alabi@handyman.ng", Bio: "Residential wiring and fault clearing specialist.", Specialty: "Electrician"},
			{Name: "Tunde Woodworks", Email: "tunde@handyman.ng", Bio: "Custom furniture and structural repairs.", Specialty: "Carpenter"},
			{Name: "PaintPro Lagos", Email: "paint@handyman.ng", Bio: "Flawless wall finishing and premium coat application.", Specialty: "Painter"},
		}},
		{Slug: "specialist-finders", ParentID: "home-services", Name: "Specialist Finders", Pros: []ProData{
			{Name: "SunVolt Solar", Email: "info@sunvolt.ng", Bio: "Sustainable energy solutions for homes.", Specialty: "Solar Installer"},
			{Name: "CoolAir Tech", Email: "repair@coolair.ng", Bio: "AC and cooling system specialists.", Specialty: "AC Technician"},
		}},
		{Slug: "sanitation-finders", ParentID: "home-services", Name: "Sanitation Finders", Pros: []ProData{
			{Name: "Sparkle Cleaners", Email: "clean@sparkle.ng", Bio: "Professional home and office cleaning.", Specialty: "Home Cleaner"},
			{Name: "EcoPest Solutions", Email: "pest@ecopest.ng", Bio: "Safe and effective pest control.", Specialty: "Fumigator"},
		}},
		{Slug: "style-finders", ParentID: "fashion", Name: "Style Finders", Pros: []ProData{
			{Name: "Dapper Cuts", Email: "cuts@dapper.ng", Bio: "Modern haircuts and grooming for men.", Specialty: "Barber"},
			{Name: "StitchPerfect Bespoke", Email: "bespoke@stitch.ng", Bio: "Exquisite tailor-made traditional and formal wear.", Specialty: "Tailor"},
		}},
		{Slug: "wardrobe-finders", ParentID: "fashion", Name: "Wardrobe Finders", Pros: []ProData{
			{Name: "FreshPress Laundry", Email: "fresh@press.ng", Bio: "Fast and reliable laundry services.", Specialty: "Laundry"},
			{Name: "Chic Curations", Email: "shop@chic.ng", Bio: "Personal styling and shopping assistance.", Specialty: "Personal Shopper"},
		}},
		{Slug: "tech-finders", ParentID: "professionals", Name: "Tech Finders", Pros: []ProData{
			{Name: "CodeCraft Studios", Email: "hello@codecraft.ng", Bio: "Building world-class web and mobile applications.", Specialty: "Web Developer"},
			{Name: "PixelPerfect Design", Email: "design@pixel.ng", Bio: "Intuitive UI/UX design and branding.", Specialty: "UI/UX Designer"},
		}},
		{Slug: "corporate-finders", ParentID: "professionals", Name: "Corporate Finders", Pros: []ProData{
			{Name: "LexAdvocate Partners", Email: "legal@lex.ng", Bio: "Comprehensive legal services for businesses.", Specialty: "Lawyer"},
			{Name: "AuditPro Consulting", Email: "tax@auditpro.ng", Bio: "Expert accounting and tax management.", Specialty: "Accountant"},
		}},
		{Slug: "content-finders", ParentID: "professionals", Name: "Content Finders", Pros: []ProData{
			{Name: "WordSmith Media", Email: "write@wordsmith.ng", Bio: "Compelling copywriting and content strategy.", Specialty: "Copywriter"},
			{Name: "SocialSphere Agency", Email: "manage@social.ng", Bio: "Strategic social media management and growth.", Specialty: "Social Media Manager"},
		}},
		{Slug: "talent-finders", ParentID: "professionals", Name: "Talent Finders", Pros: []ProData{
			{Name: "EliteTalent Nigeria", Email: "booking@elitetalent.ng", Bio: "Connecting top models and actors with brands.", Specialty: "Model"},
			{Name: "SonicVibe Voices", Email: "voice@sonicvibe.ng", Bio: "Professional voice-over services for commercials.", Specialty: "Voice-Over Artist"},
		}},
		{Slug: "academic-finders", ParentID: "education", Name: "Academic Finders", Pros: []ProData{
			{Name: "Prime Tutors", Email: "learn@prime.ng", Bio: "Expert home tutoring for all subjects.", Specialty: "Home Tutor"},
			{Name: "Melody Academy", Email: "music@melody.ng", Bio: "Professional music lessons for kids and adults.", Specialty: "Music Instructor"},
		}},
		{Slug: "vocational-finders", ParentID: "education", Name: "Vocational Finders", Pros: []ProData{
			{Name: "SafetyFirst Driving", Email: "drive@safety.ng", Bio: "Comprehensive driving lessons and license processing.", Specialty: "Driving School"},
			{Name: "SkillUp Hub", Email: "train@skillup.ng", Bio: "Hands-on tech and vocational skills training.", Specialty: "Tech Skill Trainer"},
		}},
		{Slug: "planning-finders", ParentID: "events", Name: "Planning Finders", Pros: []ProData{
			{Name: "GrandEvents Planning", Email: "plan@grand.ng", Bio: "Exquisite event planning and coordination.", Specialty: "Event Planner"},
			{Name: "DecoDreams Studio", Email: "decor@dreams.ng", Bio: "Creative event decoration and floral design.", Specialty: "Decorator"},
		}},
		{Slug: "entertainment-finders", ParentID: "events", Name: "Entertainment Finders", Pros: []ProData{
			{Name: "DJ SpinMaster", Email: "dj@spin.ng", Bio: "Premium music entertainment for all occasions.", Specialty: "DJ"},
			{Name: "LensCraft Media", Email: "photo@lenscraft.ng", Bio: "Capturing life's beautiful moments through photography.", Specialty: "Photographer"},
		}},
		{Slug: "medical-finders", ParentID: "health", Name: "Medical Finders", Pros: []ProData{
			{Name: "CareConnect Health", Email: "nurse@careconnect.ng", Bio: "Compassionate private nursing care at home.", Specialty: "Private Nurse"},
			{Name: "PhysioFlex Clinic", Email: "rehab@physioflex.ng", Bio: "Specialized physiotherapy and rehabilitation services.", Specialty: "Physiotherapist"},
		}},
		{Slug: "wellness-finders", ParentID: "health", Name: "Wellness Finders", Pros: []ProData{
			{Name: "FitBody Coaching", Email: "fit@fitbody.ng", Bio: "Personalized fitness training and weight loss programs.", Specialty: "Gym Instructor"},
			{Name: "ZenYoga Nigeria", Email: "yoga@zenyoga.ng", Bio: "Mindfulness and yoga classes for all levels.", Specialty: "Yoga Teacher"},
		}},
		{Slug: "care-finders", ParentID: "health", Name: "Care Finders", Pros: []ProData{
			{Name: "NannyLink Agency", Email: "care@nannylink.ng", Bio: "Vetted and experienced nannies for your kids.", Specialty: "Nanny"},
			{Name: "Companion Care", Email: "support@companion.ng", Bio: "Dedicated care and companionship for the elderly.", Specialty: "Elderly Companion"},
		}},
		{Slug: "transport-finders", ParentID: "logistics", Name: "Transport Finders", Pros: []ProData{
			{Name: "ProDrive Services", Email: "driver@prodrive.ng", Bio: "Reliable professional drivers for personal or business use.", Specialty: "Professional Driver"},
			{Name: "RapidTow Nigeria", Email: "tow@rapid.ng", Bio: "24/7 emergency towing and roadside assistance.", Specialty: "Towing Van"},
		}},
		{Slug: "delivery-finders", ParentID: "logistics", Name: "Delivery Finders", Pros: []ProData{
			{Name: "SwiftDelivery Express", Email: "dispatch@swift.ng", Bio: "Fast and secure intra-city delivery services.", Specialty: "Dispatch Rider"},
			{Name: "ReloEase Movers", Email: "move@reloease.ng", Bio: "Stress-free residential and office relocation.", Specialty: "Moving Service"},
		}},
		{Slug: "repair-finders", ParentID: "auto", Name: "Repair Finders", Pros: []ProData{
			{Name: "Segun Auto Fix", Email: "segun@autofix.ng", Bio: "Specialist in Japanese and German cars.", Specialty: "Car Mechanic"},
			{Name: "QuickVulcanizer", Email: "fix@quickvul.ng", Bio: "Emergency tire repairs and maintenance.", Specialty: "Vulcanizer"},
		}},
		{Slug: "auto-care-finders", ParentID: "auto", Name: "Auto Care Finders", Pros: []ProData{
			{Name: "GlossyWash Mobile", Email: "wash@glossy.ng", Bio: "Premium mobile car detailing at your doorstep.", Specialty: "Mobile Car Wash"},
			{Name: "SecureDrive Tech", Email: "track@securedrive.ng", Bio: "Advanced car tracking and security installations.", Specialty: "Car Tracker Installer"},
		}},
		{Slug: "culinary-finders", ParentID: "food", Name: "Culinary Finders", Pros: []ProData{
			{Name: "Chef Gbolahan", Email: "chef@gbolahan.ng", Bio: "Expert in local and continental dishes.", Specialty: "Private Chef"},
			{Name: "SweetDelights Cakes", Email: "bake@sweetdelights.ng", Bio: "Custom cakes and desserts for all celebrations.", Specialty: "Cake Baker"},
		}},
		{Slug: "agro-finders", ParentID: "food", Name: "Agro Finders", Pros: []ProData{
			{Name: "GreenThumb Farms", Email: "info@greenthumb.ng", Bio: "Professional farm management and consultancy.", Specialty: "Farm Manager"},
			{Name: "HappyPets Vet", Email: "care@happypets.ng", Bio: "Expert veterinary care and pet grooming.", Specialty: "Veterinary Doctor"},
		}},
		{Slug: "property-finders", ParentID: "realestate", Name: "Property Finders", Pros: []ProData{
			{Name: "LagosHome Finder", Email: "search@lagoshome.ng", Bio: "Helping you find the perfect property in Lagos.", Specialty: "Estate Agent"},
			{Name: "PrimeFacility Management", Email: "mgt@primefac.ng", Bio: "Comprehensive facility management for residential estates.", Specialty: "Facility Manager"},
		}},
		{Slug: "building-finders", ParentID: "realestate", Name: "Building Finders", Pros: []ProData{
			{Name: "ModernSpace Architects", Email: "design@modernspace.ng", Bio: "Innovative architectural design and project management.", Specialty: "Architect"},
			{Name: "BuildRight Construction", Email: "info@buildright.ng", Bio: "Quality masonry and building services.", Specialty: "Bricklayer"},
		}},
	}

	for nicheIndex, niche := range niches {
		for proIndex, pro := range niche.Pros {
			// Update or Create User
			user, err := client.User.UpsertOne(
				db.User.Email.Equals(pro.Email),
			).Create(
				db.User.Email.Set(pro.Email),
				db.User.Password.Set(string(hashedPassword)),
				db.User.Role.Set("PRO"),
				db.User.Name.Set(pro.Name),
			).Update(
				db.User.Name.Set(pro.Name),
			).Exec(ctx)

			if err != nil {
				log.Printf("Error with user %s: %v", pro.Email, err)
				continue
			}

			acceptsPos := (nicheIndex+proIndex)%2 == 0
			homeDelivery := (nicheIndex+proIndex)%3 == 0

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
			avatarIdx := (nicheIndex*2 + proIndex) % len(avatarUrls)
			avatarUrl := avatarUrls[avatarIdx]
			city := "Lagos"
			if (nicheIndex+proIndex)%2 == 1 {
				city = "Abuja"
			}

			// Update or Create ProProfile
			profile, err := client.ProProfile.UpsertOne(
				db.ProProfile.UserID.Equals(user.ID),
			).Create(
				db.ProProfile.User.Link(db.User.ID.Equals(user.ID)),
				db.ProProfile.Bio.Set(pro.Bio),
				db.ProProfile.HourlyRate.Set(4000),
				db.ProProfile.Specialties.Set(pro.Specialty),
				db.ProProfile.Niche.Set(niche.ParentID), // Top-level ID
				db.ProProfile.SubService.Set(niche.Slug), // Sub-niche category slug
				db.ProProfile.Verified.Set(true),
				db.ProProfile.Rating.Set(4.7),
				db.ProProfile.City.Set(city),
				db.ProProfile.AcceptsPos.Set(acceptsPos),
				db.ProProfile.HomeDelivery.Set(homeDelivery),
				db.ProProfile.LogoURL.Set(avatarUrl),
			).Update(
				db.ProProfile.Bio.Set(pro.Bio),
				db.ProProfile.Specialties.Set(pro.Specialty),
				db.ProProfile.Niche.Set(niche.ParentID),
				db.ProProfile.SubService.Set(niche.Slug),
				db.ProProfile.City.Set(city),
				db.ProProfile.AcceptsPos.Set(acceptsPos),
				db.ProProfile.HomeDelivery.Set(homeDelivery),
				db.ProProfile.LogoURL.Set(avatarUrl),
			).Exec(ctx)

			if err != nil {
				log.Printf("Error with profile for %s: %v", pro.Name, err)
				continue
			}

			// Create a Service if it doesn't exist (simplified)
			client.Service.CreateOne(
				db.Service.Name.Set(fmt.Sprintf("%s Consultation", pro.Specialty)),
				db.Service.Price.Set(5000),
				db.Service.ProProfile.Link(db.ProProfile.ID.Equals(profile.ID)),
				db.Service.Description.Set("Initial consultation and assessment."),
			).Exec(ctx)

			// Assign the custom generated image corresponding to the article's niche parent category
			imgPath := "/hero4.jpeg"
			switch niche.ParentID {
			case "home-services":
				imgPath = "/article_home.jpg"
			case "fashion":
				imgPath = "/article_fashion.jpg"
			case "professionals":
				imgPath = "/article_professional.jpg"
			case "education":
				imgPath = "/article_education.jpg"
			case "events":
				imgPath = "/article_events.jpg"
			case "health":
				imgPath = "/article_health.jpg"
			case "logistics":
				imgPath = "/article_logistics.jpg"
			case "auto":
				imgPath = "/article_auto.jpg"
			case "food":
				imgPath = "/article_food.jpg"
			case "realestate":
				imgPath = "/article_realestate.jpg"
			}

			client.Article.CreateOne(
				db.Article.Title.Set(fmt.Sprintf("How to choose the best %s in %s", pro.Specialty, "Lagos")),
				db.Article.Content.Set(fmt.Sprintf("This is an expert guide by %s detailing how to find, evaluate, and choose a top-quality %s for your project in Nigeria. Always check references, review portfolios, and verify licenses before booking.", pro.Name, pro.Specialty)),
				db.Article.Niche.Set(niche.ParentID),
				db.Article.ProProfile.Link(db.ProProfile.ID.Equals(profile.ID)),
				db.Article.Image.Set(imgPath),
			).Exec(ctx)
		}
	}

	log.Println("Reseed completed successfully with specific service tracking!")
}

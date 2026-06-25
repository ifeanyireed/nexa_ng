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
	Area       string
}

type ProductSeed struct {
	Name  string
	Price float64
	Image string
	Desc  string
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

	// Clear old articles, services, and products to avoid duplicate keys or spam on subsequent runs
	client.Article.FindMany().Delete().Exec(ctx)
	client.Service.FindMany().Delete().Exec(ctx)
	client.Product.FindMany().Delete().Exec(ctx)

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)

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

	// Seed an Admin Account
	_, err := client.User.UpsertOne(
		db.User.Email.Equals("admin@nexa.ng"),
	).Create(
		db.User.Email.Set("admin@nexa.ng"),
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set("ADMIN"),
		db.User.Name.Set("Nexa Super Admin"),
	).Update(
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set("ADMIN"),
	).Exec(ctx)

	if err != nil {
		log.Printf("Error creating admin account: %v", err)
	} else {
		log.Println("Successfully seeded admin@nexa.ng / password123")
	}

	// Seed a Client Account
	_, err = client.User.UpsertOne(
		db.User.Email.Equals("client@nexa.ng"),
	).Create(
		db.User.Email.Set("client@nexa.ng"),
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set("CLIENT"),
		db.User.Name.Set("Test Client"),
	).Update(
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set("CLIENT"),
	).Exec(ctx)

	if err != nil {
		log.Printf("Error creating client account: %v", err)
	} else {
		log.Println("Successfully seeded client@nexa.ng / password123")
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
			// Update or Create ProProfile
			profile, err := client.ProProfile.UpsertOne(
				db.ProProfile.UserID.Equals(user.ID),
			).Create(
				db.ProProfile.User.Link(db.User.ID.Equals(user.ID)),
				db.ProProfile.BusinessName.Set(fmt.Sprintf("%s Services", pro.Name)),
				db.ProProfile.Bio.Set(pro.Bio),
				db.ProProfile.HourlyRate.Set(4000),
				db.ProProfile.Specialties.Set(pro.Specialty),
				db.ProProfile.Niche.Set(niche.ParentID), // Top-level ID
				db.ProProfile.SubService.Set(niche.Slug), // Sub-niche category slug
				db.ProProfile.Verified.Set(true),
				db.ProProfile.Rating.Set(4.7),
				db.ProProfile.City.Set(city),
				db.ProProfile.Area.Set(pro.Area),
				db.ProProfile.AcceptsPos.Set(acceptsPos),
				db.ProProfile.HomeDelivery.Set(homeDelivery),
				db.ProProfile.LogoURL.Set(avatarUrl),
			).Update(
				db.ProProfile.BusinessName.Set(fmt.Sprintf("%s Services", pro.Name)),
				db.ProProfile.Bio.Set(pro.Bio),
				db.ProProfile.Specialties.Set(pro.Specialty),
				db.ProProfile.Niche.Set(niche.ParentID),
				db.ProProfile.SubService.Set(niche.Slug),
				db.ProProfile.City.Set(city),
				db.ProProfile.Area.Set(pro.Area),
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

			// Create a Product
			productSeeds := map[string][]ProductSeed{
				"home-services": {
					{"Premium Toolbox Set", 45000, "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=500&auto=format&fit=crop&q=60", "Complete set of high-quality tools for home repairs."},
					{"Smart Home Security Kit", 120000, "https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=500&auto=format&fit=crop&q=60", "Advanced security cameras and sensors."},
					{"Heavy-Duty Drill", 35000, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500&auto=format&fit=crop&q=60", "Professional grade power drill."},
					{"Eco-Friendly Cleaning Kit", 15000, "https://images.unsplash.com/photo-1584820927498-cafea1236113?w=500&auto=format&fit=crop&q=60", "Non-toxic cleaning supplies."},
				},
				"fashion": {
					{"Bespoke Native Fabric", 25000, "https://images.unsplash.com/photo-1603228254119-e6a4d015fb73?w=500&auto=format&fit=crop&q=60", "High-quality traditional fabric."},
					{"Men's Grooming Kit", 12000, "https://images.unsplash.com/photo-1621607512214-68297480165e?w=500&auto=format&fit=crop&q=60", "Premium beard oils and clippers."},
					{"Designer Sunglasses", 30000, "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=60", "Stylish eyewear."},
					{"Leather Oxford Shoes", 45000, "https://images.unsplash.com/photo-1614252209825-9c988891552a?w=500&auto=format&fit=crop&q=60", "Handcrafted leather footwear."},
				},
				"professionals": {
					{"Ergonomic Office Chair", 85000, "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=500&auto=format&fit=crop&q=60", "Comfortable seating for long hours."},
					{"Wireless Headphones", 60000, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60", "Focus without distractions."},
					{"Premium Leather Briefcase", 55000, "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60", "Professional laptop and document carrier."},
					{"Mechanical Keyboard", 35000, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&auto=format&fit=crop&q=60", "Tactile typing experience."},
				},
				"education": {
					{"Interactive Whiteboard", 150000, "https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?w=500&auto=format&fit=crop&q=60", "Modern teaching tool."},
					{"Acoustic Guitar Pack", 45000, "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=60", "Perfect for beginners."},
					{"Study Course Material", 20000, "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60", "Comprehensive study guides."},
					{"Science Experiment Kit", 25000, "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=500&auto=format&fit=crop&q=60", "Hands-on learning for kids."},
				},
				"events": {
					{"Party Lighting System", 75000, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=60", "Dynamic lights for any occasion."},
					{"Professional Camera Lens", 250000, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=60", "Capture memories in high definition."},
					{"Floral Arrangement Set", 30000, "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=500&auto=format&fit=crop&q=60", "Beautiful decorations."},
					{"DJ Controller", 180000, "https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?w=500&auto=format&fit=crop&q=60", "Mix tracks like a pro."},
				},
				"health": {
					{"Yoga Mat & Blocks", 15000, "https://images.unsplash.com/photo-1601134599986-7e2831f2dc34?w=500&auto=format&fit=crop&q=60", "Essential fitness gear."},
					{"Adjustable Dumbbells", 40000, "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&auto=format&fit=crop&q=60", "Space-saving workout equipment."},
					{"First Aid Trauma Kit", 25000, "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=500&auto=format&fit=crop&q=60", "Medical emergency supplies."},
					{"Massage Gun", 35000, "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&auto=format&fit=crop&q=60", "Deep tissue muscle recovery."},
				},
				"logistics": {
					{"Heavy Duty Moving Boxes", 10000, "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&auto=format&fit=crop&q=60", "Durable packaging."},
					{"GPS Tracker", 18000, "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=500&auto=format&fit=crop&q=60", "Real-time asset tracking."},
					{"Delivery Courier Bag", 15000, "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=60", "Insulated and waterproof."},
					{"Tow Strap Heavy Duty", 22000, "https://images.unsplash.com/photo-1549468057-5b7fa1a41d7a?w=500&auto=format&fit=crop&q=60", "Reliable towing accessory."},
				},
				"auto": {
					{"Car Care Detailing Kit", 28000, "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=500&auto=format&fit=crop&q=60", "Keep your vehicle shining."},
					{"Premium Synthetic Motor Oil", 18000, "https://images.unsplash.com/photo-1610488969395-5eb7300c1df0?w=500&auto=format&fit=crop&q=60", "High performance engine protection."},
					{"Smart Dash Cam", 45000, "https://images.unsplash.com/photo-1517005085862-e61b7b049d50?w=500&auto=format&fit=crop&q=60", "Record your journeys safely."},
					{"Portable Jump Starter", 35000, "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=500&auto=format&fit=crop&q=60", "Never get stranded again."},
				},
				"food": {
					{"Chef's Knife Set", 65000, "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500&auto=format&fit=crop&q=60", "Professional grade culinary knives."},
					{"Artisan Baking Kit", 25000, "https://images.unsplash.com/photo-1556910103-1c02745a872f?w=500&auto=format&fit=crop&q=60", "Everything you need to bake."},
					{"Premium Spice Collection", 15000, "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=60", "Exotic and rich flavors."},
					{"Organic Fertilizer Pack", 12000, "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=500&auto=format&fit=crop&q=60", "Boost your farm yields naturally."},
				},
				"realestate": {
					{"Smart Door Lock", 85000, "https://images.unsplash.com/photo-1558002038-1055907df827?w=500&auto=format&fit=crop&q=60", "Keyless and secure entry."},
					{"Interior Paint Premium Set", 40000, "https://images.unsplash.com/photo-1562184552-997c461abbe6?w=500&auto=format&fit=crop&q=60", "Transform your living space."},
					{"Architectural Design Software", 150000, "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&auto=format&fit=crop&q=60", "Professional 3D modeling tools."},
					{"Laser Distance Measure", 25000, "https://images.unsplash.com/photo-1534063224097-f507b9fb2b23?w=500&auto=format&fit=crop&q=60", "Accurate property measurements."},
				},
			}
			
			fallbackProducts := []ProductSeed{
				{"Nexa Verified Supply Box", 15000, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&auto=format&fit=crop&q=60", "Standard supplies."},
				{"Professional Starter Kit", 25000, "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=60", "Get started with everything you need."},
			}

			catProducts, ok := productSeeds[niche.ParentID]
			if !ok {
				catProducts = fallbackProducts
			}

			prodData := catProducts[proIndex%len(catProducts)]

			client.Product.CreateOne(
				db.Product.Name.Set(prodData.Name),
				db.Product.Price.Set(prodData.Price),
				db.Product.ProProfile.Link(db.ProProfile.ID.Equals(profile.ID)),
				db.Product.Description.Set(prodData.Desc),
				db.Product.Image.Set(prodData.Image),
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

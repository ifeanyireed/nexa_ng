package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/models"
)

// Default 7 Master Layout Templates definition
var DefaultLayoutTemplates = []models.LayoutTemplate{
	{
		Key:          "quick_order",
		Name:         "Quick-Order (Food, Groceries & FMCG)",
		Badge:        "Quick-Order",
		Description:  "High-velocity ordering with fast +/- item counters, floating checkout drawer, and express direct dispatch.",
		Icon:         "ShoppingBag",
		ComponentKey: "QuickOrderTemplate",
		ConfigJSON:   `{"allow_addons":true,"floating_cart":true,"estimated_prep_time_minutes":25,"delivery_radius_km":15}`,
	},
	{
		Key:          "booking_stay",
		Name:         "Rental & Stay Booking (Hotels, Shortlets & Apartments)",
		Badge:        "Rental & Stay",
		Description:  "Check-in/check-out date picker, nightly pricing calculator, guest selector, and instant reservation modal.",
		Icon:         "Building2",
		ComponentKey: "BookingStayTemplate",
		ConfigJSON:   `{"date_range_picker":true,"min_stay_nights":1,"guest_counter":true,"amenities_filter":true}`,
	},
	{
		Key:          "on_demand_dispatch",
		Name:         "On-Demand Dispatch (Rides, Haulage & Logistics)",
		Badge:        "On-Demand Dispatch",
		Description:  "Pickup and drop-off address geocoding, multi-vehicle fleet options, live fare estimator, and driver map dispatch.",
		Icon:         "Truck",
		ComponentKey: "OnDemandDispatchTemplate",
		ConfigJSON:   `{"route_geocoding":true,"vehicle_classes":["bike","car","van","truck"],"instant_fare_calc":true}`,
	},
	{
		Key:          "calendar_booking",
		Name:         "Calendar Booking (Tutors, Barbers, Salons & Healthcare)",
		Badge:        "Calendar Booking",
		Description:  "Weekly date strip, hourly time slot availability grid, verified artisan profiles, and appointment confirmation.",
		Icon:         "Calendar",
		ComponentKey: "CalendarBookingTemplate",
		ConfigJSON:   `{"slot_duration_minutes":60,"buffer_time_minutes":15,"advance_booking_days":14}`,
	},
	{
		Key:          "vehicle_inspection",
		Name:         "Vehicle Inspection & Autocare (Mechanics & Car Sales)",
		Badge:        "Vehicle Inspection",
		Description:  "Vehicle make/model/year picker, 150-point diagnostics checklist, mobile mechanic booking, and inspection reports.",
		Icon:         "Wrench",
		ComponentKey: "VehicleInspectionTemplate",
		ConfigJSON:   `{"obd2_diagnostics":true,"vehicle_make_selector":true,"mobile_inspection":true}`,
	},
	{
		Key:          "subscription_pickup",
		Name:         "Subscription & Laundry Pickup (Dry Cleaning & Waste)",
		Badge:        "Subscription Pickup",
		Description:  "Recurring weekly/monthly pickup plans, laundry bag/load capacity counter, and automated scheduled collection.",
		Icon:         "RefreshCw",
		ComponentKey: "SubscriptionPickupTemplate",
		ConfigJSON:   `{"recurring_billing":true,"bag_capacity_kg":[10,15,25],"frequency_options":["weekly","biweekly","monthly"]}`,
	},
	{
		Key:          "technical_quote",
		Name:         "Technical Quote & Custom Estimate (Plumbing, Solar & Construction)",
		Badge:        "Technical Quote",
		Description:  "Custom scope-of-work builder, photo upload for site faults, on-site survey request, and escrow milestone breakdown.",
		Icon:         "FileSpreadsheet",
		ComponentKey: "TechnicalQuoteTemplate",
		ConfigJSON:   `{"milestone_escrow":true,"fault_photo_upload":true,"site_survey_toggle":true}`,
	},
}

// Default Subdomain-to-Layout Assignments
var DefaultSubdomainAssignments = []models.SubdomainLayout{
	// 11 Master Verticals
	{SubdomainSlug: "food", LayoutKey: "quick_order", VerticalType: "MASTER_VERTICAL", CustomTitle: "Food & Fast Delivery", ThemeColor: "#E02424"},
	{SubdomainSlug: "hotels", LayoutKey: "booking_stay", VerticalType: "MASTER_VERTICAL", CustomTitle: "Hotels & Stays", ThemeColor: "#1A56DB"},
	{SubdomainSlug: "rides", LayoutKey: "on_demand_dispatch", VerticalType: "MASTER_VERTICAL", CustomTitle: "Rides & Transit", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "dispatch", LayoutKey: "on_demand_dispatch", VerticalType: "MASTER_VERTICAL", CustomTitle: "Express Dispatch", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "beauty", LayoutKey: "calendar_booking", VerticalType: "MASTER_VERTICAL", CustomTitle: "Beauty & Grooming", ThemeColor: "#9061F9"},
	{SubdomainSlug: "apartments", LayoutKey: "booking_stay", VerticalType: "MASTER_VERTICAL", CustomTitle: "Apartments & Shortlets", ThemeColor: "#1A56DB"},
	{SubdomainSlug: "cars", LayoutKey: "vehicle_inspection", VerticalType: "MASTER_VERTICAL", CustomTitle: "Cars & Auto Sales", ThemeColor: "#C88A3A"},
	{SubdomainSlug: "laundry", LayoutKey: "subscription_pickup", VerticalType: "MASTER_VERTICAL", CustomTitle: "Laundry & Dry Cleaning", ThemeColor: "#3F83F8"},
	{SubdomainSlug: "tutors", LayoutKey: "calendar_booking", VerticalType: "MASTER_VERTICAL", CustomTitle: "Tutors & Private Lessons", ThemeColor: "#9061F9"},
	{SubdomainSlug: "autocare", LayoutKey: "vehicle_inspection", VerticalType: "MASTER_VERTICAL", CustomTitle: "Autocare & Mechanics", ThemeColor: "#C88A3A"},
	{SubdomainSlug: "properties", LayoutKey: "technical_quote", VerticalType: "MASTER_VERTICAL", CustomTitle: "Properties & Real Estate", ThemeColor: "#0E9F6E"},

	// 24 Canonical Subcategories & Niche Finders
	{SubdomainSlug: "handyman", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Handyman & Home Repairs", ThemeColor: "#C88A3A"},
	{SubdomainSlug: "specialists", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Specialist Contractors", ThemeColor: "#1A56DB"},
	{SubdomainSlug: "cleaning", LayoutKey: "subscription_pickup", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Cleaning & Sanitation", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "sanitation", LayoutKey: "subscription_pickup", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Sanitation & Fumigation", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "style", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Style & Fashion Tailoring", ThemeColor: "#9061F9"},
	{SubdomainSlug: "wardrobe", LayoutKey: "subscription_pickup", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Wardrobe & Garment Care", ThemeColor: "#3F83F8"},
	{SubdomainSlug: "tech", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Tech & IT Hardware Services", ThemeColor: "#1A56DB"},
	{SubdomainSlug: "corporate", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Corporate & Legal Consultations", ThemeColor: "#1A56DB"},
	{SubdomainSlug: "creative", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Creative & Media Production", ThemeColor: "#9061F9"},
	{SubdomainSlug: "talent", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Talent & Staffing Agency", ThemeColor: "#9061F9"},
	{SubdomainSlug: "tutoring", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Academic & Language Tutoring", ThemeColor: "#9061F9"},
	{SubdomainSlug: "vocational", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Vocational & Practical Skills", ThemeColor: "#C88A3A"},
	{SubdomainSlug: "planning", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Event Planning & Catering", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "entertainment", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Entertainment & DJs", ThemeColor: "#9061F9"},
	{SubdomainSlug: "medical", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Medical & Home Care", ThemeColor: "#E02424"},
	{SubdomainSlug: "wellness", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Wellness, Spa & Massage", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "caregiving", LayoutKey: "calendar_booking", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Caregiving & Nanny Support", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "transport", LayoutKey: "on_demand_dispatch", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Logistics & Interstate Transport", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "mechanics", LayoutKey: "vehicle_inspection", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Certified Mechanics & Diagnostics", ThemeColor: "#C88A3A"},
	{SubdomainSlug: "culinary", LayoutKey: "quick_order", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Chefs, Meal Prep & Catering", ThemeColor: "#E02424"},
	{SubdomainSlug: "agriculture", LayoutKey: "quick_order", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Agribusiness & Fresh Produce", ThemeColor: "#0E9F6E"},
	{SubdomainSlug: "construction", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Building & Construction Engineering", ThemeColor: "#C88A3A"},
	{SubdomainSlug: "plumber", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Certified Plumbers & Piping", ThemeColor: "#1A56DB"},
	{SubdomainSlug: "solar", LayoutKey: "technical_quote", VerticalType: "SUBCATEGORY_NICHE", CustomTitle: "Solar Inverters & Renewables", ThemeColor: "#C88A3A"},
}

// 1. LIST ALL LAYOUT TEMPLATES
func ListLayoutTemplates(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if db.DB == nil {
		json.NewEncoder(w).Encode(DefaultLayoutTemplates)
		return
	}

	var templates []models.LayoutTemplate
	if err := db.DB.Find(&templates).Error; err != nil || len(templates) == 0 {
		// Auto seed default 7 templates into MySQL
		for _, t := range DefaultLayoutTemplates {
			db.DB.FirstOrCreate(&t, models.LayoutTemplate{Key: t.Key})
		}
		json.NewEncoder(w).Encode(DefaultLayoutTemplates)
		return
	}

	json.NewEncoder(w).Encode(templates)
}

// 2. GET SINGLE LAYOUT TEMPLATE BY KEY
func GetLayoutTemplate(w http.ResponseWriter, r *http.Request) {
	key := strings.ToLower(chi.URLParam(r, "key"))
	w.Header().Set("Content-Type", "application/json")

	if db.DB == nil {
		for _, t := range DefaultLayoutTemplates {
			if strings.EqualFold(t.Key, key) {
				json.NewEncoder(w).Encode(t)
				return
			}
		}
		http.Error(w, `{"error": "Layout template not found"}`, http.StatusNotFound)
		return
	}

	var template models.LayoutTemplate
	if err := db.DB.Where("`key` = ?", key).First(&template).Error; err != nil {
		http.Error(w, `{"error": "Layout template not found"}`, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(template)
}

// 3. CREATE OR REGISTER CUSTOM LAYOUT TEMPLATE
func CreateLayoutTemplate(w http.ResponseWriter, r *http.Request) {
	var req models.LayoutTemplate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	req.Key = strings.ToLower(strings.TrimSpace(req.Key))
	if req.Key == "" || req.Name == "" {
		http.Error(w, `{"error": "Key and Name are required"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if db.DB != nil {
		if err := db.DB.Create(&req).Error; err != nil {
			http.Error(w, `{"error": "Failed to create layout template: key might already exist"}`, http.StatusConflict)
			return
		}
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

// 4. UPDATE LAYOUT TEMPLATE
func UpdateLayoutTemplate(w http.ResponseWriter, r *http.Request) {
	key := strings.ToLower(chi.URLParam(r, "key"))
	var req models.LayoutTemplate
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if db.DB != nil {
		var existing models.LayoutTemplate
		if err := db.DB.Where("`key` = ?", key).First(&existing).Error; err != nil {
			http.Error(w, `{"error": "Layout template not found"}`, http.StatusNotFound)
			return
		}

		updates := map[string]interface{}{
			"name":          req.Name,
			"badge":         req.Badge,
			"description":   req.Description,
			"icon":          req.Icon,
			"component_key": req.ComponentKey,
			"config_json":   req.ConfigJSON,
			"updated_at":    time.Now(),
		}
		db.DB.Model(&existing).Updates(updates)
		db.DB.Where("`key` = ?", key).First(&existing)
		json.NewEncoder(w).Encode(existing)
		return
	}

	req.Key = key
	json.NewEncoder(w).Encode(req)
}

// 5. DELETE LAYOUT TEMPLATE
func DeleteLayoutTemplate(w http.ResponseWriter, r *http.Request) {
	key := strings.ToLower(chi.URLParam(r, "key"))
	w.Header().Set("Content-Type", "application/json")

	if db.DB != nil {
		db.DB.Where("`key` = ?", key).Delete(&models.LayoutTemplate{})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Layout template deleted successfully",
		"key":     key,
	})
}

// 6. LIST ALL SUBDOMAIN-TO-LAYOUT ASSIGNMENTS
func ListSubdomainLayouts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if db.DB == nil {
		json.NewEncoder(w).Encode(DefaultSubdomainAssignments)
		return
	}

	var assignments []models.SubdomainLayout
	if err := db.DB.Preload("Layout").Find(&assignments).Error; err != nil || len(assignments) == 0 {
		// Auto seed default subdomain assignments
		for _, s := range DefaultSubdomainAssignments {
			db.DB.Where(models.SubdomainLayout{SubdomainSlug: s.SubdomainSlug}).
				Assign(s).
				FirstOrCreate(&models.SubdomainLayout{SubdomainSlug: s.SubdomainSlug})
		}
		db.DB.Preload("Layout").Find(&assignments)
	}

	json.NewEncoder(w).Encode(assignments)
}

// 7. GET SUBDOMAIN LAYOUT ASSIGNMENT BY SLUG
func GetSubdomainLayout(w http.ResponseWriter, r *http.Request) {
	slug := strings.ToLower(chi.URLParam(r, "slug"))
	w.Header().Set("Content-Type", "application/json")

	if db.DB == nil {
		for _, a := range DefaultSubdomainAssignments {
			if strings.EqualFold(a.SubdomainSlug, slug) {
				json.NewEncoder(w).Encode(a)
				return
			}
		}
		// Fallback default: technical_quote
		fallback := models.SubdomainLayout{
			SubdomainSlug: slug,
			LayoutKey:     "technical_quote",
			VerticalType:  "SUBCATEGORY_NICHE",
			CustomTitle:   strings.ToUpper(slug),
			IsActive:      true,
		}
		json.NewEncoder(w).Encode(fallback)
		return
	}

	var assignment models.SubdomainLayout
	if err := db.DB.Preload("Layout").Where("subdomain_slug = ?", slug).First(&assignment).Error; err != nil {
		// Fallback default
		fallback := models.SubdomainLayout{
			SubdomainSlug: slug,
			LayoutKey:     "technical_quote",
			VerticalType:  "SUBCATEGORY_NICHE",
			CustomTitle:   strings.ToUpper(slug),
			IsActive:      true,
		}
		json.NewEncoder(w).Encode(fallback)
		return
	}

	json.NewEncoder(w).Encode(assignment)
}

// 8. UPDATE / SET SUBDOMAIN LAYOUT ASSIGNMENT
func UpdateSubdomainLayout(w http.ResponseWriter, r *http.Request) {
	slug := strings.ToLower(chi.URLParam(r, "slug"))
	var req struct {
		LayoutKey      string `json:"layout_key"`
		CustomTitle    string `json:"custom_title"`
		CustomSubtitle string `json:"custom_subtitle"`
		ThemeColor     string `json:"theme_color"`
		VerticalType   string `json:"vertical_type"`
		IsActive       *bool  `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	req.LayoutKey = strings.ToLower(strings.TrimSpace(req.LayoutKey))
	w.Header().Set("Content-Type", "application/json")

	if db.DB != nil {
		var existing models.SubdomainLayout
		err := db.DB.Where("subdomain_slug = ?", slug).First(&existing).Error
		if err != nil {
			// Create new mapping
			isActive := true
			if req.IsActive != nil {
				isActive = *req.IsActive
			}
			newMapping := models.SubdomainLayout{
				SubdomainSlug:  slug,
				LayoutKey:      req.LayoutKey,
				VerticalType:   req.VerticalType,
				CustomTitle:    req.CustomTitle,
				CustomSubtitle: req.CustomSubtitle,
				ThemeColor:     req.ThemeColor,
				IsActive:       isActive,
				CreatedAt:      time.Now(),
				UpdatedAt:      time.Now(),
			}
			if newMapping.VerticalType == "" {
				newMapping.VerticalType = "SUBCATEGORY_NICHE"
			}
			db.DB.Create(&newMapping)
			db.DB.Preload("Layout").Where("subdomain_slug = ?", slug).First(&newMapping)
			json.NewEncoder(w).Encode(newMapping)
			return
		}

		// Update existing mapping
		updates := map[string]interface{}{
			"updated_at": time.Now(),
		}
		if req.LayoutKey != "" {
			updates["layout_key"] = req.LayoutKey
		}
		if req.CustomTitle != "" {
			updates["custom_title"] = req.CustomTitle
		}
		if req.CustomSubtitle != "" {
			updates["custom_subtitle"] = req.CustomSubtitle
		}
		if req.ThemeColor != "" {
			updates["theme_color"] = req.ThemeColor
		}
		if req.VerticalType != "" {
			updates["vertical_type"] = req.VerticalType
		}
		if req.IsActive != nil {
			updates["is_active"] = *req.IsActive
		}

		db.DB.Model(&existing).Updates(updates)
		db.DB.Preload("Layout").Where("subdomain_slug = ?", slug).First(&existing)
		json.NewEncoder(w).Encode(existing)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"subdomain_slug": slug,
		"layout_key":     req.LayoutKey,
	})
}

// 9. SEED / RE-INITIALIZE ALL SUBDOMAIN LAYOUTS IN MYSQL
func SeedDefaultSubdomainLayouts(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if db.DB != nil {
		// 1. Seed 7 Layout Templates
		for _, t := range DefaultLayoutTemplates {
			db.DB.Where(models.LayoutTemplate{Key: t.Key}).
				Assign(t).
				FirstOrCreate(&models.LayoutTemplate{Key: t.Key})
		}

		// 2. Seed 35 Subdomain Layout Mappings (11 Master Verticals + 24 Subcategories)
		for _, s := range DefaultSubdomainAssignments {
			db.DB.Where(models.SubdomainLayout{SubdomainSlug: s.SubdomainSlug}).
				Assign(s).
				FirstOrCreate(&models.SubdomainLayout{SubdomainSlug: s.SubdomainSlug})
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":                    true,
		"message":                    "7 Layout Templates and 35 Subdomain assignments successfully initialized in MySQL",
		"total_templates_seeded":    len(DefaultLayoutTemplates),
		"total_subdomains_assigned": len(DefaultSubdomainAssignments),
	})
}

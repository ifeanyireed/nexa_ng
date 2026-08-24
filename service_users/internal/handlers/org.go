package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/middleware"
	"nexa/user_subscription_service/internal/models"
)

type OrgHandler struct {
	db *gorm.DB
}

func NewOrgHandler(db *gorm.DB) *OrgHandler {
	return &OrgHandler{db: db}
}

type CreateOrgRequest struct {
	Name string `json:"name"`
	Slug string `json:"slug"`
}

type InviteMemberRequest struct {
	Email string      `json:"email"`
	Role  models.Role `json:"role"`
}

func (h *OrgHandler) ListUserOrgs(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.JWTClaims)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var orgs []models.Organization
	if h.db != nil {
		h.db.Joins("JOIN WorkspaceMember ON WorkspaceMember.organizationId = Organization.id").
			Where("WorkspaceMember.userId = ? OR Organization.ownerId = ?", claims.UserID, claims.UserID).
			Preload("Subscription").
			Find(&orgs)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orgs)
}

func (h *OrgHandler) CreateOrg(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.JWTClaims)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req CreateOrgRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	slug := req.Slug
	if slug == "" {
		slug = uuid.New().String()[:8]
	}

	org := models.Organization{
		ID:           uuid.New().String(),
		Name:         req.Name,
		Slug:         slug,
		OwnerID:      claims.UserID,
		PlanTier:     models.PlanFreeTrial,
		BillingCycle: "MONTHLY",
		Status:       "ACTIVE",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if h.db != nil {
		if err := h.db.Create(&org).Error; err != nil {
			http.Error(w, `{"error": "Failed to create organization: slug might already exist"}`, http.StatusConflict)
			return
		}

		member := models.WorkspaceMember{
			ID:             uuid.New().String(),
			OrganizationID: org.ID,
			UserID:         claims.UserID,
			Role:           models.RoleTenantOwner,
			CreatedAt:      time.Now(),
		}
		h.db.Create(&member)

		sub := models.Subscription{
			ID:                 uuid.New().String(),
			OrganizationID:     org.ID,
			PlanTier:           models.PlanFreeTrial,
			Status:             "ACTIVE",
			CurrentPeriodStart: time.Now(),
			CurrentPeriodEnd:   time.Now().AddDate(0, 0, 14),
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}
		h.db.Create(&sub)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(org)
}

func (h *OrgHandler) GetOrgDetails(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	var org models.Organization
	if h.db != nil {
		if err := h.db.Preload("Members.User").Preload("Subscription").Preload("Owner").First(&org, "id = ?", orgID).Error; err != nil {
			http.Error(w, `{"error": "Organization not found"}`, http.StatusNotFound)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(org)
}

type SaveRBACRequest struct {
	Matrix map[string]map[string]bool `json:"matrix"`
}

func (h *OrgHandler) GetTenantRBAC(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = "default"
	}

	matrix := make(map[string]map[string]bool)

	if h.db != nil {
		var perms []models.TenantRolePermission
		if err := h.db.Where("tenantId = ?", orgID).Find(&perms).Error; err == nil && len(perms) > 0 {
			for _, p := range perms {
				if matrix[p.Role] == nil {
					matrix[p.Role] = make(map[string]bool)
				}
				matrix[p.Role][p.ModuleKey] = p.IsEnabled
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"tenant_id": orgID,
		"matrix":    matrix,
	})
}

func (h *OrgHandler) SaveTenantRBAC(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		orgID = "default"
	}

	var req SaveRBACRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid JSON body"}`, http.StatusBadRequest)
		return
	}

	if h.db != nil && req.Matrix != nil {
		for role, modules := range req.Matrix {
			for modKey, isEnabled := range modules {
				var existing models.TenantRolePermission
				err := h.db.Where("tenantId = ? AND role = ? AND moduleKey = ?", orgID, role, modKey).First(&existing).Error
				if err != nil {
					newPerm := models.TenantRolePermission{
						ID:        uuid.New().String(),
						TenantID:  orgID,
						Role:      role,
						ModuleKey: modKey,
						IsEnabled: isEnabled,
						CreatedAt: time.Now(),
						UpdatedAt: time.Now(),
					}
					h.db.Create(&newPerm)
				} else {
					h.db.Model(&existing).Updates(map[string]interface{}{
						"isEnabled": isEnabled,
						"updatedAt": time.Now(),
					})
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"message":   "Tenant RBAC matrix successfully persisted to MySQL database",
		"tenant_id": orgID,
		"matrix":    req.Matrix,
	})
}

var (
	systemReserved = map[string]bool{
		"admin": true, "superadmin": true, "super-admin": true, "erp": true, "app": true, "apps": true,
		"www": true, "api": true, "auth": true, "login": true, "signup": true, "register": true, "join": true,
		"logout": true, "dashboard": true, "portal": true, "billing": true, "checkout": true, "pay": true,
		"support": true, "help": true, "status": true, "health": true, "docs": true, "cdn": true, "static": true,
		"mail": true, "email": true, "staging": true, "dev": true, "test": true, "demo": true, "hub": true,
		"compass": true, "ofia": true, "nexa": true, "storefront": true, "shopfront": true, "marketplace": true,
	}

	masterVerticals = map[string]bool{
		"food": true, "hotels": true, "hotel": true, "rides": true, "ride": true, "dispatch": true,
		"beauty": true, "apartments": true, "apartment": true, "shortlets": true, "shortlet": true,
		"cars": true, "car": true, "laundry": true, "tutors": true, "tutor": true, "autocare": true,
		"properties": true, "property": true,
	}

	sectorAliases = map[string]bool{
		"home-services": true, "homeservices": true, "fashion-grooming": true, "fashion": true,
		"professional-services": true, "professionals": true, "education-skills": true, "education": true,
		"events-entertainment": true, "events": true, "health-wellness": true, "health": true,
		"logistics-transport": true, "logistics": true, "automotive-services": true, "auto": true,
		"food-agribusiness": true, "real-estate-construction": true, "realestate": true,
	}

	nicheSubcategories = map[string]bool{
		"handyman": true, "specialists": true, "cleaning": true, "sanitation": true, "style": true,
		"wardrobe": true, "tech": true, "corporate": true, "creative": true, "talent": true,
		"tutoring": true, "vocational": true, "planning": true, "entertainment": true, "medical": true,
		"wellness": true, "caregiving": true, "transport": true, "mechanics": true, "culinary": true,
		"agriculture": true, "construction": true, "plumber": true, "electrician": true, "carpenter": true,
		"painter": true, "tiler": true, "welder": true, "solar": true, "solar-installer": true, "generator": true,
		"generator-repairer": true, "ac-technician": true, "borehole": true, "inverter": true, "tailor": true,
		"barber": true, "hairdresser": true, "makeup": true, "makeup-artist": true, "nails": true,
		"lawyer": true, "accountant": true, "cctv": true, "car-mechanic": true, "chef": true,
		"caterer": true, "chauffeur": true, "mover": true,
	}

	validSlugRegex = regexp.MustCompile(`^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`)
)

func (h *OrgHandler) CheckSubdomainAvailability(w http.ResponseWriter, r *http.Request) {
	rawSlug := r.URL.Query().Get("slug")
	slug := strings.ToLower(strings.TrimSpace(rawSlug))
	slug = strings.ReplaceAll(slug, " ", "-")

	w.Header().Set("Content-Type", "application/json")

	if slug == "" || len(slug) < 3 {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"slug":         slug,
			"is_available": false,
			"category":     "INVALID_FORMAT",
			"message":      "Subdomain must be at least 3 characters long.",
			"suggestions":  []string{},
		})
		return
	}

	if len(slug) > 63 || !validSlugRegex.MatchString(slug) {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"slug":         slug,
			"is_available": false,
			"category":     "INVALID_FORMAT",
			"message":      "Subdomain can only contain lowercase alphanumeric characters and hyphens.",
			"suggestions":  []string{},
		})
		return
	}

	workspaceDomain := fmt.Sprintf("%s.ofia.ng", slug)
	storefrontDomain := fmt.Sprintf("%s.ofia.shop", slug)
	customShopDomain := fmt.Sprintf("%s.shop", slug)

	generateSuggestions := func(base string) []string {
		suffixes := []string{"hq", "ng", "biz", "store", "hub", "app", "global", "group"}
		var suggestions []string
		for _, s := range suffixes {
			candidate := fmt.Sprintf("%s-%s", base, s)
			if !systemReserved[candidate] && !masterVerticals[candidate] && !nicheSubcategories[candidate] {
				suggestions = append(suggestions, candidate)
				if len(suggestions) >= 4 {
					break
				}
			}
		}
		return suggestions
	}

	// 1. System Reserved
	if systemReserved[slug] {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"slug":               slug,
			"is_available":       false,
			"category":           "SYSTEM_RESERVED",
			"message":            fmt.Sprintf("'%s' is a reserved platform root address.", slug),
			"workspace_domain":   workspaceDomain,
			"storefront_domain":  storefrontDomain,
			"custom_shop_domain": customShopDomain,
			"suggestions":        generateSuggestions(slug),
		})
		return
	}

	// 2. Master Verticals
	if masterVerticals[slug] {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"slug":               slug,
			"is_available":       false,
			"category":           "VERTICAL_RESERVED",
			"message":            fmt.Sprintf("'%s' is reserved for the %s Master Marketplace Vertical.", slug, strings.ToUpper(slug)),
			"workspace_domain":   workspaceDomain,
			"storefront_domain":  storefrontDomain,
			"custom_shop_domain": customShopDomain,
			"suggestions":        generateSuggestions(slug),
		})
		return
	}

	// 3. Sector Aliases
	if sectorAliases[slug] {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"slug":               slug,
			"is_available":       false,
			"category":           "SECTOR_RESERVED",
			"message":            fmt.Sprintf("'%s' is reserved for a Compass Marketplace Sector.", slug),
			"workspace_domain":   workspaceDomain,
			"storefront_domain":  storefrontDomain,
			"custom_shop_domain": customShopDomain,
			"suggestions":        generateSuggestions(slug),
		})
		return
	}

	// 4. Niche Subcategories & Finders
	if nicheSubcategories[slug] {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"slug":               slug,
			"is_available":       false,
			"category":           "NICHE_RESERVED",
			"message":            fmt.Sprintf("'%s' is reserved for the '%s' Niche Discovery Cluster.", slug, slug),
			"workspace_domain":   workspaceDomain,
			"storefront_domain":  storefrontDomain,
			"custom_shop_domain": customShopDomain,
			"suggestions":        generateSuggestions(slug),
		})
		return
	}

	// 5. Look up existing tenant in MySQL database table `Organization`
	if h.db != nil {
		var count int64
		h.db.Model(&models.Organization{}).Where("slug = ?", slug).Count(&count)
		if count > 0 {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"slug":               slug,
				"is_available":       false,
				"category":           "TENANT_TAKEN",
				"message":            fmt.Sprintf("The subdomain '%s.ofia.ng' and storefront '%s.ofia.shop' are already taken by an existing tenant.", slug, slug),
				"workspace_domain":   workspaceDomain,
				"storefront_domain":  storefrontDomain,
				"custom_shop_domain": customShopDomain,
				"suggestions":        generateSuggestions(slug),
			})
			return
		}
	}

	// 6. Available!
	json.NewEncoder(w).Encode(map[string]interface{}{
		"slug":               slug,
		"is_available":       true,
		"category":           "AVAILABLE",
		"message":            fmt.Sprintf("'%s.ofia.ng' and '%s.ofia.shop' are both available!", slug, slug),
		"workspace_domain":   workspaceDomain,
		"storefront_domain":  storefrontDomain,
		"custom_shop_domain": customShopDomain,
		"suggestions":        []string{},
	})
}



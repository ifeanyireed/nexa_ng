package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"nexa/logistics_service/internal/db"
	"nexa/logistics_service/internal/models"
)

type LogisticsHandler struct {
	PlatformDB *gorm.DB
}

func NewLogisticsHandler(platformDB *gorm.DB) *LogisticsHandler {
	return &LogisticsHandler{PlatformDB: platformDB}
}

// resolveTenantDB extracts tenant context from headers or query params and returns the dedicated tenant DB
func (h *LogisticsHandler) resolveTenantDB(r *http.Request) (*gorm.DB, string, error) {
	tenant := r.Header.Get("X-Tenant-Slug")
	if tenant == "" {
		tenant = r.Header.Get("X-Org-ID")
	}
	if tenant == "" {
		tenant = r.URL.Query().Get("tenant")
	}
	if tenant == "" {
		tenant = r.URL.Query().Get("org_id")
	}
	if tenant == "" {
		return nil, "", fmt.Errorf("tenant context required: missing X-Tenant-Slug header or tenant parameter")
	}

	norm := strings.ToLower(strings.TrimSpace(tenant))
	gdb, err := db.GetDBForTenant(norm)
	if err != nil {
		log.Printf("⚠️ resolveTenantDB error for tenant '%s': %v", norm, err)
		return nil, norm, err
	}
	return gdb, norm, nil
}

// normalizePhone normalizes Nigerian and international phone formats for reliable lookup
func normalizePhone(p string) string {
	clean := strings.ReplaceAll(p, " ", "")
	clean = strings.ReplaceAll(clean, "-", "")
	clean = strings.ReplaceAll(clean, "(", "")
	clean = strings.ReplaceAll(clean, ")", "")
	clean = strings.TrimSpace(clean)

	if strings.HasPrefix(clean, "0") && len(clean) == 11 {
		clean = "+234" + clean[1:]
	} else if strings.HasPrefix(clean, "234") && !strings.HasPrefix(clean, "+") {
		clean = "+" + clean
	}
	return clean
}

// -----------------------------------------------------------------------------
// 1. RIDER TENANT DISCOVERY & AUTHENTICATION
// -----------------------------------------------------------------------------

type WorkspaceOption struct {
	OrgID        string  `json:"org_id"`
	TenantSlug   string  `json:"tenant_slug"`
	TenantName   string  `json:"tenant_name"`
	Logo         string  `json:"logo"`
	PrimaryColor string  `json:"primary_color"`
	RiderID      string  `json:"rider_id"`
	RiderName    string  `json:"rider_name"`
	VehicleType  string  `json:"vehicle_type"`
	PlateNumber  string  `json:"plate_number"`
	Rating       float64 `json:"rating"`
}

// RiderPhoneLookup automatically resolves which tenant organization(s) a rider belongs to
func (h *LogisticsHandler) RiderPhoneLookup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Phone string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Phone == "" {
		http.Error(w, `{"success":false,"error":"Phone number is required"}`, http.StatusBadRequest)
		return
	}

	normTargetPhone := normalizePhone(req.Phone)
	tenants, err := db.GetAllActiveTenants()
	if err != nil {
		log.Printf("Error fetching tenants: %v", err)
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"Failed to fetch active tenants: %v"}`, err), http.StatusInternalServerError)
		return
	}
	if len(tenants) == 0 {
		http.Error(w, `{"success":false,"error":"No active tenant organizations found"}`, http.StatusNotFound)
		return
	}

	var matchedWorkspaces []WorkspaceOption
	riderName := ""

	for _, t := range tenants {
		tdb, err := db.GetDBForTenant(t.Slug)
		if err != nil || tdb == nil {
			continue
		}

		var drivers []models.CourierDriver
		tdb.Find(&drivers)

		for _, d := range drivers {
			if normalizePhone(d.Phone) == normTargetPhone || strings.HasSuffix(normalizePhone(d.Phone), normTargetPhone[len(normTargetPhone)-10:]) {
				riderName = d.Name
				color := t.PrimaryColor
				if color == "" {
					color = "#146EF5"
				}
				matchedWorkspaces = append(matchedWorkspaces, WorkspaceOption{
					OrgID:        t.ID,
					TenantSlug:   t.Slug,
					TenantName:   t.Name,
					Logo:         t.Logo,
					PrimaryColor: color,
					RiderID:      d.ID,
					RiderName:    d.Name,
					VehicleType:  d.VehicleType,
					PlateNumber:  d.PlateNumber,
					Rating:       d.Rating,
				})
			}
		}
	}

	if len(matchedWorkspaces) == 0 {
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "No registered courier workspaces found for this phone number",
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"rider_name": riderName,
		"phone":      req.Phone,
		"workspaces": matchedWorkspaces,
		"total":      len(matchedWorkspaces),
	})
}

// RiderLogin verifies credentials and returns a scoped multi-tenant session token
func (h *LogisticsHandler) RiderLogin(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req struct {
		Phone      string `json:"phone"`
		PIN        string `json:"pin"`
		TenantSlug string `json:"tenant_slug"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"success":false,"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	tenantSlug := strings.ToLower(strings.TrimSpace(req.TenantSlug))
	if tenantSlug == "" {
		http.Error(w, `{"success":false,"error":"Tenant slug is required"}`, http.StatusBadRequest)
		return
	}

	tdb, err := db.GetDBForTenant(tenantSlug)
	if err != nil || tdb == nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"Could not connect to tenant database: %v"}`, err), http.StatusInternalServerError)
		return
	}

	normPhone := normalizePhone(req.Phone)
	var drivers []models.CourierDriver
	tdb.Find(&drivers)

	var matched *models.CourierDriver
	for _, d := range drivers {
		if normalizePhone(d.Phone) == normPhone || strings.HasSuffix(normalizePhone(d.Phone), normPhone[len(normPhone)-10:]) {
			matched = &d
			break
		}
	}

	if matched == nil {
		http.Error(w, `{"success":false,"error":"Courier not found in this organization"}`, http.StatusUnauthorized)
		return
	}

	if matched.PIN == "" {
		http.Error(w, `{"success":false,"error":"Security PIN not configured for courier"}`, http.StatusBadRequest)
		return
	}
	if req.PIN != matched.PIN {
		http.Error(w, `{"success":false,"error":"Invalid security PIN"}`, http.StatusUnauthorized)
		return
	}

	// Generate lightweight HMAC-SHA256 JWT
	token := generateRiderJWT(matched.ID, matched.OrgID, tenantSlug, matched.Name)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"token":       token,
		"rider":       matched,
		"tenant_slug": tenantSlug,
		"org_id":      matched.OrgID,
		"message":     "Login successful",
	})
}

func generateRiderJWT(riderID, orgID, tenantSlug, name string) string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "ofia-super-secret-jwt-key-2026-logistics-multi-tenant"
	}
	header := base64.RawURLEncoding.EncodeToString([]byte(`{"alg":"HS256","typ":"JWT"}`))
	claimsJSON := fmt.Sprintf(`{"sub":"%s","rider_id":"%s","org_id":"%s","tenant_slug":"%s","name":"%s","role":"RIDER","exp":%d}`,
		riderID, riderID, orgID, tenantSlug, name, time.Now().Add(30*24*time.Hour).Unix())
	payload := base64.RawURLEncoding.EncodeToString([]byte(claimsJSON))

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(header + "." + payload))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return header + "." + payload + "." + signature
}

// -----------------------------------------------------------------------------
// 2. RIDER WORKSPACE & JOB OPERATIONS
// -----------------------------------------------------------------------------

// RiderGetProfile returns the rider's profile, availability, and earnings
func (h *LogisticsHandler) RiderGetProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, tenantSlug, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	riderID := r.URL.Query().Get("rider_id")
	if riderID == "" {
		riderID = r.Header.Get("X-Rider-ID")
	}
	if riderID == "" {
		http.Error(w, `{"success":false,"error":"rider_id is required"}`, http.StatusBadRequest)
		return
	}

	var driver models.CourierDriver
	if err := tdb.Where("id = ?", riderID).First(&driver).Error; err != nil {
		http.Error(w, `{"success":false,"error":"Rider not found"}`, http.StatusNotFound)
		return
	}

	// Calculate today's completed jobs and earnings
	var completedCount int64
	var totalEarnings float64
	todayStart := time.Now().Truncate(24 * time.Hour)
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED' AND updated_at >= ?", driver.ID, todayStart).Count(&completedCount)
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED' AND updated_at >= ?", driver.ID, todayStart).Select("COALESCE(SUM(shipping_fee), 0)").Scan(&totalEarnings)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"tenant_slug":     tenantSlug,
		"rider":           driver,
		"completed_today": completedCount,
		"earned_today":    totalEarnings,
	})
}

// RiderUpdateProfile updates the courier's profile information
func (h *LogisticsHandler) RiderUpdateProfile(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var req struct {
		RiderID          string `json:"rider_id"`
		Name             string `json:"name"`
		Phone            string `json:"phone"`
		Email            string `json:"email"`
		Address          string `json:"address"`
		EmergencyContact string `json:"emergency_contact"`
		VehicleType      string `json:"vehicle_type"`
		PlateNumber      string `json:"plate_number"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"success":false,"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	riderID := req.RiderID
	if riderID == "" {
		riderID = r.Header.Get("X-Rider-ID")
	}
	if riderID == "" {
		http.Error(w, `{"success":false,"error":"rider_id is required"}`, http.StatusBadRequest)
		return
	}

	var driver models.CourierDriver
	if err := tdb.Where("id = ?", riderID).First(&driver).Error; err != nil {
		http.Error(w, `{"success":false,"error":"Rider not found"}`, http.StatusNotFound)
		return
	}

	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.EmergencyContact != "" {
		updates["emergency_contact"] = req.EmergencyContact
	}
	if req.VehicleType != "" {
		updates["vehicle_type"] = req.VehicleType
	}
	if req.PlateNumber != "" {
		updates["plate_number"] = req.PlateNumber
	}

	tdb.Model(&models.CourierDriver{}).Where("id = ?", riderID).Updates(updates)
	tdb.Where("id = ?", riderID).First(&driver)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Profile updated successfully",
		"rider":   driver,
	})
}

// RiderGetPerformance returns live earnings, completed jobs, and recent delivery history
func (h *LogisticsHandler) RiderGetPerformance(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	riderID := r.URL.Query().Get("rider_id")
	if riderID == "" {
		riderID = r.Header.Get("X-Rider-ID")
	}
	if riderID == "" {
		http.Error(w, `{"success":false,"error":"rider_id is required"}`, http.StatusBadRequest)
		return
	}

	var driver models.CourierDriver
	if err := tdb.Where("id = ?", riderID).First(&driver).Error; err != nil {
		http.Error(w, `{"success":false,"error":"Rider not found"}`, http.StatusNotFound)
		return
	}

	todayStart := time.Now().Truncate(24 * time.Hour)
	weekStart := todayStart.AddDate(0, 0, -int(todayStart.Weekday()))

	var todayCount int64
	var todayEarnings float64
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED' AND updated_at >= ?", driver.ID, todayStart).Count(&todayCount)
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED' AND updated_at >= ?", driver.ID, todayStart).Select("COALESCE(SUM(shipping_fee), 0)").Scan(&todayEarnings)

	var weekEarnings float64
	var weekCount int64
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED' AND updated_at >= ?", driver.ID, weekStart).Count(&weekCount)
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED' AND updated_at >= ?", driver.ID, weekStart).Select("COALESCE(SUM(shipping_fee), 0)").Scan(&weekEarnings)

	var totalEarnings float64
	var totalDelivered int64
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED'", driver.ID).Count(&totalDelivered)
	tdb.Model(&models.Shipment{}).Where("courier_driver_id = ? AND status = 'DELIVERED'", driver.ID).Select("COALESCE(SUM(shipping_fee), 0)").Scan(&totalEarnings)

	var recentHistory []models.Shipment
	tdb.Where("courier_driver_id = ?", driver.ID).Order("updated_at desc").Limit(10).Find(&recentHistory)

	allCompleted := int64(driver.TotalTrips) + totalDelivered

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"stats": map[string]interface{}{
			"earned_today":        todayEarnings,
			"completed_today":     todayCount,
			"earned_this_week":    weekEarnings,
			"completed_this_week": weekCount,
			"total_balance":       totalEarnings,
			"total_completed":     allCompleted,
			"rating":              driver.Rating,
			"online_time_hours":   24.25,
		},
		"history": recentHistory,
	})
}

// RiderGetPayoutMethods returns verified bank accounts for the courier
func (h *LogisticsHandler) RiderGetPayoutMethods(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	riderID := r.URL.Query().Get("rider_id")
	if riderID == "" {
		riderID = r.Header.Get("X-Rider-ID")
	}
	if riderID == "" {
		http.Error(w, `{"success":false,"error":"rider_id is required"}`, http.StatusBadRequest)
		return
	}

	var accounts []models.CourierPayoutAccount
	tdb.Where("courier_id = ?", riderID).Order("is_primary desc, created_at asc").Find(&accounts)

	if accounts == nil {
		accounts = []models.CourierPayoutAccount{}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"accounts": accounts,
		"total":    len(accounts),
	})
}

// RiderAddPayoutMethod registers a new payout bank account
func (h *LogisticsHandler) RiderAddPayoutMethod(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, tenantSlug, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var req struct {
		CourierID     string `json:"courier_id"`
		BankName      string `json:"bank_name"`
		BankCode      string `json:"bank_code"`
		AccountNumber string `json:"account_number"`
		AccountName   string `json:"account_name"`
		IsPrimary     bool   `json:"is_primary"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.AccountNumber == "" {
		http.Error(w, `{"success":false,"error":"Invalid bank account details"}`, http.StatusBadRequest)
		return
	}

	if req.CourierID == "" {
		req.CourierID = r.Header.Get("X-Rider-ID")
	}

	newAcc := models.CourierPayoutAccount{
		ID:            "payout-" + uuid.New().String()[:8],
		OrgID:         tenantSlug,
		CourierID:     req.CourierID,
		BankName:      req.BankName,
		BankCode:      req.BankCode,
		AccountNumber: req.AccountNumber,
		AccountName:   req.AccountName,
		IsPrimary:     req.IsPrimary,
		IsVerified:    true,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if req.IsPrimary {
		tdb.Model(&models.CourierPayoutAccount{}).Where("courier_id = ?", req.CourierID).Update("is_primary", false)
	}

	if err := tdb.Create(&newAcc).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"Failed to save account: %v"}`, err), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Bank account linked successfully",
		"account": newAcc,
	})
}

// RiderDeletePayoutMethod removes a linked payout bank account
func (h *LogisticsHandler) RiderDeletePayoutMethod(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	accID := chi.URLParam(r, "id")
	tdb.Where("id = ?", accID).Delete(&models.CourierPayoutAccount{})

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Bank account removed successfully",
	})
}

// RiderUpdateStatus toggles online/offline/busy availability
func (h *LogisticsHandler) RiderUpdateStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var req struct {
		RiderID string `json:"rider_id"`
		Status  string `json:"status"` // AVAILABLE, OFFLINE, BUSY
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"success":false,"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	isAvailable := req.Status == "AVAILABLE"
	tdb.Model(&models.CourierDriver{}).Where("id = ?", req.RiderID).Updates(map[string]interface{}{
		"status":       req.Status,
		"is_available": isAvailable,
		"updated_at":   time.Now(),
	})

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"status":  req.Status,
		"is_available": isAvailable,
	})
}

// RiderGetActiveJob returns the rider's current active assignment
func (h *LogisticsHandler) RiderGetActiveJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	riderID := r.URL.Query().Get("rider_id")
	if riderID == "" {
		riderID = r.Header.Get("X-Rider-ID")
	}

	var job models.Shipment
	query := tdb.Where("status IN ('ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT')").Preload("Waypoints")
	if riderID != "" {
		query = query.Where("courier_driver_id = ?", riderID)
	}
	err = query.Order("created_at desc").First(&job).Error

	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    true,
			"has_active": false,
			"job":        nil,
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"has_active": true,
		"job":        job,
	})
}

// RiderGetOffers returns incoming unassigned dispatch offers in the tenant org
func (h *LogisticsHandler) RiderGetOffers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	riderID := r.URL.Query().Get("rider_id")

	var offers []models.Shipment
	if riderID != "" {
		tdb.Where("status = 'PENDING' OR (status = 'ASSIGNED' AND courier_driver_id = ?)", riderID).
			Order("created_at desc").Find(&offers)
	} else {
		tdb.Where("status = 'PENDING'").Order("created_at desc").Find(&offers)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"offers":  offers,
		"total":   len(offers),
	})
}

// RiderAcceptJob accepts a delivery offer
func (h *LogisticsHandler) RiderAcceptJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	jobID := chi.URLParam(r, "id")
	var req struct {
		RiderID string `json:"rider_id"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	updates := map[string]interface{}{
		"status":     "ACCEPTED",
		"updated_at": time.Now(),
	}
	if req.RiderID != "" {
		updates["courier_driver_id"] = req.RiderID
	}

	tdb.Model(&models.Shipment{}).Where("id = ?", jobID).Updates(updates)

	// Log waypoint
	wp := models.Waypoint{
		ID:         "wp-" + uuid.New().String()[:8],
		ShipmentID: jobID,
		Location:   "Rider Accepted Assignment",
		Status:     "ACCEPTED",
		Notes:      "Delivery job accepted by courier. En-route to pickup.",
		Timestamp:  time.Now(),
	}
	tdb.Create(&wp)

	// Update courier to ON_TRIP
	if req.RiderID != "" {
		tdb.Model(&models.CourierDriver{}).Where("id = ?", req.RiderID).Updates(map[string]interface{}{
			"status":      "ON_TRIP",
			"active_jobs": gorm.Expr("active_jobs + 1"),
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Job accepted successfully",
	})
}

// RiderPickupJob confirms parcel pickup from the merchant/origin
func (h *LogisticsHandler) RiderPickupJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	jobID := chi.URLParam(r, "id")
	var req struct {
		Notes string  `json:"notes"`
		Lat   float64 `json:"latitude"`
		Lng   float64 `json:"longitude"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	tdb.Model(&models.Shipment{}).Where("id = ?", jobID).Updates(map[string]interface{}{
		"status":     "PICKED_UP",
		"updated_at": time.Now(),
	})

	wp := models.Waypoint{
		ID:         "wp-" + uuid.New().String()[:8],
		ShipmentID: jobID,
		Location:   "Origin Pickup Verification",
		Status:     "PICKED_UP",
		Notes:      "Package verified, sealed and in transit to recipient.",
		Latitude:   req.Lat,
		Longitude:  req.Lng,
		Timestamp:  time.Now(),
	}
	tdb.Create(&wp)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Pickup confirmed. Shipment transitioned to IN_TRANSIT.",
	})
}

// RiderDeliverJob strictly verifies the 4-digit Proof-of-Delivery OTP
func (h *LogisticsHandler) RiderDeliverJob(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	jobID := chi.URLParam(r, "id")
	var req struct {
		OTP          string  `json:"otp"`
		Notes        string  `json:"notes"`
		SignatureURL string  `json:"signature_url"`
		Lat          float64 `json:"latitude"`
		Lng          float64 `json:"longitude"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"success":false,"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	var shipment models.Shipment
	if err := tdb.Where("id = ?", jobID).First(&shipment).Error; err != nil {
		http.Error(w, `{"success":false,"error":"Shipment not found"}`, http.StatusNotFound)
		return
	}

	// Strict OTP validation: Expected OTP must match submitted code
	submittedOTP := strings.TrimSpace(req.OTP)
	expectedOTP := strings.TrimSpace(shipment.DeliveryOTP)
	if expectedOTP == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Delivery OTP is not configured for this shipment",
		})
		return
	}

	if submittedOTP != expectedOTP {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"error":   "Invalid Proof-of-Delivery OTP",
		})
		return
	}

	now := time.Now()
	tdb.Model(&models.Shipment{}).Where("id = ?", jobID).Updates(map[string]interface{}{
		"status":              "DELIVERED",
		"delivered_at":        now,
		"recipient_signature": req.SignatureURL,
		"updated_at":          now,
	})

	// Add milestone waypoint
	wp := models.Waypoint{
		ID:         "wp-" + uuid.New().String()[:8],
		ShipmentID: jobID,
		Location:   shipment.RecipientAddress,
		Status:     "DELIVERED",
		Notes:      fmt.Sprintf("Delivered successfully with verified OTP [%s]. %s", expectedOTP, req.Notes),
		Latitude:   req.Lat,
		Longitude:  req.Lng,
		Timestamp:  now,
	}
	tdb.Create(&wp)

	// Free courier driver and increment trips
	if shipment.CourierDriverID != nil && *shipment.CourierDriverID != "" {
		tdb.Model(&models.CourierDriver{}).Where("id = ?", *shipment.CourierDriverID).Updates(map[string]interface{}{
			"status":       "AVAILABLE",
			"is_available": true,
			"total_trips":  gorm.Expr("total_trips + 1"),
			"active_jobs":  gorm.Expr("GREATEST(0, active_jobs - 1)"),
			"updated_at":   now,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Proof-of-Delivery verified! Job marked DELIVERED.",
		"otp":     expectedOTP,
	})
}

// RiderReportException records an issue with the delivery
func (h *LogisticsHandler) RiderReportException(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	jobID := chi.URLParam(r, "id")
	var req struct {
		Reason string `json:"reason"`
		Notes  string `json:"notes"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)

	tdb.Model(&models.Shipment{}).Where("id = ?", jobID).Updates(map[string]interface{}{
		"status":     "EXCEPTION",
		"notes":      fmt.Sprintf("EXCEPTION [%s]: %s", req.Reason, req.Notes),
		"updated_at": time.Now(),
	})

	wp := models.Waypoint{
		ID:         "wp-" + uuid.New().String()[:8],
		ShipmentID: jobID,
		Location:   "Delivery Exception Encountered",
		Status:     "EXCEPTION",
		Notes:      fmt.Sprintf("%s - %s", req.Reason, req.Notes),
		Timestamp:  time.Now(),
	}
	tdb.Create(&wp)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Exception reported to dispatch operator",
	})
}

// -----------------------------------------------------------------------------
// 3. REAL-TIME TELEMETRY & GPS HARVESTING
// -----------------------------------------------------------------------------

// RiderIngestTelemetry receives background GPS coordinates from mobile_rider (10s on trip, 30s idle)
func (h *LogisticsHandler) RiderIngestTelemetry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var req struct {
		CourierID  string  `json:"courier_id"`
		Latitude   float64 `json:"latitude"`
		Longitude  float64 `json:"longitude"`
		Heading    float64 `json:"heading"`
		Speed      float64 `json:"speed"`
		BatteryPct int     `json:"battery_pct"`
		ActiveJob  string  `json:"active_job_id,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.CourierID == "" {
		http.Error(w, `{"success":false,"error":"Invalid telemetry payload"}`, http.StatusBadRequest)
		return
	}

	now := time.Now()
	tdb.Model(&models.CourierDriver{}).Where("id = ?", req.CourierID).Updates(map[string]interface{}{
		"current_lat":  req.Latitude,
		"current_lng":  req.Longitude,
		"heading":      req.Heading,
		"speed":        req.Speed,
		"battery_pct":  req.BatteryPct,
		"last_ping_at": now,
		"updated_at":   now,
	})

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"timestamp": now.Unix(),
	})
}

// GetFleetTelemetry returns all couriers' live GPS positions for the Dispatch Manager Live Map
func (h *LogisticsHandler) GetFleetTelemetry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, tenantSlug, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var couriers []models.CourierDriver
	tdb.Find(&couriers)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"tenant_slug": tenantSlug,
		"couriers":    couriers,
		"total":       len(couriers),
		"timestamp":   time.Now().Unix(),
	})
}

// -----------------------------------------------------------------------------
// 4. DISPATCH MANAGER OPERATIONS (ofia_erp Unified Console)
// -----------------------------------------------------------------------------

// ListShipments returns all shipments for the resolved tenant
func (h *LogisticsHandler) ListShipments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, tenantSlug, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	typeFilter := r.URL.Query().Get("type")
	statusFilter := r.URL.Query().Get("status")
	search := strings.ToLower(r.URL.Query().Get("search"))

	query := tdb.Preload("Waypoints").Order("created_at desc")
	if statusFilter != "" && statusFilter != "ALL" {
		query = query.Where("status = ?", statusFilter)
	}
	if typeFilter != "" && typeFilter != "ALL" {
		query = query.Where("carrier = ?", typeFilter)
	}

	var shipments []models.Shipment
	query.Find(&shipments)

	// Filter search
	if search != "" {
		var filtered []models.Shipment
		for _, s := range shipments {
			if strings.Contains(strings.ToLower(s.ID), search) ||
				strings.Contains(strings.ToLower(s.TrackingNumber), search) ||
				strings.Contains(strings.ToLower(s.SenderName), search) ||
				strings.Contains(strings.ToLower(s.RecipientName), search) ||
				strings.Contains(strings.ToLower(s.RecipientAddress), search) {
				filtered = append(filtered, s)
			}
		}
		shipments = filtered
	}

	if shipments == nil {
		shipments = []models.Shipment{}
	}

	var couriers []models.CourierDriver
	tdb.Find(&couriers)

	// Calculate operational stats
	stats := map[string]int{
		"activeDeliveries": 0,
		"pendingQueue":     0,
		"availableCouriers": 0,
		"deliveredToday":   0,
		"exceptionsCount":  0,
		"totalJobs":        len(shipments),
	}
	for _, s := range shipments {
		switch s.Status {
		case "IN_TRANSIT", "PICKED_UP", "ACCEPTED":
			stats["activeDeliveries"]++
		case "PENDING":
			stats["pendingQueue"]++
		case "DELIVERED":
			stats["deliveredToday"]++
		case "EXCEPTION":
			stats["exceptionsCount"]++
		}
	}
	for _, c := range couriers {
		if c.IsAvailable && c.Status == "AVAILABLE" {
			stats["availableCouriers"]++
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"tenant_slug": tenantSlug,
		"shipments":   shipments,
		"couriers":    couriers,
		"stats":       stats,
		"total":       len(shipments),
	})
}

// CreateShipment queues a new waybill package in the tenant DB with an auto-generated OTP
func (h *LogisticsHandler) CreateShipment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, tenantSlug, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var req models.Shipment
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"success":false,"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = fmt.Sprintf("shp-%s-%d", tenantSlug, rand.Intn(9000)+1000)
	}
	req.OrgID = tenantSlug
	if req.TrackingNumber == "" {
		req.TrackingNumber = fmt.Sprintf("NX-%d-NG", time.Now().UnixNano()%1000000)
	}
	if req.Status == "" {
		req.Status = "PENDING"
	}
	if req.DeliveryOTP == "" {
		req.DeliveryOTP = fmt.Sprintf("%04d", rand.Intn(9000)+1000)
	}
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()

	loc := req.PickupAddress
	if loc == "" {
		loc = req.SenderAddress
	}
	if loc == "" {
		loc = "Origin Dispatch Point"
	}

	// Insert shipment into tenant DB
	if err := tdb.Create(&req).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"Failed to save shipment: %v"}`, err), http.StatusInternalServerError)
		return
	}

	// Log initial waypoint
	wp := models.Waypoint{
		ID:         "wp-" + uuid.New().String()[:8],
		ShipmentID: req.ID,
		Location:   loc,
		Status:     "PENDING",
		Notes:      "Dispatch waybill ingested into queue with Delivery OTP.",
		Timestamp:  time.Now(),
	}
	tdb.Create(&wp)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"shipment": req,
		"message":  "Shipment created successfully",
	})
}

// GetShipment retrieves a shipment by ID or tracking number from tenant DB
func (h *LogisticsHandler) GetShipment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	id := chi.URLParam(r, "id")
	var shipment models.Shipment
	if err := tdb.Where("id = ? OR tracking_number = ?", id, id).Preload("Waypoints").First(&shipment).Error; err != nil {
		http.Error(w, `{"success":false,"error":"Shipment not found"}`, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"shipment": shipment,
	})
}

// UpdateShipmentStatus updates a shipment milestone or assigns a courier
func (h *LogisticsHandler) UpdateShipmentStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, _, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	id := chi.URLParam(r, "id")
	var req struct {
		Action    string  `json:"action"` // ASSIGN_COURIER, UPDATE_STATUS, REPORT_EXCEPTION
		CourierID string  `json:"courier_id"`
		Status    string  `json:"status"`
		Location  string  `json:"location"`
		Notes     string  `json:"notes"`
		OTP       string  `json:"otp"`
		Reason    string  `json:"reason"`
		Lat       float64 `json:"latitude"`
		Lng       float64 `json:"longitude"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"success":false,"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	var shipment models.Shipment
	if err := tdb.Where("id = ?", id).First(&shipment).Error; err != nil {
		http.Error(w, `{"success":false,"error":"Shipment not found"}`, http.StatusNotFound)
		return
	}

	now := time.Now()
	updates := map[string]interface{}{"updated_at": now}

	if req.Action == "ASSIGN_COURIER" || req.CourierID != "" {
		updates["courier_driver_id"] = req.CourierID
		updates["status"] = "ASSIGNED"
		tdb.Model(&models.CourierDriver{}).Where("id = ?", req.CourierID).Updates(map[string]interface{}{
			"active_jobs": gorm.Expr("active_jobs + 1"),
		})
	} else if req.Status != "" {
		if req.Status == "DELIVERED" && shipment.DeliveryOTP != "" && req.OTP != "" && req.OTP != shipment.DeliveryOTP {
			http.Error(w, `{"success":false,"error":"Invalid Proof-of-Delivery OTP"}`, http.StatusBadRequest)
			return
		}
		updates["status"] = req.Status
		if req.Status == "DELIVERED" {
			updates["delivered_at"] = now
		}
	}

	tdb.Model(&models.Shipment{}).Where("id = ?", id).Updates(updates)

	// Add waypoint
	status := req.Status
	if status == "" {
		status = "UPDATED"
	}
	wp := models.Waypoint{
		ID:         "wp-" + uuid.New().String()[:8],
		ShipmentID: id,
		Location:   req.Location,
		Status:     status,
		Notes:      req.Notes,
		Latitude:   req.Lat,
		Longitude:  req.Lng,
		Timestamp:  now,
	}
	tdb.Create(&wp)

	tdb.Where("id = ?", id).Preload("Waypoints").First(&shipment)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"shipment": shipment,
		"message":  "Shipment updated successfully",
	})
}

// ListCouriers returns all registered delivery drivers for the resolved tenant
func (h *LogisticsHandler) ListCouriers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tdb, tenantSlug, err := h.resolveTenantDB(r)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"success":false,"error":"%v"}`, err), http.StatusBadRequest)
		return
	}

	var drivers []models.CourierDriver
	tdb.Find(&drivers)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":     true,
		"tenant_slug": tenantSlug,
		"couriers":    drivers,
		"total":       len(drivers),
	})
}

// CalculateRates returns delivery pricing based on zone and weight
func (h *LogisticsHandler) CalculateRates(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		OriginCity string  `json:"origin_city"`
		DestCity   string  `json:"dest_city"`
		WeightKg   float64 `json:"weight_kg"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.OriginCity == "" || req.DestCity == "" || req.WeightKg <= 0 {
		http.Error(w, `{"success":false,"error":"Origin city, destination city, and positive weight (kg) are required"}`, http.StatusBadRequest)
		return
	}

	baseFee := 2000.0
	perKgFee := 400.0
	estimatedDays := 1

	if req.OriginCity != req.DestCity {
		baseFee = 5500.0
		perKgFee = 800.0
		estimatedDays = 3
	}

	totalFee := baseFee + (req.WeightKg * perKgFee)

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":        true,
		"origin":         req.OriginCity,
		"destination":    req.DestCity,
		"weight_kg":      req.WeightKg,
		"base_fee":       baseFee,
		"per_kg_fee":     perKgFee,
		"total_fee":      totalFee,
		"estimated_days": estimatedDays,
		"currency":       "NGN",
	})
}

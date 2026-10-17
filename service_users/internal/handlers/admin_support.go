package handlers

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
	"nexa/user_subscription_service/internal/models"
)

type AdminSupportHandler struct {
	db *gorm.DB
}

func NewAdminSupportHandler(db *gorm.DB) *AdminSupportHandler {
	return &AdminSupportHandler{db: db}
}

// ==========================================
// 1. PLATFORM SETTINGS & SMTP
// ==========================================

func (h *AdminSupportHandler) GetPlatformSettings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var setting models.PlatformSetting
	if err := h.db.First(&setting, "id = ?", "global_root").Error; err != nil {
		// Initialize default platform settings if not yet existing
		setting = models.PlatformSetting{
			ID:                     "global_root",
			PlatformName:           "Ofia Enterprise Cloud",
			RootDomain:             "ofia.ng",
			SupportEmail:           "support@ofia.ng",
			SecurityEmail:          "security@ofia.ng",
			DefaultCurrency:        "NGN",
			DefaultTimezone:        "Africa/Lagos",
			SessionTimeoutHours:    168,
			Enforce2FA:             false,
			MaintenanceMode:        false,
			BroadcastBannerEnabled: false,
			BroadcastBannerText:    "",
			BroadcastBannerType:    "info",
			UpdatedAt:              time.Now(),
		}
		h.db.Create(&setting)
	}

	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"data": map[string]any{
			"platformName":           setting.PlatformName,
			"rootDomain":             setting.RootDomain,
			"supportEmail":           setting.SupportEmail,
			"securityEmail":          setting.SecurityEmail,
			"defaultCurrency":        setting.DefaultCurrency,
			"defaultTimezone":        setting.DefaultTimezone,
			"sessionTimeoutHours":    setting.SessionTimeoutHours,
			"enforce2fa":             setting.Enforce2FA,
			"maintenanceMode":        setting.MaintenanceMode,
			"broadcastBannerEnabled": setting.BroadcastBannerEnabled,
			"broadcastBannerText":    setting.BroadcastBannerText,
			"broadcastBannerType":    setting.BroadcastBannerType,
			"updatedAt":              setting.UpdatedAt,
		},
	})
}

func (h *AdminSupportHandler) SavePlatformSettings(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var body struct {
		PlatformName           string `json:"platformName"`
		RootDomain             string `json:"rootDomain"`
		SupportEmail           string `json:"supportEmail"`
		SecurityEmail          string `json:"securityEmail"`
		DefaultCurrency        string `json:"defaultCurrency"`
		DefaultTimezone        string `json:"defaultTimezone"`
		SessionTimeoutHours    int    `json:"sessionTimeoutHours"`
		Enforce2fa             bool   `json:"enforce2fa"`
		MaintenanceMode        bool   `json:"maintenanceMode"`
		BroadcastBannerEnabled bool   `json:"broadcastBannerEnabled"`
		BroadcastBannerText    string `json:"broadcastBannerText"`
		BroadcastBannerType    string `json:"broadcastBannerType"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	setting := models.PlatformSetting{
		ID:                     "global_root",
		PlatformName:           strings.TrimSpace(body.PlatformName),
		RootDomain:             strings.TrimSpace(body.RootDomain),
		SupportEmail:           strings.TrimSpace(body.SupportEmail),
		SecurityEmail:          strings.TrimSpace(body.SecurityEmail),
		DefaultCurrency:        strings.TrimSpace(body.DefaultCurrency),
		DefaultTimezone:        strings.TrimSpace(body.DefaultTimezone),
		SessionTimeoutHours:    body.SessionTimeoutHours,
		Enforce2FA:             body.Enforce2fa,
		MaintenanceMode:        body.MaintenanceMode,
		BroadcastBannerEnabled: body.BroadcastBannerEnabled,
		BroadcastBannerText:    body.BroadcastBannerText,
		BroadcastBannerType:    body.BroadcastBannerType,
		UpdatedAt:              time.Now(),
	}
	if setting.PlatformName == "" {
		setting.PlatformName = "Ofia Enterprise Cloud"
	}
	if setting.SessionTimeoutHours <= 0 {
		setting.SessionTimeoutHours = 168
	}

	if err := h.db.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(&setting).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to save platform settings: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"message": "Platform settings updated successfully",
		"data":    body,
	})
}

func (h *AdminSupportHandler) GetPlatformSmtp(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var row models.TenantSmtpSetting
	if err := h.db.First(&row, "tenant_slug = ?", "platform").Error; err != nil {
		json.NewEncoder(w).Encode(map[string]any{
			"configured":  false,
			"tenantSlug":  "platform",
			"provider":    "hostinger",
			"host":        "smtp.hostinger.com",
			"port":        465,
			"encryption":  "ssl",
			"fromEmail":   "hello@resultspro.ng",
			"fromName":    "Ofia Platform Root Security",
			"username":    "hello@resultspro.ng",
			"hasPassword": false,
		})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{
		"configured":  true,
		"tenantSlug":  row.TenantSlug,
		"provider":    row.Provider,
		"host":        row.Host,
		"port":        row.Port,
		"encryption":  row.Encryption,
		"fromEmail":   row.FromEmail,
		"fromName":    row.FromName,
		"username":    row.Username,
		"hasPassword": len(row.Password) > 0,
	})
}

func (h *AdminSupportHandler) SavePlatformSmtp(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		Provider   string `json:"provider"`
		Host       string `json:"host"`
		Port       int    `json:"port"`
		Encryption string `json:"encryption"`
		FromEmail  string `json:"fromEmail"`
		FromName   string `json:"fromName"`
		Username   string `json:"username"`
		Password   string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	pwd := payload.Password
	if pwd == "••••••••" || pwd == "" {
		var existing models.TenantSmtpSetting
		if err := h.db.First(&existing, "tenant_slug = ?", "platform").Error; err == nil {
			pwd = existing.Password
		}
	}

	setting := models.TenantSmtpSetting{
		TenantSlug: "platform",
		Provider:   payload.Provider,
		Host:       payload.Host,
		Port:       payload.Port,
		Encryption: payload.Encryption,
		FromEmail:  payload.FromEmail,
		FromName:   payload.FromName,
		Username:   payload.Username,
		Password:   pwd,
		UpdatedAt:  time.Now(),
	}

	if err := h.db.Clauses(clause.OnConflict{
		UpdateAll: true,
	}).Create(&setting).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to save SMTP settings: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ==========================================
// 2. CONTACT INQUIRIES
// ==========================================

func (h *AdminSupportHandler) ListContactInquiries(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var inquiries []models.ContactInquiry
	query := h.db.Model(&models.ContactInquiry{}).Order("created_at DESC")

	status := r.URL.Query().Get("status")
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	priority := r.URL.Query().Get("priority")
	if priority != "" && priority != "ALL" {
		query = query.Where("priority = ?", priority)
	}

	search := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("search")))
	if search != "" {
		like := "%" + search + "%"
		query = query.Where("LOWER(name) LIKE ? OR LOWER(email) LIKE ? OR ticket_number LIKE ? OR LOWER(message) LIKE ?", like, like, like, like)
	}

	if err := query.Find(&inquiries).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch contact inquiries: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(inquiries)
}

func (h *AdminSupportHandler) CreateContactInquiry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var body struct {
		Name    string `json:"name"`
		Email   string `json:"email"`
		Phone   string `json:"phone"`
		Subject string `json:"subject"`
		Message string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	name := strings.TrimSpace(body.Name)
	email := strings.ToLower(strings.TrimSpace(body.Email))
	msg := strings.TrimSpace(body.Message)

	if name == "" || email == "" || msg == "" {
		http.Error(w, `{"error": "Name, email, and message are required"}`, http.StatusBadRequest)
		return
	}

	subject := strings.TrimSpace(body.Subject)
	if subject == "" {
		subject = "General Inquiry"
	}

	priority := "MEDIUM"
	if strings.Contains(strings.ToLower(subject), "billing") || strings.Contains(strings.ToLower(subject), "payment") {
		priority = "HIGH"
	}

	ticketNumber := fmt.Sprintf("TKT-%d", 8000+rand.Intn(1999))
	id := fmt.Sprintf("cnt-%d", time.Now().UnixMilli())

	inquiry := models.ContactInquiry{
		ID:           id,
		TicketNumber: ticketNumber,
		Name:         name,
		Email:        email,
		Phone:        strings.TrimSpace(body.Phone),
		Subject:      subject,
		Message:      msg,
		Priority:     priority,
		Status:       "OPEN",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := h.db.Create(&inquiry).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create inquiry: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"success":      true,
		"message":      "Your message has been received! Our support team will get back to you shortly.",
		"ticketNumber": ticketNumber,
		"ticket":       inquiry,
	})
}

func (h *AdminSupportHandler) UpdateContactInquiry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error": "Inquiry ID required"}`, http.StatusBadRequest)
		return
	}

	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updates["updated_at"] = time.Now()
	if err := h.db.Model(&models.ContactInquiry{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update inquiry: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	var updated models.ContactInquiry
	h.db.First(&updated, "id = ?", id)
	json.NewEncoder(w).Encode(map[string]any{"success": true, "ticket": updated})
}

func (h *AdminSupportHandler) DeleteContactInquiry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error": "Inquiry ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.ContactInquiry{}, "id = ?", id).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete inquiry: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ==========================================
// 3. WAITLIST LEADS
// ==========================================

func (h *AdminSupportHandler) ListWaitlistLeads(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	refCode := r.URL.Query().Get("referralCode")
	if refCode != "" {
		var lead models.WaitlistLead
		if err := h.db.First(&lead, "referral_code = ?", refCode).Error; err != nil {
			http.Error(w, `{"error": "Referral code not found"}`, http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(lead)
		return
	}

	var leads []models.WaitlistLead
	query := h.db.Model(&models.WaitlistLead{}).Order("created_at DESC")

	status := r.URL.Query().Get("status")
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	niche := r.URL.Query().Get("niche")
	if niche != "" && niche != "ALL" {
		query = query.Where("niche = ?", niche)
	}

	search := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("search")))
	if search != "" {
		like := "%" + search + "%"
		query = query.Where("LOWER(full_name) LIKE ? OR LOWER(business_name) LIKE ? OR LOWER(email) LIKE ? OR referral_code LIKE ?", like, like, like, like)
	}

	if err := query.Find(&leads).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch waitlist leads: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(leads)
}

func (h *AdminSupportHandler) CreateWaitlistLead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var body struct {
		FullName           string   `json:"fullName"`
		BusinessName       string   `json:"businessName"`
		Email              string   `json:"email"`
		Phone              string   `json:"phone"`
		Role               string   `json:"role"`
		BusinessType       string   `json:"businessType"`
		ToolType           string   `json:"toolType"`
		CustomBusinessType *string  `json:"customBusinessType"`
		CustomToolType     *string  `json:"customToolType"`
		Niche              string   `json:"niche"`
		State              string   `json:"state"`
		City               string   `json:"city"`
		TeamSize           string   `json:"teamSize"`
		FeaturesInterest   []string `json:"featuresInterest"`
		ReferredBy         *string  `json:"referredBy"`
		Notes              *string  `json:"notes"`
	}

	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	email := strings.ToLower(strings.TrimSpace(body.Email))
	if email == "" || body.FullName == "" {
		http.Error(w, `{"error": "Full name and email are required"}`, http.StatusBadRequest)
		return
	}

	// Check if already in waitlist
	var existing models.WaitlistLead
	if err := h.db.First(&existing, "email = ?", email).Error; err == nil {
		json.NewEncoder(w).Encode(map[string]any{
			"success": true,
			"message": "You are already on the waitlist!",
			"lead":    existing,
		})
		return
	}

	var count int64
	h.db.Model(&models.WaitlistLead{}).Count(&count)
	queueNumber := int(1085 + count)

	refCode := fmt.Sprintf("REF-%s", strings.ToUpper(uuid.New().String()[:6]))
	id := fmt.Sprintf("wt-%d", time.Now().UnixMilli())

	featuresStr := strings.Join(body.FeaturesInterest, ", ")

	lead := models.WaitlistLead{
		ID:                 id,
		QueueNumber:        queueNumber,
		FullName:           strings.TrimSpace(body.FullName),
		BusinessName:       strings.TrimSpace(body.BusinessName),
		Email:              email,
		Phone:              strings.TrimSpace(body.Phone),
		Role:               body.Role,
		BusinessType:       body.BusinessType,
		ToolType:           body.ToolType,
		CustomBusinessType: body.CustomBusinessType,
		CustomToolType:     body.CustomToolType,
		Niche:              body.Niche,
		State:              body.State,
		City:               body.City,
		TeamSize:           body.TeamSize,
		FeaturesInterest:   featuresStr,
		ReferralCode:       refCode,
		ReferredBy:         body.ReferredBy,
		Status:             "PENDING",
		Notes:              body.Notes,
		CreatedAt:          time.Now(),
		UpdatedAt:          time.Now(),
	}

	if err := h.db.Create(&lead).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to join waitlist: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"message": "Successfully joined the waitlist!",
		"lead":    lead,
	})
}

func (h *AdminSupportHandler) UpdateWaitlistLead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error": "Lead ID required"}`, http.StatusBadRequest)
		return
	}

	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updates["updated_at"] = time.Now()
	if err := h.db.Model(&models.WaitlistLead{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update lead: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	var updated models.WaitlistLead
	h.db.First(&updated, "id = ?", id)
	json.NewEncoder(w).Encode(map[string]any{"success": true, "lead": updated})
}

func (h *AdminSupportHandler) DeleteWaitlistLead(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, `{"error": "Lead ID required"}`, http.StatusBadRequest)
		return
	}

	if err := h.db.Delete(&models.WaitlistLead{}, "id = ?", id).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete lead: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

// ==========================================
// 4. SUPPORT TICKETS, KB & CHAT
// ==========================================

func (h *AdminSupportHandler) ListSupportTickets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var tickets []models.SupportTicket
	query := h.db.Model(&models.SupportTicket{}).Order("created_at DESC")

	status := r.URL.Query().Get("status")
	if status != "" && status != "ALL" {
		query = query.Where("status = ?", status)
	}

	tenantSlug := r.URL.Query().Get("tenant_slug")
	if tenantSlug != "" {
		query = query.Where("tenant_slug = ?", tenantSlug)
	}

	if err := query.Find(&tickets).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch tickets: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(tickets)
}

func (h *AdminSupportHandler) GetSupportTicket(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	var ticket models.SupportTicket
	if err := h.db.First(&ticket, "id = ?", id).Error; err != nil {
		http.Error(w, `{"error": "Ticket not found"}`, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(ticket)
}

func (h *AdminSupportHandler) CreateSupportTicket(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var ticket models.SupportTicket
	if err := json.NewDecoder(r.Body).Decode(&ticket); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if ticket.ID == "" {
		ticket.ID = "tkt_" + uuid.New().String()[:12]
	}
	if ticket.TicketNumber == "" {
		ticket.TicketNumber = fmt.Sprintf("SUP-%d", 1000+rand.Intn(8999))
	}
	if ticket.Status == "" {
		ticket.Status = "open"
	}
	ticket.CreatedAt = time.Now()
	ticket.UpdatedAt = time.Now()

	if err := h.db.Create(&ticket).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create ticket: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(ticket)
}

func (h *AdminSupportHandler) UpdateSupportTicket(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updates["updated_at"] = time.Now()
	if err := h.db.Model(&models.SupportTicket{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update ticket: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	var updated models.SupportTicket
	h.db.First(&updated, "id = ?", id)
	json.NewEncoder(w).Encode(updated)
}

func (h *AdminSupportHandler) ListTicketMessages(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	ticketID := chi.URLParam(r, "id")
	var messages []models.SupportTicketMessage
	if err := h.db.Where("ticket_id = ?", ticketID).Order("created_at ASC").Find(&messages).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch messages: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(messages)
}

func (h *AdminSupportHandler) CreateTicketMessage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	ticketID := chi.URLParam(r, "id")
	var msg models.SupportTicketMessage
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	msg.ID = "msg_" + uuid.New().String()[:12]
	msg.TicketID = ticketID
	msg.CreatedAt = time.Now()

	if err := h.db.Create(&msg).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to post message: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(msg)
}

// ------------------------------------------
// KB Articles & Categories
// ------------------------------------------

func (h *AdminSupportHandler) ListKbArticles(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var articles []models.SupportKbArticle
	query := h.db.Model(&models.SupportKbArticle{}).Order("order ASC, created_at DESC")

	status := r.URL.Query().Get("status")
	if status != "" {
		query = query.Where("status = ?", status)
	}

	category := r.URL.Query().Get("category")
	if category != "" {
		query = query.Where("category = ?", category)
	}

	if err := query.Find(&articles).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch articles: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(articles)
}

func (h *AdminSupportHandler) GetKbArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	var article models.SupportKbArticle
	if err := h.db.First(&article, "id = ? OR slug = ?", id, id).Error; err != nil {
		http.Error(w, `{"error": "Article not found"}`, http.StatusNotFound)
		return
	}

	json.NewEncoder(w).Encode(article)
}

func (h *AdminSupportHandler) CreateKbArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var article models.SupportKbArticle
	if err := json.NewDecoder(r.Body).Decode(&article); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	article.ID = "art_" + uuid.New().String()[:12]
	if article.Slug == "" {
		article.Slug = slugify(article.Title)
	}
	article.CreatedAt = time.Now()
	article.UpdatedAt = time.Now()

	if err := h.db.Create(&article).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create article: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(article)
}

func (h *AdminSupportHandler) UpdateKbArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	updates["updated_at"] = time.Now()
	if err := h.db.Model(&models.SupportKbArticle{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update article: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	var updated models.SupportKbArticle
	h.db.First(&updated, "id = ?", id)
	json.NewEncoder(w).Encode(updated)
}

func (h *AdminSupportHandler) DeleteKbArticle(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	id := chi.URLParam(r, "id")
	if err := h.db.Delete(&models.SupportKbArticle{}, "id = ?", id).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to delete article: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

func (h *AdminSupportHandler) ListKbCategories(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var cats []models.SupportKbCategory
	if err := h.db.Order("order ASC, created_at ASC").Find(&cats).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch categories: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(cats)
}

func (h *AdminSupportHandler) CreateKbCategory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var cat models.SupportKbCategory
	if err := json.NewDecoder(r.Body).Decode(&cat); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	cat.ID = "kbcat_" + uuid.New().String()[:10]
	if cat.Slug == "" {
		cat.Slug = slugify(cat.Name)
	}
	cat.CreatedAt = time.Now()

	if err := h.db.Create(&cat).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create category: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(cat)
}

// ------------------------------------------
// Chat Sessions & History
// ------------------------------------------

func (h *AdminSupportHandler) ListChatSessions(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var sessions []models.SupportChatSession
	if err := h.db.Order("updated_at DESC").Find(&sessions).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch chat sessions: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(sessions)
}

func (h *AdminSupportHandler) CreateChatSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var session models.SupportChatSession
	if err := json.NewDecoder(r.Body).Decode(&session); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if session.ID == "" {
		session.ID = "sess_" + uuid.New().String()[:12]
	}
	session.Status = "active"
	session.CreatedAt = time.Now()
	session.UpdatedAt = time.Now()

	if err := h.db.Create(&session).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to create session: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(session)
}

func (h *AdminSupportHandler) ListChatHistory(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		http.Error(w, `{"error": "session_id required"}`, http.StatusBadRequest)
		return
	}

	var messages []models.SupportChatMessage
	if err := h.db.Where("session_id = ?", sessionID).Order("timestamp ASC").Find(&messages).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch messages: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(messages)
}

func (h *AdminSupportHandler) CreateChatMessage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var msg models.SupportChatMessage
	if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if msg.SessionID == "" || msg.Text == "" {
		http.Error(w, `{"error": "session_id and text required"}`, http.StatusBadRequest)
		return
	}

	msg.ID = "cmsg_" + uuid.New().String()[:12]
	msg.Timestamp = time.Now()

	if err := h.db.Create(&msg).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to save message: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	// Update session's last_message
	h.db.Model(&models.SupportChatSession{}).Where("id = ?", msg.SessionID).Updates(map[string]any{
		"last_message": msg.Text,
		"updated_at":   time.Now(),
	})

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(msg)
}

// ------------------------------------------
// Staff Status
// ------------------------------------------

func (h *AdminSupportHandler) GetStaffStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var staffList []models.SupportStaffStatus
	if err := h.db.Find(&staffList).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch staff status: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(staffList)
}

func (h *AdminSupportHandler) UpdateStaffStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if h.db == nil {
		http.Error(w, `{"error": "Database service unavailable"}`, http.StatusServiceUnavailable)
		return
	}

	var payload struct {
		StaffEmail string `json:"staff_email"`
		StaffName  string `json:"staff_name"`
		IsOnline   bool   `json:"is_online"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.StaffEmail == "" {
		http.Error(w, `{"error": "staff_email required"}`, http.StatusBadRequest)
		return
	}

	status := models.SupportStaffStatus{
		ID:            "stf_" + uuid.New().String()[:8],
		StaffEmail:    strings.ToLower(strings.TrimSpace(payload.StaffEmail)),
		StaffName:     payload.StaffName,
		IsOnline:      payload.IsOnline,
		LastHeartbeat: time.Now(),
	}

	if err := h.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "staff_email"}},
		DoUpdates: clause.AssignmentColumns([]string{"staff_name", "is_online", "last_heartbeat"}),
	}).Create(&status).Error; err != nil {
		http.Error(w, fmt.Sprintf(`{"error": "Failed to update staff status: %s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}

package handlers

import (
	"encoding/json"
	"net/http"
	"service_erp/utils"
)

// HandleSendEmail handles requests to send emails via the finance email utility with multi-tenant direct SMTP and failover
func HandleSendEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}

	var payload utils.EmailPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON request body"})
		return
	}

	tenantSlug := payload.TenantSlug
	if tenantSlug == "" {
		tenantSlug = r.Header.Get("x-tenant-slug")
	}
	if tenantSlug == "" {
		tenantSlug = extractTenantSlug(r)
	}
	payload.TenantSlug = tenantSlug

	targetDB := getDBForSlug(tenantSlug)
	if err := DispatchTenantEmail(targetDB, tenantSlug, payload); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":  "success",
		"message": "Email sent successfully",
	})
}

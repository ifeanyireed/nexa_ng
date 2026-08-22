package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"nexa/logistics_service/internal/models"
)

type LogisticsHandler struct {
	DB *gorm.DB
}

func NewLogisticsHandler(db *gorm.DB) *LogisticsHandler {
	return &LogisticsHandler{DB: db}
}

// ListShipments returns all shipments for an organization
func (h *LogisticsHandler) ListShipments(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	orgID := r.URL.Query().Get("org_id")
	if orgID == "" {
		orgID = "org_edusuite_102"
	}

	var shipments []models.Shipment
	if h.DB != nil {
		h.DB.Where("org_id = ?", orgID).Preload("Waypoints").Order("created_at desc").Find(&shipments)
	}

	// Seed fallback if empty
	if len(shipments) == 0 {
		now := time.Now()
		shipments = []models.Shipment{
			{
				ID:                "shp-001",
				OrgID:             orgID,
				OrderID:           "ord-9821",
				TrackingNumber:    "NX-849204-NG",
				Carrier:           "IN_HOUSE",
				Status:            "IN_TRANSIT",
				SenderName:        "EduSuite Lekki Hub",
				SenderPhone:       "+2348011122233",
				SenderAddress:     "14 Admiralty Way, Lekki Phase 1, Lagos",
				SenderCity:        "Lagos",
				RecipientName:     "Dangote Sugar Refinery",
				RecipientPhone:    "+2348099988877",
				RecipientAddress:  "Plot 1, Commercial Ave, Ikeja, Lagos",
				RecipientCity:     "Lagos",
				WeightKg:          4.5,
				ShippingFee:       3500,
				EstimatedDelivery: now.Add(4 * time.Hour),
				CreatedAt:         now.Add(-2 * time.Hour),
				UpdatedAt:         now,
				Waypoints: []models.Waypoint{
					{ID: "wp-1", ShipmentID: "shp-001", Location: "Lekki Distribution Hub", Status: "PICKED_UP", Notes: "Package verified and sealed", Timestamp: now.Add(-2 * time.Hour)},
					{ID: "wp-2", ShipmentID: "shp-001", Location: "Ozumba Mbadiwe Transit Checkpoint", Status: "IN_TRANSIT", Notes: "Driver en-route to Third Mainland Bridge", Timestamp: now.Add(-45 * time.Minute)},
				},
			},
			{
				ID:                "shp-002",
				OrgID:             orgID,
				OrderID:           "ord-9822",
				TrackingNumber:    "NX-849205-NG",
				Carrier:           "GIGL",
				Status:            "OUT_FOR_DELIVERY",
				SenderName:        "EduSuite Warehouse",
				SenderPhone:       "+2348011122233",
				SenderAddress:     "Ikeja Logistics Depot",
				SenderCity:        "Lagos",
				RecipientName:     "Fidelity Bank Victoria Island",
				RecipientPhone:    "+2348055566677",
				RecipientAddress:  "Ahmadu Bello Way, VI, Lagos",
				RecipientCity:     "Lagos",
				WeightKg:          1.2,
				ShippingFee:       2500,
				EstimatedDelivery: now.Add(1 * time.Hour),
				CreatedAt:         now.Add(-5 * time.Hour),
				UpdatedAt:         now,
			},
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"shipments": shipments,
		"total":     len(shipments),
	})
}

// CreateShipment creates a new waybill package
func (h *LogisticsHandler) CreateShipment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req models.Shipment
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
		return
	}

	if req.ID == "" {
		req.ID = "shp-" + uuid.New().String()[:8]
	}
	if req.TrackingNumber == "" {
		req.TrackingNumber = fmt.Sprintf("NX-%d-NG", time.Now().UnixNano()%1000000)
	}
	if req.Status == "" {
		req.Status = "PENDING"
	}
	req.CreatedAt = time.Now()
	req.UpdatedAt = time.Now()

	if h.DB != nil {
		h.DB.Create(&req)
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"shipment": req,
		"message":  "Shipment created successfully",
	})
}

// GetShipment retrieves a shipment by ID or tracking number
func (h *LogisticsHandler) GetShipment(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")

	var shipment models.Shipment
	if h.DB != nil {
		err := h.DB.Where("id = ? OR tracking_number = ?", id, id).Preload("Waypoints").First(&shipment).Error
		if err == nil {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":  true,
				"shipment": shipment,
			})
			return
		}
	}

	// Fallback response
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"shipment": models.Shipment{
			ID:             id,
			TrackingNumber: id,
			Status:         "IN_TRANSIT",
			SenderName:     "Ofia Business Central Hub",
			RecipientName:  "Customer Destination",
			WeightKg:       2.5,
			ShippingFee:    3000,
			CreatedAt:      time.Now().Add(-3 * time.Hour),
		},
	})
}

// UpdateShipmentStatus updates the status milestone of a package
func (h *LogisticsHandler) UpdateShipmentStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	id := chi.URLParam(r, "id")

	var req struct {
		Status   string  `json:"status"`
		Location string  `json:"location"`
		Notes    string  `json:"notes"`
		Lat      float64 `json:"latitude"`
		Lng      float64 `json:"longitude"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
		return
	}

	if h.DB != nil {
		h.DB.Model(&models.Shipment{}).Where("id = ?", id).Updates(map[string]interface{}{
			"status":     req.Status,
			"updated_at": time.Now(),
		})

		// Add waypoint
		wp := models.Waypoint{
			ID:         "wp-" + uuid.New().String()[:8],
			ShipmentID: id,
			Location:   req.Location,
			Status:     req.Status,
			Notes:      req.Notes,
			Latitude:   req.Lat,
			Longitude:  req.Lng,
			Timestamp:  time.Now(),
		}
		h.DB.Create(&wp)
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Shipment milestone updated",
	})
}

// ListCouriers returns all registered delivery drivers / technicians
func (h *LogisticsHandler) ListCouriers(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var drivers []models.CourierDriver

	if h.DB != nil {
		h.DB.Find(&drivers)
	}

	if len(drivers) == 0 {
		drivers = []models.CourierDriver{
			{ID: "drv-1", Name: "Ibrahim Musa", Phone: "+2348033344455", VehicleType: "MOTORBIKE", PlateNumber: "KJA-482-XA", IsAvailable: true, CurrentLat: 6.4698, CurrentLng: 3.5852, TotalTrips: 142, Rating: 4.9},
			{ID: "drv-2", Name: "Emeka Okafor", Phone: "+2348077788899", VehicleType: "VAN", PlateNumber: "APP-912-LK", IsAvailable: true, CurrentLat: 6.5244, CurrentLng: 3.3792, TotalTrips: 98, Rating: 4.8},
			{ID: "drv-3", Name: "Tunde Bakare", Phone: "+2348022211100", VehicleType: "MOTORBIKE", PlateNumber: "SMK-103-YT", IsAvailable: false, CurrentLat: 6.6018, CurrentLng: 3.3515, TotalTrips: 215, Rating: 5.0},
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":  true,
		"couriers": drivers,
		"total":    len(drivers),
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

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
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

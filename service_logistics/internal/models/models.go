package models

import (
	"time"
)

// Shipment represents an order fulfillment package with waypoints
type Shipment struct {
	ID                string      `gorm:"primaryKey;size:64" json:"id"`
	OrgID             string      `gorm:"index;size:64" json:"org_id"`
	OrderID           string      `gorm:"index;size:64" json:"order_id"`
	TrackingNumber    string      `gorm:"uniqueIndex;size:64" json:"tracking_number"`
	Carrier           string      `gorm:"size:32;default:'IN_HOUSE'" json:"carrier"` // IN_HOUSE, GIGL, SENDBOX, KWIK, DHL
	Status            string      `gorm:"size:32;default:'PENDING'" json:"status"`   // PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, RETURNED, CANCELLED
	CourierDriverID   *string     `gorm:"size:64" json:"courier_driver_id,omitempty"`
	SenderName        string      `gorm:"size:128" json:"sender_name"`
	SenderPhone       string      `gorm:"size:32" json:"sender_phone"`
	SenderAddress     string      `gorm:"type:text" json:"sender_address"`
	SenderCity        string      `gorm:"size:64" json:"sender_city"`
	RecipientName     string      `gorm:"size:128" json:"recipient_name"`
	RecipientPhone    string      `gorm:"size:32" json:"recipient_phone"`
	RecipientAddress  string      `gorm:"type:text" json:"recipient_address"`
	RecipientCity     string      `gorm:"size:64" json:"recipient_city"`
	WeightKg          float64     `gorm:"default:1.0" json:"weight_kg"`
	ShippingFee       float64     `gorm:"default:0" json:"shipping_fee"`
	EstimatedDelivery time.Time   `json:"estimated_delivery"`
	DeliveredAt       *time.Time  `json:"delivered_at,omitempty"`
	Notes             string      `gorm:"type:text" json:"notes,omitempty"`
	Waypoints         []Waypoint  `gorm:"foreignKey:ShipmentID" json:"waypoints,omitempty"`
	CreatedAt         time.Time   `json:"created_at"`
	UpdatedAt         time.Time   `json:"updated_at"`
}

// Waypoint logs geographical milestone progress of a shipment
type Waypoint struct {
	ID         string    `gorm:"primaryKey;size:64" json:"id"`
	ShipmentID string    `gorm:"index;size:64" json:"shipment_id"`
	Location   string    `gorm:"size:128" json:"location"`
	Status     string    `gorm:"size:32" json:"status"`
	Notes      string    `gorm:"type:text" json:"notes"`
	Latitude   float64   `json:"latitude"`
	Longitude  float64   `json:"longitude"`
	Timestamp  time.Time `json:"timestamp"`
}

// CourierDriver represents a fleet driver, field technician or 3rd party rider
type CourierDriver struct {
	ID          string    `gorm:"primaryKey;size:64" json:"id"`
	OrgID       string    `gorm:"index;size:64" json:"org_id"`
	Name        string    `gorm:"size:128" json:"name"`
	Phone       string    `gorm:"size:32" json:"phone"`
	VehicleType string    `gorm:"size:32;default:'MOTORBIKE'" json:"vehicle_type"` // MOTORBIKE, VAN, TRUCK, BICYCLE
	PlateNumber string    `gorm:"size:32" json:"plate_number"`
	IsAvailable bool      `gorm:"default:true" json:"is_available"`
	CurrentLat  float64   `json:"current_lat"`
	CurrentLng  float64   `json:"current_lng"`
	TotalTrips  int       `gorm:"default:0" json:"total_trips"`
	Rating      float64   `gorm:"default:5.0" json:"rating"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// DeliveryZoneRate configures pricing rules per Nigerian regional zone
type DeliveryZoneRate struct {
	ID            string    `gorm:"primaryKey;size:64" json:"id"`
	OrgID         string    `gorm:"index;size:64" json:"org_id"`
	ZoneName      string    `gorm:"size:64" json:"zone_name"` // Lagos Mainland, Lagos Island, Interstate South, Interstate North
	OriginCity    string    `gorm:"size:64;default:'Lagos'" json:"origin_city"`
	DestCity      string    `gorm:"size:64" json:"dest_city"`
	BaseFee       float64   `gorm:"default:2500" json:"base_fee"`
	PerKgFee      float64   `gorm:"default:500" json:"per_kg_fee"`
	EstimatedDays int       `gorm:"default:1" json:"estimated_days"`
	CreatedAt     time.Time `json:"created_at"`
}

// DispatchTicket handles technician on-site appointment dispatch
type DispatchTicket struct {
	ID              string     `gorm:"primaryKey;size:64" json:"id"`
	OrgID           string     `gorm:"index;size:64" json:"org_id"`
	BookingID       string     `gorm:"index;size:64" json:"booking_id"`
	TechnicianID    string     `gorm:"index;size:64" json:"technician_id"`
	CustomerName    string     `gorm:"size:128" json:"customer_name"`
	CustomerPhone   string     `gorm:"size:32" json:"customer_phone"`
	CustomerAddress string     `gorm:"type:text" json:"customer_address"`
	ScheduledTime   time.Time  `json:"scheduled_time"`
	Status          string     `gorm:"size:32;default:'ASSIGNED'" json:"status"` // ASSIGNED, EN_ROUTE, ARRIVED, COMPLETED, CANCELLED
	ProofOfWorkURL  string     `gorm:"type:text" json:"proof_of_work_url,omitempty"`
	CompletedAt     *time.Time `json:"completed_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

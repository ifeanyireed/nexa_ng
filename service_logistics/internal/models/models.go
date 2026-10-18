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
	Status            string      `gorm:"size:32;default:'PENDING'" json:"status"`   // PENDING, ASSIGNED, ACCEPTED, PICKED_UP, IN_TRANSIT, DELIVERED, EXCEPTION, CANCELLED
	Priority          string      `gorm:"size:20;default:'STANDARD'" json:"priority"` // STANDARD, HIGH, URGENT
	CourierDriverID   *string     `gorm:"size:64;index" json:"courier_driver_id,omitempty"`
	SenderName        string      `gorm:"size:128" json:"sender_name"`
	SenderPhone       string      `gorm:"size:32" json:"sender_phone"`
	SenderAddress     string      `gorm:"type:text" json:"sender_address"`
	SenderCity        string      `gorm:"size:64" json:"sender_city"`
	PickupAddress     string      `gorm:"type:text" json:"pickup_address,omitempty"`
	PickupLat         float64     `json:"pickup_lat"`
	PickupLng         float64     `json:"pickup_lng"`
	RecipientName     string      `gorm:"size:128" json:"recipient_name"`
	RecipientPhone    string      `gorm:"size:32" json:"recipient_phone"`
	RecipientAddress  string      `gorm:"type:text" json:"recipient_address"`
	RecipientCity     string      `gorm:"size:64" json:"recipient_city"`
	DropoffAddress    string      `gorm:"type:text" json:"dropoff_address,omitempty"`
	DropoffLat        float64     `json:"dropoff_lat"`
	DropoffLng        float64     `json:"dropoff_lng"`
	ParcelDescription string      `gorm:"type:text" json:"parcel_description,omitempty"`
	WeightKg          float64     `gorm:"default:1.0" json:"weight_kg"`
	ShippingFee       float64     `gorm:"default:0" json:"shipping_fee"`
	DeliveryOTP       string      `gorm:"size:10;default:'8491'" json:"delivery_otp"`
	RecipientSignature string     `gorm:"type:text" json:"recipient_signature,omitempty"`
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
	ID               string    `gorm:"primaryKey;size:64" json:"id"`
	OrgID            string    `gorm:"index;size:64" json:"org_id"`
	UserID           string    `gorm:"size:64;index" json:"user_id,omitempty"`
	Name             string    `gorm:"size:128" json:"name"`
	Phone            string    `gorm:"size:32;index" json:"phone"`
	Email            string    `gorm:"size:128" json:"email"`
	Address          string    `gorm:"type:text" json:"address"`
	EmergencyContact string    `gorm:"size:128" json:"emergency_contact"`
	PIN              string    `gorm:"size:64;default:'1234'" json:"-"`
	VehicleType      string    `gorm:"size:32;default:'MOTORBIKE'" json:"vehicle_type"` // MOTORBIKE, VAN, TRUCK, BICYCLE
	PlateNumber      string    `gorm:"size:32" json:"plate_number"`
	Status           string    `gorm:"size:32;default:'AVAILABLE'" json:"status"`       // AVAILABLE, BUSY, OFFLINE, ON_TRIP
	IsAvailable      bool      `gorm:"default:true" json:"is_available"`
	CurrentLat       float64   `json:"current_lat"`
	CurrentLng       float64   `json:"current_lng"`
	Heading          float64   `json:"heading"`
	Speed            float64   `json:"speed"`
	BatteryPct       int       `gorm:"default:100" json:"battery_pct"`
	CurrentZone      string    `gorm:"size:64;default:'Lagos Central'" json:"current_zone"`
	ActiveJobs       int       `gorm:"default:0" json:"active_jobs"`
	TotalTrips       int       `gorm:"default:0" json:"total_trips"`
	Rating           float64   `gorm:"default:5.0" json:"rating"`
	LastPingAt       time.Time `json:"last_ping_at"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// CourierPayoutAccount holds verified Nigerian bank accounts for courier payouts
type CourierPayoutAccount struct {
	ID            string    `gorm:"primaryKey;size:64" json:"id"`
	OrgID         string    `gorm:"index;size:64" json:"org_id"`
	CourierID     string    `gorm:"index;size:64" json:"courier_id"`
	BankName      string    `gorm:"size:128" json:"bank_name"`
	BankCode      string    `gorm:"size:32" json:"bank_code"`
	AccountNumber string    `gorm:"size:32" json:"account_number"`
	AccountName   string    `gorm:"size:128" json:"account_name"`
	IsPrimary     bool      `gorm:"default:false" json:"is_primary"`
	IsVerified    bool      `gorm:"default:true" json:"is_verified"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
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

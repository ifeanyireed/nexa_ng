package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID        string    `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Email     string    `gorm:"uniqueIndex;type:varchar(191);not null" json:"email"`
	Password  string    `gorm:"type:varchar(191);not null" json:"-"`
	Name      string    `gorm:"type:varchar(191)" json:"name"`
	Role      string    `gorm:"type:varchar(50);default:'CLIENT'" json:"role"`
	IsOnline  bool      `gorm:"default:false" json:"is_online"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	ProProfile       *ProProfile    `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"pro_profile,omitempty"`
	Bookings         []Booking      `gorm:"foreignKey:ClientID;constraint:OnDelete:CASCADE" json:"bookings,omitempty"`
	Orders           []Order        `gorm:"foreignKey:ClientID;constraint:OnDelete:CASCADE" json:"orders,omitempty"`
	Wallet           *Wallet        `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"wallet,omitempty"`
	SentMessages     []Message      `gorm:"foreignKey:SenderID;constraint:OnDelete:CASCADE" json:"sent_messages,omitempty"`
	ReceivedMessages []Message      `gorm:"foreignKey:ReceiverID;constraint:OnDelete:CASCADE" json:"received_messages,omitempty"`
	Notifications    []Notification `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"notifications,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = "usr_" + uuid.New().String()[:12]
	}
	return nil
}

type ProProfile struct {
	ID                    string     `gorm:"primaryKey;type:varchar(191)" json:"id"`
	UserID                string     `gorm:"uniqueIndex;type:varchar(191);not null" json:"user_id"`
	User                  *User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	BusinessName          string     `gorm:"type:varchar(191)" json:"business_name"`
	Slug                  string     `gorm:"uniqueIndex;type:varchar(191)" json:"slug"`
	Bio                   string     `gorm:"type:text" json:"bio"`
	HourlyRate            float64    `gorm:"default:0" json:"hourly_rate"`
	Specialties           string     `gorm:"type:varchar(255)" json:"specialties"`
	Niche                 string     `gorm:"type:varchar(100)" json:"niche"`
	SubService            string     `gorm:"type:varchar(100)" json:"sub_service"`
	SpecialtyLevel        string     `gorm:"type:varchar(100)" json:"specialty_level"`
	City                  string     `gorm:"type:varchar(100)" json:"city"`
	Area                  string     `gorm:"type:varchar(100)" json:"area"`
	Phone                 string     `gorm:"type:varchar(100)" json:"phone"`
	Whatsapp              string     `gorm:"type:varchar(100)" json:"whatsapp"`
	BusinessEmail         string     `gorm:"type:varchar(191)" json:"business_email"`
	NIN                   string     `gorm:"type:varchar(100);column:nin" json:"nin"`
	Plan                  string     `gorm:"type:varchar(50);default:'basic'" json:"plan"`
	SubscriptionExpiresAt *time.Time `json:"subscription_expires_at"`
	Verified              bool       `gorm:"default:false" json:"verified"`
	AcceptsPOS            bool       `gorm:"default:false;column:accepts_pos" json:"accepts_pos"`
	HomeDelivery          bool       `gorm:"default:false;column:home_delivery" json:"home_delivery"`
	Rating                float64    `gorm:"default:0" json:"rating"`
	ProfileViews          int        `gorm:"default:0;column:profile_views" json:"profile_views"`
	LogoURL               string     `gorm:"type:varchar(500);column:logo_url" json:"logo_url"`
	Catalog               string     `gorm:"type:text" json:"catalog"`
	Availability          string     `gorm:"type:text" json:"availability"`

	Services []Service `gorm:"foreignKey:ProProfileID;constraint:OnDelete:CASCADE" json:"services,omitempty"`
	Products []Product `gorm:"foreignKey:ProProfileID;constraint:OnDelete:CASCADE" json:"products,omitempty"`
	Articles []Article `gorm:"foreignKey:ProProfileID;constraint:OnDelete:CASCADE" json:"articles,omitempty"`
	Bookings []Booking `gorm:"foreignKey:ProProfileID;constraint:OnDelete:CASCADE" json:"bookings,omitempty"`
}

func (p *ProProfile) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = "pro_" + uuid.New().String()[:12]
	}
	return nil
}

type Service struct {
	ID           string      `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Name         string      `gorm:"type:varchar(191);not null" json:"name"`
	Description  string      `gorm:"type:text" json:"description"`
	Price        float64     `gorm:"not null;default:0" json:"price"`
	ProProfileID string      `gorm:"type:varchar(191);not null" json:"pro_profile_id"`
	ProProfile   *ProProfile `gorm:"foreignKey:ProProfileID" json:"pro_profile,omitempty"`
}

func (s *Service) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = "srv_" + uuid.New().String()[:12]
	}
	return nil
}

type Article struct {
	ID           string      `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Title        string      `gorm:"type:varchar(255);not null" json:"title"`
	Content      string      `gorm:"type:text;not null" json:"content"`
	Image        string      `gorm:"type:varchar(500)" json:"image"`
	Niche        string      `gorm:"type:varchar(100);not null" json:"niche"`
	ProProfileID string      `gorm:"type:varchar(191);not null" json:"pro_profile_id"`
	ProProfile   *ProProfile `gorm:"foreignKey:ProProfileID" json:"pro_profile,omitempty"`
	CreatedAt    time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
}

func (a *Article) BeforeCreate(tx *gorm.DB) error {
	if a.ID == "" {
		a.ID = "art_" + uuid.New().String()[:12]
	}
	return nil
}

type Product struct {
	ID           string      `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Name         string      `gorm:"type:varchar(191);not null" json:"name"`
	Description  string      `gorm:"type:text" json:"description"`
	Price        float64     `gorm:"not null;default:0" json:"price"`
	Image        string      `gorm:"type:varchar(500)" json:"image"`
	ProProfileID string      `gorm:"type:varchar(191);not null" json:"pro_profile_id"`
	ProProfile   *ProProfile `gorm:"foreignKey:ProProfileID" json:"pro_profile,omitempty"`
	Orders       []Order     `gorm:"foreignKey:ProductID;constraint:OnDelete:CASCADE" json:"orders,omitempty"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == "" {
		p.ID = "prd_" + uuid.New().String()[:12]
	}
	return nil
}

type Booking struct {
	ID           string      `gorm:"primaryKey;type:varchar(191)" json:"id"`
	ClientID     string      `gorm:"type:varchar(191);not null" json:"client_id"`
	Client       *User       `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	ProProfileID string      `gorm:"type:varchar(191);not null" json:"pro_profile_id"`
	ProProfile   *ProProfile `gorm:"foreignKey:ProProfileID" json:"pro_profile,omitempty"`
	ServiceName  string      `gorm:"type:varchar(191)" json:"service_name"`
	Amount       float64     `gorm:"default:0" json:"amount"`
	Type         string      `gorm:"type:varchar(50);default:'STANDARD'" json:"type"`
	Status       string      `gorm:"type:varchar(50);default:'PENDING'" json:"status"`
	ScheduledAt  time.Time   `json:"scheduled_at"`
	CreatedAt    time.Time   `gorm:"autoCreateTime" json:"created_at"`
}

func (b *Booking) BeforeCreate(tx *gorm.DB) error {
	if b.ID == "" {
		b.ID = "bk_" + uuid.New().String()[:12]
	}
	return nil
}

type Wallet struct {
	ID           string        `gorm:"primaryKey;type:varchar(191)" json:"id"`
	UserID       string        `gorm:"uniqueIndex;type:varchar(191);not null" json:"user_id"`
	User         *User         `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Balance      float64       `gorm:"default:0" json:"balance"`
	Transactions []Transaction `gorm:"foreignKey:WalletID;constraint:OnDelete:CASCADE" json:"transactions,omitempty"`
}

func (w *Wallet) BeforeCreate(tx *gorm.DB) error {
	if w.ID == "" {
		w.ID = "wal_" + uuid.New().String()[:12]
	}
	return nil
}

type Transaction struct {
	ID        string    `gorm:"primaryKey;type:varchar(191)" json:"id"`
	WalletID  string    `gorm:"type:varchar(191);not null" json:"wallet_id"`
	Wallet    *Wallet   `gorm:"foreignKey:WalletID" json:"wallet,omitempty"`
	Amount    float64   `gorm:"not null" json:"amount"`
	Type      string    `gorm:"type:varchar(50);not null" json:"type"`
	Status    string    `gorm:"type:varchar(50);not null" json:"status"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = "txn_" + uuid.New().String()[:12]
	}
	return nil
}

type Order struct {
	ID              string    `gorm:"primaryKey;type:varchar(191)" json:"id"`
	ClientID        string    `gorm:"type:varchar(191);not null" json:"client_id"`
	Client          *User     `gorm:"foreignKey:ClientID" json:"client,omitempty"`
	ProductID       string    `gorm:"type:varchar(191);not null" json:"product_id"`
	Product         *Product  `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Quantity        int       `gorm:"default:1" json:"quantity"`
	Amount          float64   `gorm:"not null;default:0" json:"amount"`
	Status          string    `gorm:"type:varchar(50);default:'PENDING'" json:"status"`
	ShippingAddress string    `gorm:"type:text" json:"shipping_address"`
	Phone           string    `gorm:"type:varchar(100)" json:"phone"`
	CreatedAt       time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Delivery *Delivery `gorm:"foreignKey:OrderID;constraint:OnDelete:CASCADE" json:"delivery,omitempty"`
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == "" {
		o.ID = "ord_" + uuid.New().String()[:12]
	}
	return nil
}

type Delivery struct {
	ID                string     `gorm:"primaryKey;type:varchar(191)" json:"id"`
	OrderID           string     `gorm:"uniqueIndex;type:varchar(191);not null" json:"order_id"`
	Order             *Order     `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Status            string     `gorm:"type:varchar(50);default:'PENDING'" json:"status"`
	TrackingNumber    string     `gorm:"type:varchar(191)" json:"tracking_number"`
	Carrier           string     `gorm:"type:varchar(100)" json:"carrier"`
	EstimatedDelivery *time.Time `json:"estimated_delivery"`
	UpdatedAt         time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (d *Delivery) BeforeCreate(tx *gorm.DB) error {
	if d.ID == "" {
		d.ID = "dlv_" + uuid.New().String()[:12]
	}
	return nil
}

type Message struct {
	ID         string    `gorm:"primaryKey;type:varchar(191)" json:"id"`
	SenderID   string    `gorm:"type:varchar(191);not null" json:"sender_id"`
	Sender     *User     `gorm:"foreignKey:SenderID" json:"sender,omitempty"`
	ReceiverID string    `gorm:"type:varchar(191);not null" json:"receiver_id"`
	Receiver   *User     `gorm:"foreignKey:ReceiverID" json:"receiver,omitempty"`
	Text       string    `gorm:"type:text;not null" json:"text"`
	IsRead     bool      `gorm:"default:false;column:is_read" json:"is_read"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = "msg_" + uuid.New().String()[:12]
	}
	return nil
}

type Notification struct {
	ID        string    `gorm:"primaryKey;type:varchar(191)" json:"id"`
	UserID    string    `gorm:"type:varchar(191);not null" json:"user_id"`
	User      *User     `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	Type      string    `gorm:"type:varchar(50);default:'SYSTEM'" json:"type"`
	IsRead    bool      `gorm:"default:false;column:is_read" json:"is_read"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (n *Notification) BeforeCreate(tx *gorm.DB) error {
	if n.ID == "" {
		n.ID = "notif_" + uuid.New().String()[:12]
	}
	return nil
}

type LayoutTemplate struct {
	ID           string    `gorm:"primaryKey;type:varchar(191)" json:"id"`
	Key          string    `gorm:"uniqueIndex;type:varchar(100);not null" json:"key"`
	Name         string    `gorm:"type:varchar(191);not null" json:"name"`
	Badge        string    `gorm:"type:varchar(100);not null" json:"badge"`
	Description  string    `gorm:"type:text" json:"description"`
	Icon         string    `gorm:"type:varchar(100)" json:"icon"`
	ComponentKey string    `gorm:"type:varchar(100)" json:"component_key"`
	ConfigJSON   string    `gorm:"type:text;column:config_json" json:"config_json"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (l *LayoutTemplate) BeforeCreate(tx *gorm.DB) error {
	if l.ID == "" {
		l.ID = "lay_" + uuid.New().String()[:12]
	}
	return nil
}

type SubdomainLayout struct {
	ID            string          `gorm:"primaryKey;type:varchar(191)" json:"id"`
	SubdomainSlug string          `gorm:"uniqueIndex;type:varchar(191);not null;column:subdomain_slug" json:"subdomain_slug"`
	LayoutKey     string          `gorm:"type:varchar(100);not null;column:layout_key" json:"layout_key"`
	Layout        *LayoutTemplate `gorm:"foreignKey:LayoutKey;references:Key" json:"layout,omitempty"`
	VerticalType  string          `gorm:"type:varchar(50);default:'SUBCATEGORY_NICHE';column:vertical_type" json:"vertical_type"`
	CustomTitle   string          `gorm:"type:varchar(255);column:custom_title" json:"custom_title"`
	CustomSubtitle string         `gorm:"type:varchar(500);column:custom_subtitle" json:"custom_subtitle"`
	ThemeColor    string          `gorm:"type:varchar(100);column:theme_color" json:"theme_color"`
	IsActive      bool            `gorm:"default:true;column:is_active" json:"is_active"`
	CreatedAt     time.Time       `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time       `gorm:"autoUpdateTime" json:"updated_at"`
}

func (s *SubdomainLayout) BeforeCreate(tx *gorm.DB) error {
	if s.ID == "" {
		s.ID = "sublay_" + uuid.New().String()[:12]
	}
	return nil
}


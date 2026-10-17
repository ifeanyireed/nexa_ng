package models

import (
	"time"
)

type TenantInfrastructure struct {
	TenantSlug      string    `gorm:"primaryKey;size:191" json:"tenant_slug"`
	DatabaseURL     string    `gorm:"type:text" json:"database_url"`
	CloudinaryURL   string    `gorm:"type:text" json:"cloudinary_url"`
	IsCustomDB      bool      `gorm:"default:false" json:"is_custom_db"`
	IsCustomStorage bool      `gorm:"default:false" json:"is_custom_storage"`
	MigrationStatus string    `gorm:"size:50;default:'COMPLETED'" json:"migration_status"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func (TenantInfrastructure) TableName() string {
	return "tenant_infrastructures"
}

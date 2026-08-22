package handlers

import (
	"database/sql"

	"gorm.io/gorm"
)

var DB *gorm.DB
var db *sql.DB

func SetDB(database *sql.DB) {
	db = database
}

func SetGormDB(gormDB *gorm.DB) {
	DB = gormDB
	if gormDB != nil {
		sqlDB, err := gormDB.DB()
		if err == nil {
			db = sqlDB
		}
	}
}

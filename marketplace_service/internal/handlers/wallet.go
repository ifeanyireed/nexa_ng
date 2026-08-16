package handlers

import (
	"encoding/json"
	"net/http"
	internalDB "nexa/marketplace_service/internal/db"
	"nexa/marketplace_service/internal/middleware"
	"nexa/marketplace_service/internal/models"
)

func GetWallet(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var wallet models.Wallet
	err := internalDB.DB.Preload("Transactions").Where("user_id = ?", userID).First(&wallet).Error
	if err != nil {
		wallet = models.Wallet{
			UserID:  userID,
			Balance: 0,
		}
		if err := internalDB.DB.Create(&wallet).Error; err != nil {
			http.Error(w, "error creating wallet", http.StatusInternalServerError)
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(wallet)
}

type TransactionRequest struct {
	Amount float64 `json:"amount"`
}

func Deposit(w http.ResponseWriter, r *http.Request) {
	if internalDB.DB == nil {
		http.Error(w, "database unavailable", http.StatusServiceUnavailable)
		return
	}

	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	var wallet models.Wallet
	if err := internalDB.DB.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
		http.Error(w, "wallet not found", http.StatusNotFound)
		return
	}

	wallet.Balance += req.Amount
	if err := internalDB.DB.Save(&wallet).Error; err != nil {
		http.Error(w, "error updating balance", http.StatusInternalServerError)
		return
	}

	transaction := models.Transaction{
		WalletID: wallet.ID,
		Amount:   req.Amount,
		Type:     "DEPOSIT",
		Status:   "COMPLETED",
	}

	if err := internalDB.DB.Create(&transaction).Error; err != nil {
		http.Error(w, "error creating transaction", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transaction)
}

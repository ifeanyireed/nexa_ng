package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/prisma/db"
)

func GetWallet(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	wallet, err := internalDB.Client.Wallet.UpsertOne(
		db.Wallet.UserID.Equals(userID),
	).Create(
		db.Wallet.User.Link(db.User.ID.Equals(userID)),
		db.Wallet.Balance.Set(0),
	).Update().Exec(context.Background())

	if err != nil {
		http.Error(w, "error fetching wallet", http.StatusInternalServerError)
		return
	}

	walletWithTransactions, err := internalDB.Client.Wallet.FindUnique(
		db.Wallet.ID.Equals(wallet.ID),
	).With(
		db.Wallet.Transactions.Fetch(),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error fetching transactions", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(walletWithTransactions)
}

type TransactionRequest struct {
	Amount float64 `json:"amount"`
}

func Deposit(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(middleware.UserIDKey).(string)

	var req TransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	wallet, err := internalDB.Client.Wallet.FindUnique(
		db.Wallet.UserID.Equals(userID),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "wallet not found", http.StatusNotFound)
		return
	}

	newBalance := wallet.Balance + req.Amount
	_, err = internalDB.Client.Wallet.FindUnique(
		db.Wallet.ID.Equals(wallet.ID),
	).Update(
		db.Wallet.Balance.Set(newBalance),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error updating balance", http.StatusInternalServerError)
		return
	}

	transaction, err := internalDB.Client.Transaction.CreateOne(
		db.Transaction.Wallet.Link(db.Wallet.ID.Equals(wallet.ID)),
		db.Transaction.Amount.Set(req.Amount),
		db.Transaction.Type.Set("DEPOSIT"),
		db.Transaction.Status.Set("COMPLETED"),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "error creating transaction", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(transaction)
}

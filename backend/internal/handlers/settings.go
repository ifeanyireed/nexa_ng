package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/prisma/db"
	"golang.org/x/crypto/bcrypt"
)

type UpdateSettingsRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func UpdateUserSettings(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdateSettingsRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Name == "" {
		http.Error(w, "name and email are required", http.StatusBadRequest)
		return
	}

	// Update user
	user, err := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Name.Set(req.Name),
		db.User.Email.Set(req.Email),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "could not update settings", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

type UpdatePasswordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func UpdateUserPassword(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.CurrentPassword == "" || req.NewPassword == "" {
		http.Error(w, "current and new passwords are required", http.StatusBadRequest)
		return
	}

	user, err := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Exec(context.Background())
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		http.Error(w, "incorrect current password", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "encryption error", http.StatusInternalServerError)
		return
	}

	_, err = internalDB.Client.User.FindUnique(
		db.User.ID.Equals(userID),
	).Update(
		db.User.Password.Set(string(hashedPassword)),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "could not update password", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"password updated successfully"}`))
}

func DeleteUserAccount(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	ctx := context.Background()

	// Cascade delete dependent entities safely using FindMany().Delete() to prevent "record not found" errors

	// 1. Delete notifications
	_, _ = internalDB.Client.Notification.FindMany(
		db.Notification.UserID.Equals(userID),
	).Delete().Exec(ctx)

	// 2. Delete messages (sent and received)
	_, _ = internalDB.Client.Message.FindMany(
		db.Message.SenderID.Equals(userID),
	).Delete().Exec(ctx)
	_, _ = internalDB.Client.Message.FindMany(
		db.Message.ReceiverID.Equals(userID),
	).Delete().Exec(ctx)

	// 3. Delete transactions & wallets
	wallet, err := internalDB.Client.Wallet.FindUnique(
		db.Wallet.UserID.Equals(userID),
	).Exec(ctx)
	if err == nil && wallet != nil {
		_, _ = internalDB.Client.Transaction.FindMany(
			db.Transaction.WalletID.Equals(wallet.ID),
		).Delete().Exec(ctx)

		_, _ = internalDB.Client.Wallet.FindMany(
			db.Wallet.UserID.Equals(userID),
		).Delete().Exec(ctx)
	}

	// 4. Delete bookings (as client)
	_, _ = internalDB.Client.Booking.FindMany(
		db.Booking.ClientID.Equals(userID),
	).Delete().Exec(ctx)

	// 5. Delete orders (as client) & deliveries
	orders, err := internalDB.Client.Order.FindMany(
		db.Order.ClientID.Equals(userID),
	).Exec(ctx)
	if err == nil {
		for _, order := range orders {
			_, _ = internalDB.Client.Delivery.FindMany(
				db.Delivery.OrderID.Equals(order.ID),
			).Delete().Exec(ctx)
		}
		_, _ = internalDB.Client.Order.FindMany(
			db.Order.ClientID.Equals(userID),
		).Delete().Exec(ctx)
	}

	// 6. Delete pro profile dependencies if it exists
	proProfile, err := internalDB.Client.ProProfile.FindUnique(
		db.ProProfile.UserID.Equals(userID),
	).Exec(ctx)
	if err == nil && proProfile != nil {
		// Delete services
		_, _ = internalDB.Client.Service.FindMany(
			db.Service.ProProfileID.Equals(proProfile.ID),
		).Delete().Exec(ctx)

		// Delete articles
		_, _ = internalDB.Client.Article.FindMany(
			db.Article.ProProfileID.Equals(proProfile.ID),
		).Delete().Exec(ctx)

		// Delete products & orders referencing those products
		products, err := internalDB.Client.Product.FindMany(
			db.Product.ProProfileID.Equals(proProfile.ID),
		).Exec(ctx)
		if err == nil {
			for _, product := range products {
				// Delete orders referencing product
				_, _ = internalDB.Client.Order.FindMany(
					db.Order.ProductID.Equals(product.ID),
				).Delete().Exec(ctx)
			}
			_, _ = internalDB.Client.Product.FindMany(
				db.Product.ProProfileID.Equals(proProfile.ID),
			).Delete().Exec(ctx)
		}

		// Delete bookings (as pro)
		_, _ = internalDB.Client.Booking.FindMany(
			db.Booking.ProProfileID.Equals(proProfile.ID),
		).Delete().Exec(ctx)

		// Delete pro profile
		_, _ = internalDB.Client.ProProfile.FindMany(
			db.ProProfile.UserID.Equals(userID),
		).Delete().Exec(ctx)
	}

	// 7. Finally delete the user
	_, err = internalDB.Client.User.FindMany(
		db.User.ID.Equals(userID),
	).Delete().Exec(ctx)

	if err != nil {
		http.Error(w, "could not delete user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"account deleted successfully"}`))
}

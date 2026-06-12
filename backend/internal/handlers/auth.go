package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	internalDB "nexa/backend/internal/db"
	"nexa/backend/internal/middleware"
	"nexa/backend/prisma/db"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var jwtSecret = []byte(os.Getenv("JWT_SECRET"))

type SignupRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
	Role     string `json:"role"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserResponse struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
	Role  string `json:"role"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  UserResponse `json:"user"`
}

func Signup(w http.ResponseWriter, r *http.Request) {
	var req SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	if req.Role == "" {
		req.Role = "CLIENT"
	}

	user, err := internalDB.Client.User.CreateOne(
		db.User.Email.Set(req.Email),
		db.User.Password.Set(string(hashedPassword)),
		db.User.Role.Set(req.Role),
		db.User.Name.Set(req.Name),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "could not create user", http.StatusConflict)
		return
	}

	token, err := createToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}

	name, _ := user.Name()
	resp := AuthResponse{
		Token: token,
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  name,
			Role:  user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	user, err := internalDB.Client.User.FindUnique(
		db.User.Email.Equals(req.Email),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := createToken(user.ID, user.Role)
	if err != nil {
		http.Error(w, "token error", http.StatusInternalServerError)
		return
	}

	name, _ := user.Name()
	resp := AuthResponse{
		Token: token,
		User: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  name,
			Role:  user.Role,
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func GetMe(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(string)
	if !ok {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := internalDB.Client.User.FindUnique(
		db.User.ID.Equals(userID),
	).With(
		db.User.ProProfile.Fetch(),
	).Exec(context.Background())

	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	name, _ := user.Name()
	
	// Create a response type that includes the pro profile if needed
	type ExtendedUserResponse struct {
		UserResponse
		ProProfile *db.ProProfileModel `json:"pro_profile,omitempty"`
	}

	resp := ExtendedUserResponse{
		UserResponse: UserResponse{
			ID:    user.ID,
			Email: user.Email,
			Name:  name,
			Role:  user.Role,
		},
	}

	if proProfile, ok := user.ProProfile(); ok {
		resp.ProProfile = proProfile
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

func createToken(userID string, role string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})

	return token.SignedString(jwtSecret)
}

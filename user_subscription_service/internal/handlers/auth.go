package handlers

import (
	"encoding/json"
	"net/http"
	"os"
	"time"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"nexa/user_subscription_service/internal/middleware"
	"nexa/user_subscription_service/internal/models"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

type RegisterRequest struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	Name         string `json:"name"`
	BusinessName string `json:"business_name"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
	OrgID string       `json:"org_id,omitempty"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error": "Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	user := models.User{
		ID:        uuid.New().String(),
		Email:     req.Email,
		Password:  string(hashedPassword),
		Name:      req.Name,
		Role:      models.RoleTenantOwner,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if h.db != nil {
		if err := h.db.Create(&user).Error; err != nil {
			http.Error(w, `{"error": "User with this email already exists"}`, http.StatusConflict)
			return
		}

		// Auto-create default organization workspace
		orgName := req.BusinessName
		if orgName == "" {
			orgName = req.Name + "'s Organization"
		}

		org := models.Organization{
			ID:           uuid.New().String(),
			Name:         orgName,
			Slug:         uuid.New().String()[:8],
			OwnerID:      user.ID,
			PlanTier:     models.PlanFreeTrial,
			BillingCycle: "MONTHLY",
			Status:       "ACTIVE",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		h.db.Create(&org)

		// Create workspace membership
		member := models.WorkspaceMember{
			ID:             uuid.New().String(),
			OrganizationID: org.ID,
			UserID:         user.ID,
			Role:           models.RoleTenantOwner,
			CreatedAt:      time.Now(),
		}
		h.db.Create(&member)

		// Create subscription entry
		sub := models.Subscription{
			ID:                 uuid.New().String(),
			OrganizationID:     org.ID,
			PlanTier:           models.PlanFreeTrial,
			Status:             "ACTIVE",
			CurrentPeriodStart: time.Now(),
			CurrentPeriodEnd:   time.Now().AddDate(0, 0, 14), // 14-day free trial
			CreatedAt:          time.Now(),
			UpdatedAt:          time.Now(),
		}
		h.db.Create(&sub)
	}

	token := generateToken(user.ID, user.Email, user.Role, "")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{
		Token: token,
		User:  &user,
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	var user models.User
	if h.db != nil {
		if err := h.db.Preload("Organizations").First(&user, "email = ?", req.Email).Error; err != nil {
			http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
			return
		}
	} else {
		// Mock offline login for development testing
		user = models.User{
			ID:    "mock-user-1",
			Email: req.Email,
			Name:  "Test User",
			Role:  models.RoleTenantOwner,
		}
	}

	var defaultOrgID string
	if len(user.Organizations) > 0 {
		defaultOrgID = user.Organizations[0].ID
	}

	token := generateToken(user.ID, user.Email, user.Role, defaultOrgID)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Token: token,
		User:  &user,
		OrgID: defaultOrgID,
	})
}

func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(middleware.UserContextKey).(*middleware.JWTClaims)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var user models.User
	if h.db != nil {
		h.db.Preload("Organizations").Preload("WorkspaceMembers.Organization").First(&user, "id = ?", claims.UserID)
	} else {
		user = models.User{
			ID:    claims.UserID,
			Email: claims.Email,
			Name:  "Mock Administrator",
			Role:  claims.Role,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func generateToken(userID, email string, role models.Role, orgID string) string {
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super_secret_jwt_key_for_nexa_gtm_engine_2026"
	}

	claims := middleware.JWTClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		OrgID:  orgID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * 7 * time.Hour)), // 7 days
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(jwtSecret))
	return tokenString
}

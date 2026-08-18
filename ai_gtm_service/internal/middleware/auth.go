package middleware

import (
	"context"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"

	"nexa/ai_gtm_service/internal/models"
)

type contextKey string

const (
	UserContextKey contextKey = "user_claims"
	OrgContextKey  contextKey = "org_id"
)

type JWTClaims struct {
	UserID string      `json:"user_id"`
	Email  string      `json:"email"`
	Name   string      `json:"name"`
	Role   models.Role `json:"role"`
	OrgID  string      `json:"org_id,omitempty"`
	jwt.RegisteredClaims
}

func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "nexa-jwt-secret-key-production-2026"
	}
	return []byte(secret)
}

// GenerateToken generates a signed HS256 JWT valid for 7 days
func GenerateToken(user *models.User, orgID string) (string, error) {
	claims := JWTClaims{
		UserID: user.ID,
		Email:  user.Email,
		Name:   user.Name,
		Role:   user.Role,
		OrgID:  orgID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "ofia-ai-auth",
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(GetJWTSecret())
}

// ValidateToken parses and verifies a JWT string
func ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return GetJWTSecret(), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}

	claims, ok := token.Claims.(*JWTClaims)
	if !ok {
		return nil, errors.New("failed to parse token claims")
	}

	return claims, nil
}

// AuthMiddleware enforces valid JWT Bearer authentication
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error": "Invalid authorization format. Expected 'Bearer <token>'"}`, http.StatusUnauthorized)
			return
		}

		claims, err := ValidateToken(parts[1])
		if err != nil {
			http.Error(w, `{"error": "Invalid or expired authorization token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		if claims.OrgID != "" {
			ctx = context.WithValue(ctx, OrgContextKey, claims.OrgID)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// OptionalAuthMiddleware extracts JWT claims if present, without rejecting unauthenticated requests
func OptionalAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			parts := strings.Split(authHeader, " ")
			if len(parts) == 2 && parts[0] == "Bearer" {
				claims, err := ValidateToken(parts[1])
				if err == nil {
					ctx := context.WithValue(r.Context(), UserContextKey, claims)
					if claims.OrgID != "" {
						ctx = context.WithValue(ctx, OrgContextKey, claims.OrgID)
					}
					next.ServeHTTP(w, r.WithContext(ctx))
					return
				}
			}
		}
		next.ServeHTTP(w, r)
	})
}

// RequireRole enforces specific RBAC roles (SUPER_ADMIN always has full access)
func RequireRole(allowedRoles ...models.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*JWTClaims)
			if !ok {
				http.Error(w, `{"error": "Unauthorized: Authentication required"}`, http.StatusUnauthorized)
				return
			}

			// SUPER_ADMIN has global root privileges
			if claims.Role == models.RoleSuperAdmin {
				next.ServeHTTP(w, r)
				return
			}

			hasRole := false
			for _, role := range allowedRoles {
				if claims.Role == role {
					hasRole = true
					break
				}
			}

			if !hasRole {
				http.Error(w, `{"error": "Forbidden: Insufficient role permissions"}`, http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireOrgAccess validates that the user belongs to the requested orgId or is SUPER_ADMIN
func RequireOrgAccess(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(UserContextKey).(*JWTClaims)
		if !ok {
			http.Error(w, `{"error": "Unauthorized: Authentication required"}`, http.StatusUnauthorized)
			return
		}

		// SUPER_ADMIN can inspect any tenant
		if claims.Role == models.RoleSuperAdmin {
			next.ServeHTTP(w, r)
			return
		}

		targetOrgID := chi.URLParam(r, "orgId")
		if targetOrgID != "" && claims.OrgID != "" && claims.OrgID != targetOrgID {
			http.Error(w, `{"error": "Forbidden: Access denied to foreign workspace"}`, http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext retrieves authenticated claims from request context
func GetUserFromContext(r *http.Request) (*JWTClaims, bool) {
	claims, ok := r.Context().Value(UserContextKey).(*JWTClaims)
	return claims, ok
}

package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"
	"github.com/golang-jwt/jwt/v5"
	"nexa/user_subscription_service/internal/models"
)

type contextKey string

const (
	UserContextKey contextKey = "user_claims"
	OrgContextKey  contextKey = "org_id"
)

type JWTClaims struct {
	UserID string      `json:"user_id"`
	Email  string      `json:"email"`
	Role   models.Role `json:"role"`
	OrgID  string      `json:"org_id,omitempty"`
	jwt.RegisteredClaims
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "Authorization header missing"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			http.Error(w, `{"error": "Invalid authorization token format"}`, http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			jwtSecret = "super_secret_jwt_key_for_nexa_gtm_engine_2026"
		}

		token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			http.Error(w, `{"error": "Invalid or expired token"}`, http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(*JWTClaims)
		if !ok {
			http.Error(w, `{"error": "Failed to parse token claims"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		if claims.OrgID != "" {
			ctx = context.WithValue(ctx, OrgContextKey, claims.OrgID)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequireRole enforces specific RBAC roles
func RequireRole(allowedRoles ...models.Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			claims, ok := r.Context().Value(UserContextKey).(*JWTClaims)
			if !ok {
				http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
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
				http.Error(w, `{"error": "Forbidden: insufficient permissions"}`, http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"nexa/ai_gtm_service/internal/middleware"
	"nexa/ai_gtm_service/internal/models"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

type RegisterRequest struct {
	Email        string      `json:"email"`
	Password     string      `json:"password"`
	Name         string      `json:"name"`
	BusinessName string      `json:"business_name"`
	Role         models.Role `json:"role,omitempty"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type InviteUserRequest struct {
	Email    string      `json:"email"`
	Name     string      `json:"name"`
	Role     models.Role `json:"role"`
	Title    string      `json:"title,omitempty"`
	Password string      `json:"password,omitempty"`
}

type UpdateRoleRequest struct {
	Role models.Role `json:"role"`
}

type AuthResponse struct {
	Token        string               `json:"token"`
	User         *models.User         `json:"user"`
	OrgID        string               `json:"org_id"`
	Organization *models.Organization `json:"organization,omitempty"`
}

// Register creates a new user, organization, workspace membership and issues JWT
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		http.Error(w, `{"error": "Email and password are required"}`, http.StatusBadRequest)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error": "Failed to hash password"}`, http.StatusInternalServerError)
		return
	}

	assignedRole := req.Role
	if assignedRole == "" {
		assignedRole = models.RoleTenantOwner
	}

	user := models.User{
		ID:        uuid.New().String(),
		Email:     req.Email,
		Password:  string(hashedPassword),
		Name:      req.Name,
		Role:      assignedRole,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	var org models.Organization
	if h.db != nil {
		var existing models.User
		if err := h.db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
			http.Error(w, `{"error": "User with this email already exists"}`, http.StatusConflict)
			return
		}

		if err := h.db.Create(&user).Error; err != nil {
			http.Error(w, `{"error": "Failed to create user"}`, http.StatusInternalServerError)
			return
		}

		orgName := req.BusinessName
		if orgName == "" {
			orgName = req.Name + "'s Workspace"
		}

		slug := strings.ToLower(strings.ReplaceAll(orgName, " ", "-")) + "-" + uuid.New().String()[:6]
		org = models.Organization{
			ID:           "org-" + uuid.New().String()[:8],
			Name:         orgName,
			Slug:         slug,
			OwnerID:      user.ID,
			PlanTier:     "STARTER",
			BillingCycle: "MONTHLY",
			Status:       "ACTIVE",
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}
		h.db.Create(&org)

		member := models.WorkspaceMember{
			ID:             uuid.New().String(),
			OrganizationID: org.ID,
			UserID:         user.ID,
			Role:           assignedRole,
			CreatedAt:      time.Now(),
		}
		h.db.Create(&member)

		// Create default tenant settings
		settings := models.GTMTenantSettings{
			ID:             uuid.New().String(),
			OrganizationID: org.ID,
			EmailProvider:  "NEXA_MANAGED",
			SMTPPort:       587,
			DailyEmailLimit: 500,
			CreatedAt:      time.Now(),
			UpdatedAt:      time.Now(),
		}
		h.db.Create(&settings)
	} else {
		org = models.Organization{
			ID:       "org-01",
			Name:     req.BusinessName,
			OwnerID:  user.ID,
			PlanTier: "STARTER",
			Status:   "ACTIVE",
		}
	}

	token, err := middleware.GenerateToken(&user, org.ID)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate authentication token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{
		Token:        token,
		User:         &user,
		OrgID:        org.ID,
		Organization: &org,
	})
}

// Login authenticates with email & password, returning JWT token
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	var user models.User
	var orgID string
	var org models.Organization

	if h.db != nil {
		if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
			http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			http.Error(w, `{"error": "Invalid email or password"}`, http.StatusUnauthorized)
			return
		}

		// Find organization
		var member models.WorkspaceMember
		if err := h.db.Where("user_id = ?", user.ID).First(&member).Error; err == nil {
			orgID = member.OrganizationID
			_ = h.db.Where("id = ?", orgID).First(&org)
			if member.Role != "" {
				user.Role = member.Role
			}
		} else {
			if err := h.db.Where("owner_id = ?", user.ID).First(&org).Error; err == nil {
				orgID = org.ID
			} else {
				orgID = "org-01"
			}
		}
	} else {
		// Fallback for offline dev
		user = models.User{
			ID:    "usr-01",
			Email: req.Email,
			Name:  "Adeyemi Adeleke",
			Role:  models.RoleTenantOwner,
		}
		orgID = "org-01"
	}

	token, err := middleware.GenerateToken(&user, orgID)
	if err != nil {
		http.Error(w, `{"error": "Failed to generate authentication token"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AuthResponse{
		Token:        token,
		User:         &user,
		OrgID:        orgID,
		Organization: &org,
	})
}

// GetMe returns the authenticated user claims, profile, and active workspace
func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error": "Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var user models.User
	var org models.Organization
	if h.db != nil {
		_ = h.db.Where("id = ?", claims.UserID).First(&user)
		if claims.OrgID != "" {
			_ = h.db.Where("id = ?", claims.OrgID).First(&org)
		}
	}

	if user.ID == "" {
		user = models.User{
			ID:    claims.UserID,
			Email: claims.Email,
			Name:  claims.Name,
			Role:  claims.Role,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user":         user,
		"org_id":       claims.OrgID,
		"organization": org,
		"role":         claims.Role,
	})
}

// ListWorkspaceUsers lists members belonging to the specified orgId
func (h *AuthHandler) ListWorkspaceUsers(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, `{"error": "orgId parameter is required"}`, http.StatusBadRequest)
		return
	}

	type MemberDTO struct {
		ID        string      `json:"id"`
		UserID    string      `json:"user_id"`
		Name      string      `json:"name"`
		Email     string      `json:"email"`
		Role      models.Role `json:"role"`
		Title     string      `json:"title"`
		Avatar    string      `json:"avatar"`
		CreatedAt time.Time   `json:"created_at"`
	}

	var members []MemberDTO
	if h.db != nil {
		rows, err := h.db.Table("WorkspaceMember").
			Select("WorkspaceMember.id, WorkspaceMember.user_id, User.name, User.email, WorkspaceMember.role, User.title, User.avatar, WorkspaceMember.created_at").
			Joins("JOIN `User` ON `User`.id = WorkspaceMember.user_id").
			Where("WorkspaceMember.organization_id = ?", orgID).
			Rows()

		if err == nil {
			defer rows.Close()
			for rows.Next() {
				var m MemberDTO
				if err := rows.Scan(&m.ID, &m.UserID, &m.Name, &m.Email, &m.Role, &m.Title, &m.Avatar, &m.CreatedAt); err == nil {
					members = append(members, m)
				}
			}
		}
	}

	if len(members) == 0 {
		members = []MemberDTO{
			{ID: "m-01", UserID: "usr-01", Name: "Adeyemi Adeleke", Email: "adeyemi@edusuite.ng", Role: models.RoleTenantOwner, Title: "Managing Director", Avatar: "/avatar12.png", CreatedAt: time.Now()},
			{ID: "m-02", UserID: "usr-02", Name: "Khalil Bello", Email: "khalil@edusuite.ng", Role: models.RoleGrowthLead, Title: "Growth Lead", Avatar: "/avatar5.png", CreatedAt: time.Now()},
			{ID: "m-03", UserID: "usr-03", Name: "Chidinma Eze", Email: "chidinma@edusuite.ng", Role: models.RoleSalesRep, Title: "Senior Sales SDR", Avatar: "/avatar8.png", CreatedAt: time.Now()},
			{ID: "m-04", UserID: "usr-04", Name: "Babajide Sanwo", Email: "auditor@edusuite.ng", Role: models.RoleViewer, Title: "Operations Auditor", Avatar: "/avatar3.png", CreatedAt: time.Now()},
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(members)
}

// InviteUser provisions or associates a team member with an organization and assigns an RBAC role
func (h *AuthHandler) InviteUser(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	if orgID == "" {
		http.Error(w, `{"error": "orgId parameter is required"}`, http.StatusBadRequest)
		return
	}

	var req InviteUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Name == "" {
		http.Error(w, `{"error": "Email and name are required"}`, http.StatusBadRequest)
		return
	}

	assignedRole := req.Role
	if assignedRole == "" {
		assignedRole = models.RoleGrowthLead
	}

	var user models.User
	if h.db != nil {
		if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
			// Create user with default password
			pwd := req.Password
			if pwd == "" {
				pwd = "TempOfiaPassword2026!"
			}
			hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(pwd), bcrypt.DefaultCost)
			user = models.User{
				ID:        uuid.New().String(),
				Email:     req.Email,
				Password:  string(hashedPassword),
				Name:      req.Name,
				Role:      assignedRole,
				Title:     req.Title,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			h.db.Create(&user)
		}

		// Create workspace membership
		var existingMember models.WorkspaceMember
		if err := h.db.Where("organization_id = ? AND user_id = ?", orgID, user.ID).First(&existingMember).Error; err != nil {
			member := models.WorkspaceMember{
				ID:             uuid.New().String(),
				OrganizationID: orgID,
				UserID:         user.ID,
				Role:           assignedRole,
				CreatedAt:      time.Now(),
			}
			h.db.Create(&member)
		} else {
			existingMember.Role = assignedRole
			h.db.Save(&existingMember)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User invited and provisioned successfully",
		"user":    user,
		"role":    assignedRole,
		"org_id":  orgID,
	})
}

// UpdateUserRole changes a user's RBAC role within the workspace
func (h *AuthHandler) UpdateUserRole(w http.ResponseWriter, r *http.Request) {
	orgID := chi.URLParam(r, "orgId")
	userID := chi.URLParam(r, "userId")

	var req UpdateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	if h.db != nil {
		var member models.WorkspaceMember
		if err := h.db.Where("organization_id = ? AND user_id = ?", orgID, userID).First(&member).Error; err == nil {
			member.Role = req.Role
			h.db.Save(&member)
		}
		// Also update base user role if applicable
		h.db.Model(&models.User{}).Where("id = ?", userID).Update("role", req.Role)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "User role updated successfully",
		"user_id": userID,
		"role":    req.Role,
	})
}

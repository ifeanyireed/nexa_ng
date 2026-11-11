package handlers

import (
	"encoding/json"
	"time"
)

// AwardEvent represents an annual or periodic recognition event
type AwardEvent struct {
	ID               string    `json:"id"`
	TenantSlug       string    `json:"tenantSlug"`
	Title            string    `json:"title"`
	Slug             string    `json:"slug"`
	Description      string    `json:"description"`
	BannerURL        string    `json:"bannerUrl"`
	AwardYear        int       `json:"awardYear"`
	StartDate        time.Time `json:"startDate"`
	EndDate          time.Time `json:"endDate"`
	Status           string    `json:"status"` // DRAFT, ACTIVE, PAUSED, CLOSED, FINALIZED, PUBLISHED
	IsAnonymous      bool      `json:"isAnonymous"`
	AllowVoteEditing bool      `json:"allowVoteEditing"`
	IsPublicVisible  bool      `json:"isPublicVisible"`
	PublicSlug       string    `json:"publicSlug"`
	CreatedBy        string    `json:"createdBy"`
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`

	// Nested fields populated in detailed responses
	Categories []AwardCategory `json:"categories,omitempty"`
	Stats      *TurnoutStats   `json:"stats,omitempty"`
}

// AwardCategory represents an individual category within an awards event
type AwardCategory struct {
	ID                  string           `json:"id"`
	EventID             string           `json:"eventId"`
	TenantSlug          string           `json:"tenantSlug"`
	Name                string           `json:"name"`
	Slug                string           `json:"slug"`
	Description         string           `json:"description"`
	Criteria            string           `json:"criteria"`
	IconName            string           `json:"iconName"`
	ImageURL            string           `json:"imageUrl"`
	MaxWinners          int              `json:"maxWinners"`
	MinSelections       int              `json:"minSelections"`
	SortOrder           int              `json:"sortOrder"`
	EligibleDepartments *json.RawMessage `json:"eligibleDepartments"`
	CreatedAt           time.Time        `json:"createdAt"`
	UpdatedAt           time.Time        `json:"updatedAt"`

	// Nested nominees
	Nominees []AwardNominee `json:"nominees,omitempty"`
}

// AwardNominee represents an employee nominated for a specific category
type AwardNominee struct {
	ID              string    `json:"id"`
	CategoryID      string    `json:"categoryId"`
	EventID         string    `json:"eventId"`
	TenantSlug      string    `json:"tenantSlug"`
	EmployeeID      string    `json:"employeeId"`
	EmployeeName    string    `json:"employeeName"`
	Department      string    `json:"department"`
	Designation     string    `json:"designation"`
	AvatarURL       string    `json:"avatarUrl"`
	NominationPitch string    `json:"nominationPitch"`
	DisplayOrder    int       `json:"displayOrder"`
	IsActive        bool      `json:"isActive"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
}

// AwardBallot tracks that an employee has submitted their ballot without linking choices
type AwardBallot struct {
	ID                   string    `json:"id"`
	EventID              string    `json:"eventId"`
	TenantSlug           string    `json:"tenantSlug"`
	EmployeeID           string    `json:"employeeId"`
	ReceiptHash          string    `json:"receiptHash"`
	IsSealed             bool      `json:"isSealed"`
	CategoriesVotedCount int       `json:"categoriesVotedCount"`
	SubmittedAt          time.Time `json:"submittedAt"`
}

// AwardVote represents an anonymized single vote for a nominee in a category
type AwardVote struct {
	ID         string    `json:"id"`
	EventID    string    `json:"eventId"`
	CategoryID string    `json:"categoryId"`
	NomineeID  string    `json:"nomineeId"`
	TenantSlug string    `json:"tenantSlug"`
	BallotHash string    `json:"ballotHash"`
	CastAt     time.Time `json:"castAt"`
}

// AwardResult represents tally calculations for a category nominee
type AwardResult struct {
	ID             string    `json:"id"`
	EventID        string    `json:"eventId"`
	CategoryID     string    `json:"categoryId"`
	NomineeID      string    `json:"nomineeId"`
	TenantSlug     string    `json:"tenantSlug"`
	TotalVotes     int       `json:"totalVotes"`
	VotePercentage float64   `json:"votePercentage"`
	Rank           int       `json:"rank"`
	IsWinner       bool      `json:"isWinner"`
	FinalizedAt    time.Time `json:"finalizedAt"`

	// Enriched fields for HR review
	EmployeeName string `json:"employeeName,omitempty"`
	Department   string `json:"department,omitempty"`
	Designation  string `json:"designation,omitempty"`
	AvatarURL    string `json:"avatarUrl,omitempty"`
	CategoryName string `json:"categoryName,omitempty"`
}

// AwardWinner represents an officially published award winner
type AwardWinner struct {
	ID                 string    `json:"id"`
	EventID            string    `json:"eventId"`
	CategoryID         string    `json:"categoryId"`
	NomineeID          string    `json:"nomineeId"`
	TenantSlug         string    `json:"tenantSlug"`
	EmployeeID         string    `json:"employeeId"`
	EmployeeName       string    `json:"employeeName"`
	Department         string    `json:"department"`
	Designation        string    `json:"designation"`
	AvatarURL          string    `json:"avatarUrl"`
	Rank               int       `json:"rank"`
	TotalVotesReceived int       `json:"totalVotesReceived"`
	Citation           string    `json:"citation"`
	CertificateNumber  string    `json:"certificateNumber"`
	PublishedAt        time.Time `json:"publishedAt"`

	// Category meta
	CategoryName string `json:"categoryName,omitempty"`
	EventTitle   string `json:"eventTitle,omitempty"`
	AwardYear    int    `json:"awardYear,omitempty"`
}

// TurnoutStats represents aggregate participation metrics
type TurnoutStats struct {
	TotalEligibleStaff   int                     `json:"totalEligibleStaff"`
	TotalBallotsCast     int                     `json:"totalBallotsCast"`
	TurnoutPercentage    float64                 `json:"turnoutPercentage"`
	ActiveCategories     int                     `json:"activeCategories"`
	DepartmentTurnout    []DepartmentTurnoutStat `json:"departmentTurnout"`
	DaysRemaining        int                     `json:"daysRemaining"`
	IsVotingOpen         bool                    `json:"isVotingOpen"`
}

type DepartmentTurnoutStat struct {
	Department string  `json:"department"`
	TotalStaff int     `json:"totalStaff"`
	VotedCount int     `json:"votedCount"`
	Percentage float64 `json:"percentage"`
}

// DTOs for API requests

type CreateAwardEventRequest struct {
	Title            string `json:"title"`
	Slug             string `json:"slug"`
	Description      string `json:"description"`
	BannerURL        string `json:"bannerUrl"`
	AwardYear        int    `json:"awardYear"`
	StartDate        string `json:"startDate"` // RFC3339 or YYYY-MM-DD
	EndDate          string `json:"endDate"`
	IsAnonymous      *bool  `json:"isAnonymous"`
	AllowVoteEditing *bool  `json:"allowVoteEditing"`
	IsPublicVisible  *bool  `json:"isPublicVisible"`
	CreatedBy        string `json:"createdBy"`
}

type UpdateAwardEventStatusRequest struct {
	Status string `json:"status"` // DRAFT, ACTIVE, PAUSED, CLOSED, FINALIZED, PUBLISHED
}

type CreateAwardCategoryRequest struct {
	EventID             string   `json:"eventId"`
	Name                string   `json:"name"`
	Slug                string   `json:"slug"`
	Description         string   `json:"description"`
	Criteria            string   `json:"criteria"`
	IconName            string   `json:"iconName"`
	ImageURL            string   `json:"imageUrl"`
	MaxWinners          int      `json:"maxWinners"`
	MinSelections       int      `json:"minSelections"`
	SortOrder           int      `json:"sortOrder"`
	EligibleDepartments []string `json:"eligibleDepartments"`
}

type AddNomineeRequest struct {
	EventID         string `json:"eventId"`
	CategoryID      string `json:"categoryId"`
	EmployeeID      string `json:"employeeId"`
	NominationPitch string `json:"nominationPitch"`
	DisplayOrder    int    `json:"displayOrder"`
}

type CategoryVoteSelection struct {
	CategoryID string `json:"categoryId"`
	NomineeID  string `json:"nomineeId"`
}

type SubmitBallotRequest struct {
	EventID    string                  `json:"eventId"`
	EmployeeID string                  `json:"employeeId"`
	Selections []CategoryVoteSelection `json:"selections"`
}

type BallotSubmissionResult struct {
	Success              bool      `json:"success"`
	ReceiptHash          string    `json:"receiptHash"`
	CategoriesVotedCount int       `json:"categoriesVotedCount"`
	SubmittedAt          time.Time `json:"submittedAt"`
	IsSealed             bool      `json:"isSealed"`
	Message              string    `json:"message"`
}

type StaffCandidate struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Department  string `json:"department"`
	Designation string `json:"designation"`
	Avatar      string `json:"avatar"`
	Role        string `json:"role"`
}

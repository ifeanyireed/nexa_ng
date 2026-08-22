package handlers

import "encoding/json"

type User struct {
	ID             string           `json:"id"`
	Name           string           `json:"name"`
	Email          string           `json:"email"`
	Role           string           `json:"role"`
	Department     string           `json:"department"`
	Avatar         string           `json:"avatar"`
	ManagerName    *string          `json:"managerName"`
	ManagerID      *string          `json:"managerId"`
	RatingTrend    *json.RawMessage `json:"ratingTrend"`
	Designation    *string          `json:"designation"`
	GradeLevel     *string          `json:"gradeLevel"`
	EmploymentDate *string          `json:"employmentDate"`
	Company        *string          `json:"company"`
	Location       *string          `json:"location"`
	Password       *string          `json:"password"`
}

type Objective struct {
	ID            string           `json:"id"`
	Text          string           `json:"text"`
	Weight        int              `json:"weight"`
	Type          string           `json:"type"`
	ExpectedLevel *int             `json:"expectedLevel"`
	Category      *string          `json:"category"`
	Departments   *json.RawMessage `json:"departments"`
	Description   *json.RawMessage `json:"description"`
}

type ReviewCycle struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	StartDate   string           `json:"startDate"`
	EndDate     string           `json:"endDate"`
	Status      string           `json:"status"`
	Departments *json.RawMessage `json:"departments"`
}

type PerformanceReview struct {
	ID               string           `json:"id"`
	EmployeeID       string           `json:"employeeId"`
	EmployeeName     string           `json:"employeeName"`
	Department       string           `json:"department"`
	CycleID          string           `json:"cycleId"`
	CycleName        string           `json:"cycleName"`
	Status           string           `json:"status"`
	EmployeeComments *string          `json:"employeeComments"`
	ManagerComments  *string          `json:"managerComments"`
	HRComments       *string          `json:"hrComments"`
	ImprovementPlan  *string          `json:"improvementPlan"`
	FinalScore       *float64         `json:"finalScore"`
	Objectives       *json.RawMessage `json:"objectives"` // Maps to objectivesJson in DB
	UpdatedAt        string           `json:"updatedAt"`
}

type SeedData struct {
	Users      [][]interface{} `json:"users"`
	Cycles     [][]interface{} `json:"cycles"`
	Objectives [][]interface{} `json:"objectives"`
	Reviews    [][]interface{} `json:"reviews"`
}

type ResetEmailRequest struct {
	UserIDs []string `json:"userIds"`
	Email   string   `json:"email"`
}

type BulkNotificationRequest struct {
	UserIDs []string `json:"userIds"`
	Subject string   `json:"subject"`
	Message string   `json:"message"`
}

type UpdatePasswordRequest struct {
	Email       string `json:"email"`
	Token       string `json:"token"`
	NewPassword string `json:"newPassword"`
}

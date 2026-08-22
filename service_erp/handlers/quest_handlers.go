package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Quest Model
type Quest struct {
	ID          string    `json:"id"`
	OrgID       string    `json:"org_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	CoverImage  string    `json:"cover_image"`
	Status      string    `json:"status"` // DRAFT, PUBLISHED, ACTIVE, COMPLETED, ARCHIVED
	Visibility  string    `json:"visibility"`
	StartsAt    time.Time `json:"starts_at"`
	EndsAt      time.Time `json:"ends_at"`
	Location    string    `json:"location"`
	Settings    any       `json:"settings"`
	CreatedBy   string    `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
}

// QuestTeam Model
type QuestTeam struct {
	ID          string `json:"id"`
	QuestID     string `json:"quest_id"`
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Logo        string `json:"logo"`
	Color       string `json:"color"`
	Motto       string `json:"motto"`
	TotalPoints int    `json:"total_points"`
	Rank        int    `json:"rank"`
	MemberCount int    `json:"member_count"`
}

// QuestParticipant Model
type QuestParticipant struct {
	ID           string    `json:"id"`
	QuestID      string    `json:"quest_id"`
	EmployeeID   string    `json:"employee_id"`
	EmployeeName string    `json:"employee_name"`
	Department   string    `json:"department"`
	TeamID       string    `json:"team_id"`
	TeamName     string    `json:"team_name"`
	Code         string    `json:"code"`
	Status       string    `json:"status"` // PENDING, CLAIMED, ACTIVE
	JoinedAt     time.Time `json:"joined_at"`
}

// Challenge Model
type Challenge struct {
	ID                string    `json:"id"`
	QuestID           string    `json:"quest_id"`
	Name              string    `json:"name"`
	Description       string    `json:"description"`
	Instructions      string    `json:"instructions"`
	Type              string    `json:"type"` // QUIZ, SUBMISSION, MANUAL_JUDGING, TIMED_TASK
	ParticipationType string    `json:"participation_type"`
	Status            string    `json:"status"` // UPCOMING, ACTIVE, COMPLETED
	StartsAt          time.Time `json:"starts_at"`
	EndsAt            time.Time `json:"ends_at"`
	MaxScore          int       `json:"max_score"`
	SubmissionType    string    `json:"submission_type"`
	ReviewMode        string    `json:"review_mode"`
	Settings          any       `json:"settings"`
	SubmissionsCount  int       `json:"submissions_count"`
}

// QuestScore (Immutable Transactional Score Ledger)
type QuestScore struct {
	ID            string    `json:"id"`
	QuestID       string    `json:"quest_id"`
	ChallengeID   string    `json:"challenge_id"`
	ChallengeName string    `json:"challenge_name"`
	TeamID        string    `json:"team_id"`
	TeamName      string    `json:"team_name"`
	ParticipantID string    `json:"participant_id"`
	Points        int       `json:"points"`
	Reason        string    `json:"reason"`
	Source        string    `json:"source"`
	Status        string    `json:"status"` // VALID, REVERSED
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
}

// QuestAnnouncement
type QuestAnnouncement struct {
	ID          string    `json:"id"`
	QuestID     string    `json:"quest_id"`
	Title       string    `json:"title"`
	Body        string    `json:"body"`
	MediaURL    string    `json:"media_url"`
	PublishedAt time.Time `json:"published_at"`
	CreatedBy   string    `json:"created_by"`
}

// In-Memory Fallback Store with Pre-Seeded Retreat Quest
var (
	questMu        sync.RWMutex
	inMemoryQuests = []Quest{
		{
			ID:          "qst-retreat-2026",
			OrgID:       "org-01",
			Name:        "2026 Annual Staff Retreat & Innovation Games",
			Slug:        "2026-staff-retreat",
			Description: "Annual enterprise retreat, cross-department team bonding, hackathon sprints, and outdoor agility challenges.",
			CoverImage:  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
			Status:      "ACTIVE",
			Visibility:  "PUBLIC",
			StartsAt:    time.Now().Add(-24 * time.Hour),
			EndsAt:      time.Now().Add(48 * time.Hour),
			Location:    "Epe Resort & Spa, Lagos",
			Settings: map[string]any{
				"primary_color": "#1A56DB",
				"accent_color":  "#7E3AF2",
				"enable_tv":     true,
			},
			CreatedBy: "HR Directorate",
			CreatedAt: time.Now().Add(-72 * time.Hour),
		},
	}

	inMemoryTeams = []QuestTeam{
		{
			ID:          "team-alpha",
			QuestID:     "qst-retreat-2026",
			Name:        "Team Alpha (Blue Eagles)",
			Slug:        "team-alpha",
			Logo:        "🦅",
			Color:       "#1A56DB",
			Motto:       "Swift, Strategic, Unstoppable",
			TotalPoints: 840,
			Rank:        1,
			MemberCount: 15,
		},
		{
			ID:          "team-bravo",
			QuestID:     "qst-retreat-2026",
			Name:        "Team Bravo (Red Vipers)",
			Slug:        "team-bravo",
			Logo:        "🐍",
			Color:       "#E02424",
			Motto:       "Relentless Speed & Precision",
			TotalPoints: 795,
			Rank:        2,
			MemberCount: 15,
		},
		{
			ID:          "team-delta",
			QuestID:     "qst-retreat-2026",
			Name:        "Team Delta (Green Lions)",
			Slug:        "team-delta",
			Logo:        "🦁",
			Color:       "#0E9F6E",
			Motto:       "Courage in Every Stride",
			TotalPoints: 710,
			Rank:        3,
			MemberCount: 14,
		},
		{
			ID:          "team-charlie",
			QuestID:     "qst-retreat-2026",
			Name:        "Team Charlie (Gold Titans)",
			Slug:        "team-charlie",
			Logo:        "⚡",
			Color:       "#D97706",
			Motto:       "Power, Intellect, Victory",
			TotalPoints: 650,
			Rank:        4,
			MemberCount: 14,
		},
	}

	inMemoryChallenges = []Challenge{
		{
			ID:                "chl-trivia-01",
			QuestID:           "qst-retreat-2026",
			Name:              "Executive Company & Industry Trivia",
			Description:       "Speed quiz testing corporate history, Nigerian tech landscape, and product milestones.",
			Instructions:      "15 multiple choice questions. 20 seconds per question. Highest team accuracy wins.",
			Type:              "QUIZ",
			ParticipationType: "TEAM",
			Status:            "COMPLETED",
			MaxScore:          150,
			SubmissionType:    "QUIZ_OPTIONS",
			ReviewMode:        "AUTOMATIC",
			SubmissionsCount:  4,
		},
		{
			ID:                "chl-photo-02",
			QuestID:           "qst-retreat-2026",
			Name:              "Best Creative Team Mascot Photo",
			Description:       "Staged team photograph embodying your team motto with natural resort scenery.",
			Instructions:      "Upload 1 high-resolution photo with all members present in team colors.",
			Type:              "SUBMISSION",
			ParticipationType: "TEAM",
			Status:            "ACTIVE",
			MaxScore:          200,
			SubmissionType:    "IMAGE",
			ReviewMode:        "JUDGE_APPROVAL",
			SubmissionsCount:  3,
		},
		{
			ID:                "chl-hackathon-03",
			QuestID:           "qst-retreat-2026",
			Name:              "2-Hour Product Innovation Pitch",
			Description:       "Pitch an AI-driven workflow that can save Ofia operations 20 hours per week.",
			Instructions:      "3-minute slide deck presentation to executive panel.",
			Type:              "MANUAL_JUDGING",
			ParticipationType: "TEAM",
			Status:            "UPCOMING",
			MaxScore:          300,
			SubmissionType:    "NONE",
			ReviewMode:        "JUDGE_APPROVAL",
			SubmissionsCount:  0,
		},
	}

	inMemoryAnnouncements = []QuestAnnouncement{
		{
			ID:          "anc-01",
			QuestID:     "qst-retreat-2026",
			Title:       "🔥 Creative Photo Challenge is Now LIVE!",
			Body:        "All teams have until 4:00 PM to submit their mascot photo in the submission portal. Judges are scoring creativity and team unity.",
			MediaURL:    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
			PublishedAt: time.Now().Add(-2 * time.Hour),
			CreatedBy:   "Chief Judge",
		},
		{
			ID:          "anc-02",
			QuestID:     "qst-retreat-2026",
			Title:       "⚡ Trivia Results Published!",
			Body:        "Congratulations to Team Alpha for clinching 1st place in the Executive Trivia round with a record 94% accuracy!",
			PublishedAt: time.Now().Add(-5 * time.Hour),
			CreatedBy:   "HR Desk",
		},
	}
)

// HandleQuests handles GET /quests and POST /quests
func HandleQuests(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(inMemoryQuests)
		return
	}

	if r.Method == http.MethodPost {
		var newQuest Quest
		if err := json.NewDecoder(r.Body).Decode(&newQuest); err != nil {
			http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
			return
		}
		newQuest.ID = fmt.Sprintf("qst-%d", time.Now().Unix())
		newQuest.CreatedAt = time.Now()
		if newQuest.Status == "" {
			newQuest.Status = "ACTIVE"
		}
		inMemoryQuests = append([]Quest{newQuest}, inMemoryQuests...)
		json.NewEncoder(w).Encode(newQuest)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestDetail handles /quests/detail
func HandleQuestDetail(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	questMu.RLock()
	defer questMu.RUnlock()

	slug := r.URL.Query().Get("slug")
	id := r.URL.Query().Get("id")

	var targetQuest *Quest
	for _, q := range inMemoryQuests {
		if (slug != "" && q.Slug == slug) || (id != "" && q.ID == id) || (slug == "" && id == "") {
			targetQuest = &q
			break
		}
	}

	if targetQuest == nil && len(inMemoryQuests) > 0 {
		targetQuest = &inMemoryQuests[0]
	}

	response := map[string]any{
		"quest":         targetQuest,
		"teams":         inMemoryTeams,
		"challenges":    inMemoryChallenges,
		"announcements": inMemoryAnnouncements,
	}

	json.NewEncoder(w).Encode(response)
}

// HandleQuestTeams handles /quests/teams
func HandleQuestTeams(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(inMemoryTeams)
		return
	}

	if r.Method == http.MethodPost {
		var newTeam QuestTeam
		if err := json.NewDecoder(r.Body).Decode(&newTeam); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		newTeam.ID = fmt.Sprintf("team-%d", time.Now().Unix())
		inMemoryTeams = append(inMemoryTeams, newTeam)
		json.NewEncoder(w).Encode(newTeam)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestChallenges handles /quests/challenges
func HandleQuestChallenges(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(inMemoryChallenges)
		return
	}

	if r.Method == http.MethodPost {
		var newChl Challenge
		if err := json.NewDecoder(r.Body).Decode(&newChl); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		newChl.ID = fmt.Sprintf("chl-%d", time.Now().Unix())
		inMemoryChallenges = append(inMemoryChallenges, newChl)
		json.NewEncoder(w).Encode(newChl)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestScoreboard handles public live scoreboard query
func HandleQuestScoreboard(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	questMu.RLock()
	defer questMu.RUnlock()

	response := map[string]any{
		"quest":            inMemoryQuests[0],
		"leaderboard":      inMemoryTeams,
		"last_updated":     time.Now().Format(time.RFC3339),
		"active_challenge": inMemoryChallenges[1],
		"announcements":    inMemoryAnnouncements,
	}

	json.NewEncoder(w).Encode(response)
}

// HandleQuestScores handles score transactions and grading
func HandleQuestScores(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	if r.Method == http.MethodPost {
		var payload struct {
			TeamID string `json:"team_id"`
			Points int    `json:"points"`
			Reason string `json:"reason"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}

		for i := range inMemoryTeams {
			if inMemoryTeams[i].ID == payload.TeamID || strings.Contains(strings.ToLower(inMemoryTeams[i].Name), strings.ToLower(payload.TeamID)) {
				inMemoryTeams[i].TotalPoints += payload.Points
				break
			}
		}

		json.NewEncoder(w).Encode(map[string]any{
			"status":  "SCORE_RECORDED",
			"teams":   inMemoryTeams,
			"message": fmt.Sprintf("Awarded %d points to team %s", payload.Points, payload.TeamID),
		})
		return
	}

	json.NewEncoder(w).Encode(inMemoryTeams)
}

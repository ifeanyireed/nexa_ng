package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"sync"
	"time"
)

// QuestInstance Model
type QuestInstance struct {
	ID             string    `json:"id"`
	TenantSlug     string    `json:"tenant_slug"`
	Name           string    `json:"name"`
	Slug           string    `json:"slug"`
	Description    string    `json:"description"`
	CoverImage     string    `json:"cover_image"`
	Status         string    `json:"status"` // DRAFT, ACTIVE, COMPLETED, ARCHIVED
	GrandPrize     string    `json:"grand_prize"`
	TotalMaxPoints int       `json:"total_max_points"`
	Location       string    `json:"location"`
	StartsAt       string    `json:"starts_at"`
	EndsAt         string    `json:"ends_at"`
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
}

// QuestTeam Model
type QuestTeam struct {
	ID          string `json:"id"`
	QuestID     string `json:"quest_id"`
	TenantSlug  string `json:"tenant_slug"`
	Name        string `json:"name"`
	CustomName  string `json:"custom_name,omitempty"`
	Slug        string `json:"slug"`
	Logo        string `json:"logo"`
	Color       string `json:"color"`
	Motto       string `json:"motto"`
	TotalPoints int    `json:"total_points"`
	Rank        int    `json:"rank"`
	CaptainID   string `json:"captain_id,omitempty"`
	MemberCount int    `json:"member_count"`
}

// QuestParticipant Model (Foreign Key to live corporate User directory)
type QuestParticipant struct {
	ID         string    `json:"id"`
	QuestID    string    `json:"quest_id"`
	TenantSlug string    `json:"tenant_slug"`
	TeamID     string    `json:"team_id"`
	UserID     string    `json:"user_id"`
	UserName   string    `json:"user_name"`
	UserEmail  string    `json:"user_email"`
	Department string    `json:"department"`
	Avatar     string    `json:"avatar"`
	Role       string    `json:"role"`   // captain, member
	Status     string    `json:"status"` // ACTIVE, INACTIVE
	JoinedAt   time.Time `json:"joined_at"`
}

// QuestChallenge Model
type QuestChallenge struct {
	ID               string    `json:"id"`
	QuestID          string    `json:"quest_id"`
	TenantSlug       string    `json:"tenant_slug"`
	Day              string    `json:"day"`         // Day 1, Day 2, Day 3
	Category         string    `json:"category"`    // Educative, Conventional, Informative, Entertainment, Sports
	EngineType       string    `json:"engine_type"` // QUIZ, RUBRIC, RANK_TO_POINTS, PARTICIPATION, CONCEPT_AND_RUBRIC
	Name             string    `json:"name"`
	Description      string    `json:"description"`
	Instructions     string    `json:"instructions"`
	MaxScore         int       `json:"max_score"`
	Status           string    `json:"status"` // LOCKED, OPEN, IN_PROGRESS, SUBMITTED, VERIFIED, COMPLETED
	Rubric           any       `json:"rubric,omitempty"`
	Settings         any       `json:"settings,omitempty"`
	SubmissionsCount int       `json:"submissions_count"`
	StartsAt         time.Time `json:"starts_at,omitempty"`
	EndsAt           time.Time `json:"ends_at,omitempty"`
}

// QuestConcept Model (Concept Registration & Duplicate Locking)
type QuestConcept struct {
	ID          string    `json:"id"`
	QuestID     string    `json:"quest_id"`
	TenantSlug  string    `json:"tenant_slug"`
	ChallengeID string    `json:"challenge_id"`
	TeamID      string    `json:"team_id"`
	TeamName    string    `json:"team_name"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Format      string    `json:"format"` // Drama, Comedy, Musical, Debate, Pitch
	Status      string    `json:"status"` // PENDING, APPROVED, REJECTED
	LockedBy    string    `json:"locked_by,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// QuestScore Model
type QuestScore struct {
	ID            string    `json:"id"`
	QuestID       string    `json:"quest_id"`
	TenantSlug    string    `json:"tenant_slug"`
	ChallengeID   string    `json:"challenge_id"`
	ChallengeName string    `json:"challenge_name"`
	TeamID        string    `json:"team_id"`
	TeamName      string    `json:"team_name"`
	Points        int       `json:"points"`
	MaxPoints     int       `json:"max_points"`
	ScoredBy      string    `json:"scored_by"`
	Reason        string    `json:"reason"`
	Source        string    `json:"source"`
	Status        string    `json:"status"` // VALID, REVERSED
	CreatedAt     time.Time `json:"created_at"`
}

// QuestScoreAudit Model (Immutable Score Audit Trail)
type QuestScoreAudit struct {
	ID            string    `json:"id"`
	QuestID       string    `json:"quest_id"`
	TenantSlug    string    `json:"tenant_slug"`
	ChallengeID   string    `json:"challenge_id"`
	TeamID        string    `json:"team_id"`
	PreviousScore int       `json:"previous_score"`
	NewScore      int       `json:"new_score"`
	Reason        string    `json:"reason"`
	ModifiedBy    string    `json:"modified_by"`
	CreatedAt     time.Time `json:"created_at"`
}

// QuestAnnouncement Model
type QuestAnnouncement struct {
	ID          string    `json:"id"`
	QuestID     string    `json:"quest_id"`
	TenantSlug  string    `json:"tenant_slug"`
	Title       string    `json:"title"`
	Body        string    `json:"body"`
	MediaURL    string    `json:"media_url"`
	PublishedAt time.Time `json:"published_at"`
	CreatedBy   string    `json:"created_by"`
}

// Pre-seeded REIGNITE 2026 Dataset (as specified in HR Document 17)
var (
	questMu sync.RWMutex

	reigniteQuests = []QuestInstance{
		{
			ID:             "qst-reignite-2026",
			TenantSlug:     "neweratransports",
			Name:           "REIGNITE 2026: Team Quest & Championship",
			Slug:           "reignite-2026",
			Description:    "Annual enterprise retreat, creative innovation pitch, trivia knowledge wars, and physical agility championship.",
			CoverImage:     "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
			Status:         "ACTIVE",
			GrandPrize:     "₦500,000",
			TotalMaxPoints: 850,
			Location:       "Epe Resort & Conference Centre, Lagos",
			StartsAt:       "2026-08-25T09:00:00.000Z",
			EndsAt:         "2026-08-27T18:00:00.000Z",
			CreatedBy:      "HR Directorate",
			CreatedAt:      time.Now(),
		},
	}

	reigniteTeams = []QuestTeam{
		{
			ID:          "team-1",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team 1",
			CustomName:  "Red Phoenix",
			Slug:        "team-1",
			Logo:        "🔥",
			Color:       "#EF4444",
			Motto:       "Igniting Excellence & Passion",
			TotalPoints: 0,
			Rank:        1,
			MemberCount: 10,
		},
		{
			ID:          "team-2",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team 2",
			CustomName:  "Blue Falcons",
			Slug:        "team-2",
			Logo:        "🦅",
			Color:       "#3B82F6",
			Motto:       "Soaring Above All Limits",
			TotalPoints: 0,
			Rank:        2,
			MemberCount: 10,
		},
		{
			ID:          "team-3",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team 3",
			CustomName:  "Golden Titans",
			Slug:        "team-3",
			Logo:        "⚡",
			Color:       "#F59E0B",
			Motto:       "Power, Intellect, Victory",
			TotalPoints: 0,
			Rank:        3,
			MemberCount: 10,
		},
		{
			ID:          "team-4",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team 4",
			CustomName:  "Emerald Lions",
			Slug:        "team-4",
			Logo:        "🦁",
			Color:       "#10B981",
			Motto:       "Courage in Every Stride",
			TotalPoints: 0,
			Rank:        4,
			MemberCount: 10,
		},
		{
			ID:          "team-5",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team 5",
			CustomName:  "Purple Vipers",
			Slug:        "team-5",
			Logo:        "🐍",
			Color:       "#8B5CF6",
			Motto:       "Speed, Precision & Synergy",
			TotalPoints: 0,
			Rank:        5,
			MemberCount: 10,
		},
		{
			ID:          "team-6",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team 6",
			CustomName:  "Silver Sharks",
			Slug:        "team-6",
			Logo:        "🦈",
			Color:       "#06B6D4",
			Motto:       "Relentless Focus & Tenacity",
			TotalPoints: 0,
			Rank:        6,
			MemberCount: 10,
		},
	}

	reigniteChallenges = []QuestChallenge{
		{
			ID:           "chl-day1-identity",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 1",
			Category:     "Entertainment",
			EngineType:   "RUBRIC",
			Name:         "Team Identity Presentation",
			Description:  "Each team presents its custom Team Name, Motto, Pose, and Team Chant / Celebration Song.",
			Instructions: "5-minute stage presentation judged on creativity, teamwork, energy, and overall delivery.",
			MaxScore:     50,
			Status:       "OPEN",
			Rubric: []map[string]any{
				{"criterion": "Creativity & Originality", "max_points": 15},
				{"criterion": "Teamwork & Cohesion", "max_points": 15},
				{"criterion": "Energy & Stage Presence", "max_points": 10},
				{"criterion": "Presentation Quality", "max_points": 10},
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day1-who-are-we",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 1",
			Category:     "Informative",
			EngineType:   "PARTICIPATION",
			Name:         "Who Are We? (5 Incredible Things)",
			Description:  "Each participant shares 5 incredible facts about themselves and how the company has contributed to their journey.",
			Instructions: "Facilitator marks each team member's active contribution. 100% participation yields maximum 50 points.",
			MaxScore:     50,
			Status:       "LOCKED",
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day1-games",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 1",
			Category:     "Entertainment",
			EngineType:   "RUBRIC",
			Name:         "Card Games & Karaoke Fun",
			Description:  "Team connection night featuring interactive board/card games, karaoke showdowns, and bonding activities.",
			Instructions: "Facilitators award up to 50 points based on team spirit, participation, creativity, and sportsmanship.",
			MaxScore:     50,
			Status:       "LOCKED",
			Rubric: []map[string]any{
				{"criterion": "Team Spirit & Vibe", "max_points": 15},
				{"criterion": "Participation Rate", "max_points": 15},
				{"criterion": "Performance & Talent", "max_points": 10},
				{"criterion": "Sportsmanship", "max_points": 10},
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day2-core-challenge",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 2",
			Category:     "Conventional / Creative",
			EngineType:   "CONCEPT_AND_RUBRIC",
			Name:         "REIGNITE: The Core Challenge",
			Description:  "Each team creates and performs a 10-minute original performance bringing the REIGNITE theme to life.",
			Instructions: "Teams must first register and lock their concept. Performances are scored across 6 weighted judging dimensions.",
			MaxScore:     200,
			Status:       "LOCKED",
			Rubric: []map[string]any{
				{"criterion": "Interpretation of REIGNITE", "max_points": 40},
				{"criterion": "Creativity & Originality", "max_points": 40},
				{"criterion": "Teamwork & Member Involvement", "max_points": 30},
				{"criterion": "Entertainment & Engagement", "max_points": 30},
				{"criterion": "Execution & Pacing", "max_points": 30},
				{"criterion": "Overall Impact & Message", "max_points": 30},
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day2-egg-race",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 2",
			Category:     "Entertainment",
			EngineType:   "RANK_TO_POINTS",
			Name:         "Egg & Spoon Agility Race",
			Description:  "Fast-paced team balance relay requiring agility, coordination, and steady nerves.",
			Instructions: "Facilitators enter finish rankings (1st to 6th place). Points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
			MaxScore:     50,
			Status:       "LOCKED",
			Settings: map[string]int{
				"1st": 50, "2nd": 40, "3rd": 30, "4th": 20, "5th": 10, "6th": 5,
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day2-quiz",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 2",
			Category:     "Educative",
			EngineType:   "QUIZ",
			Name:         "The Knowledge Quest (10 Questions)",
			Description:  "10 objective corporate and industry knowledge questions testing reasoning and operational know-how.",
			Instructions: "10 questions × 10 points = 100 points maximum. Automated marking using the official answer key.",
			MaxScore:     100,
			Status:       "LOCKED",
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day2-think-fast",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 2",
			Category:     "Educative",
			EngineType:   "QUIZ",
			Name:         "Think Fast Rapid-Fire Round",
			Description:  "10 rapid-fire buzzer questions asked to all teams concurrently.",
			Instructions: "10 questions × 5 points = 50 points maximum. Instant scoreboard update on facilitator confirmation.",
			MaxScore:     50,
			Status:       "LOCKED",
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day3-volleyball",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 3",
			Category:     "Sports",
			EngineType:   "RANK_TO_POINTS",
			Name:         "Girls' Volleyball Championship",
			Description:  "Competitive women's volleyball tournament with group matches and knockout finals.",
			Instructions: "Facilitators enter finish rankings. Points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
			MaxScore:     75,
			Status:       "LOCKED",
			Settings: map[string]int{
				"1st": 75, "2nd": 60, "3rd": 45, "4th": 30, "5th": 20, "6th": 10,
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day3-football",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 3",
			Category:     "Sports",
			EngineType:   "RANK_TO_POINTS",
			Name:         "Corporate Football Championship",
			Description:  "Full inter-team football tournament. High intensity, tactics, and team collaboration.",
			Instructions: "Facilitators enter tournament finish rankings. Points: 1st=100, 2nd=75, 3rd=60, 4th=45, 5th=30, 6th=20.",
			MaxScore:     100,
			Status:       "LOCKED",
			Settings: map[string]int{
				"1st": 100, "2nd": 75, "3rd": 60, "4th": 45, "5th": 30, "6th": 20,
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day3-relay",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 3",
			Category:     "Sports",
			EngineType:   "RANK_TO_POINTS",
			Name:         "4×100m Track Relay Race",
			Description:  "Speed and baton handover sprint showdown featuring mixed gender relay runners.",
			Instructions: "Facilitators enter sprint rankings. Points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
			MaxScore:     50,
			Status:       "LOCKED",
			Settings: map[string]int{
				"1st": 50, "2nd": 40, "3rd": 30, "4th": 20, "5th": 10, "6th": 5,
			},
			SubmissionsCount: 0,
		},
		{
			ID:           "chl-day3-tug-of-war",
			QuestID:      "qst-reignite-2026",
			TenantSlug:   "neweratransports",
			Day:          "Day 3",
			Category:     "Sports",
			EngineType:   "RANK_TO_POINTS",
			Name:         "Grand Tug of War Final",
			Description:  "The ultimate test of collective power, grip, and team resilience.",
			Instructions: "Facilitators enter tournament finish rankings. Points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
			MaxScore:     75,
			Status:       "LOCKED",
			Settings: map[string]int{
				"1st": 75, "2nd": 60, "3rd": 45, "4th": 30, "5th": 20, "6th": 10,
			},
			SubmissionsCount: 0,
		},
	}

	reigniteParticipants  = []QuestParticipant{}
	reigniteConcepts      = []QuestConcept{}
	reigniteScores        = []QuestScore{}
	reigniteScoreAudits   = []QuestScoreAudit{}
	reigniteAnnouncements = []QuestAnnouncement{
		{
			ID:          "anc-01",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Title:       "🔥 Welcome to REIGNITE 2026!",
			Body:        "All 6 teams have been initialized. Day 1 Team Identity Presentation is now OPEN. Prepare your custom name, motto, chant, and pose!",
			MediaURL:    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80",
			PublishedAt: time.Now().Add(-1 * time.Hour),
			CreatedBy:   "Chief Facilitator",
		},
	}
)

// Helper to get active tenant filter
func getQuestTenant(r *http.Request) string {
	slug := getTenantFilter(r)
	if slug == "" {
		slug = "neweratransports"
	}
	return slug
}

// HandleQuests handles GET /quests and POST /quests
func HandleQuests(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	tenant := getQuestTenant(r)

	if r.Method == http.MethodGet {
		var list []QuestInstance
		for _, q := range reigniteQuests {
			if tenant == "all" || q.TenantSlug == tenant || q.TenantSlug == "neweratransports" {
				list = append(list, q)
			}
		}
		json.NewEncoder(w).Encode(list)
		return
	}

	if r.Method == http.MethodPost {
		var newQuest QuestInstance
		if err := json.NewDecoder(r.Body).Decode(&newQuest); err != nil {
			http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
			return
		}
		if newQuest.ID == "" {
			newQuest.ID = fmt.Sprintf("qst-%d", time.Now().Unix())
		}
		newQuest.TenantSlug = tenant
		newQuest.CreatedAt = time.Now()
		if newQuest.Status == "" {
			newQuest.Status = "ACTIVE"
		}
		if newQuest.TotalMaxPoints == 0 {
			newQuest.TotalMaxPoints = 850
		}
		if newQuest.GrandPrize == "" {
			newQuest.GrandPrize = "₦500,000"
		}
		reigniteQuests = append([]QuestInstance{newQuest}, reigniteQuests...)
		json.NewEncoder(w).Encode(newQuest)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestDetail handles /quests/detail?id=...&slug=...
func HandleQuestDetail(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.RLock()
	defer questMu.RUnlock()

	id := r.URL.Query().Get("id")
	slug := r.URL.Query().Get("slug")

	var targetQuest *QuestInstance
	for _, q := range reigniteQuests {
		if (id != "" && q.ID == id) || (slug != "" && q.Slug == slug) || (id == "" && slug == "") {
			targetQuest = &q
			break
		}
	}

	if targetQuest == nil && len(reigniteQuests) > 0 {
		targetQuest = &reigniteQuests[0]
	}

	// Filter teams, challenges, participants, announcements
	var teams []QuestTeam
	for _, t := range reigniteTeams {
		if targetQuest != nil && t.QuestID == targetQuest.ID {
			teams = append(teams, t)
		}
	}

	var challenges []QuestChallenge
	for _, c := range reigniteChallenges {
		if targetQuest != nil && c.QuestID == targetQuest.ID {
			challenges = append(challenges, c)
		}
	}

	var participants []QuestParticipant
	for _, p := range reigniteParticipants {
		if targetQuest != nil && p.QuestID == targetQuest.ID {
			participants = append(participants, p)
		}
	}

	var announcements []QuestAnnouncement
	for _, a := range reigniteAnnouncements {
		if targetQuest != nil && a.QuestID == targetQuest.ID {
			announcements = append(announcements, a)
		}
	}

	response := map[string]any{
		"quest":         targetQuest,
		"teams":         teams,
		"challenges":    challenges,
		"participants":  participants,
		"concepts":      reigniteConcepts,
		"scores":        reigniteScores,
		"announcements": announcements,
	}

	json.NewEncoder(w).Encode(response)
}

// HandleQuestTeams handles /quests/teams
func HandleQuestTeams(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	if r.Method == http.MethodGet {
		var list []QuestTeam
		for _, t := range reigniteTeams {
			if t.QuestID == questId {
				list = append(list, t)
			}
		}
		json.NewEncoder(w).Encode(list)
		return
	}

	if r.Method == http.MethodPut || r.Method == http.MethodPost {
		var payload struct {
			ID         string `json:"id"`
			Name       string `json:"name"`
			CustomName string `json:"custom_name"`
			Motto      string `json:"motto"`
			Color      string `json:"color"`
			Logo       string `json:"logo"`
			CaptainID  string `json:"captain_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}

		for i := range reigniteTeams {
			if reigniteTeams[i].ID == payload.ID {
				if payload.Name != "" {
					reigniteTeams[i].Name = payload.Name
				}
				if payload.CustomName != "" {
					reigniteTeams[i].CustomName = payload.CustomName
				}
				if payload.Motto != "" {
					reigniteTeams[i].Motto = payload.Motto
				}
				if payload.Color != "" {
					reigniteTeams[i].Color = payload.Color
				}
				if payload.Logo != "" {
					reigniteTeams[i].Logo = payload.Logo
				}
				if payload.CaptainID != "" {
					reigniteTeams[i].CaptainID = payload.CaptainID
				}
				json.NewEncoder(w).Encode(reigniteTeams[i])
				return
			}
		}
		http.Error(w, `{"error":"Team not found"}`, http.StatusNotFound)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestParticipants handles /quests/participants
func HandleQuestParticipants(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	if r.Method == http.MethodGet {
		teamId := r.URL.Query().Get("team_id")
		var list []QuestParticipant
		for _, p := range reigniteParticipants {
			if p.QuestID == questId && (teamId == "" || p.TeamID == teamId) {
				list = append(list, p)
			}
		}
		json.NewEncoder(w).Encode(list)
		return
	}

	if r.Method == http.MethodPost {
		var payload struct {
			QuestID    string `json:"quest_id"`
			TeamID     string `json:"team_id"`
			UserID     string `json:"user_id"`
			UserName   string `json:"user_name"`
			UserEmail  string `json:"user_email"`
			Department string `json:"department"`
			Avatar     string `json:"avatar"`
			Role       string `json:"role"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		if payload.QuestID == "" {
			payload.QuestID = questId
		}

		// Remove user if previously assigned
		var filtered []QuestParticipant
		for _, p := range reigniteParticipants {
			if !(p.QuestID == payload.QuestID && p.UserID == payload.UserID) {
				filtered = append(filtered, p)
			}
		}
		reigniteParticipants = filtered

		newP := QuestParticipant{
			ID:         fmt.Sprintf("part-%d", time.Now().UnixNano()),
			QuestID:    payload.QuestID,
			TenantSlug: getQuestTenant(r),
			TeamID:     payload.TeamID,
			UserID:     payload.UserID,
			UserName:   payload.UserName,
			UserEmail:  payload.UserEmail,
			Department: payload.Department,
			Avatar:     payload.Avatar,
			Role:       payload.Role,
			Status:     "ACTIVE",
			JoinedAt:   time.Now(),
		}
		if newP.Avatar == "" {
			newP.Avatar = "/character1.jpg"
		}
		if newP.Role == "" {
			newP.Role = "member"
		}

		reigniteParticipants = append(reigniteParticipants, newP)
		updateTeamMemberCounts(payload.QuestID)

		json.NewEncoder(w).Encode(newP)
		return
	}

	if r.Method == http.MethodDelete {
		userId := r.URL.Query().Get("user_id")
		teamId := r.URL.Query().Get("team_id")
		var filtered []QuestParticipant
		for _, p := range reigniteParticipants {
			if !(p.QuestID == questId && (userId == "" || p.UserID == userId) && (teamId == "" || p.TeamID == teamId)) {
				filtered = append(filtered, p)
			}
		}
		reigniteParticipants = filtered
		updateTeamMemberCounts(questId)

		json.NewEncoder(w).Encode(map[string]string{"status": "removed"})
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestAutoAssign handles POST /quests/participants/auto-assign
// Smart 1-click cross-department auto-balance of 60 staff members into 6 teams
func HandleQuestAutoAssign(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	tenant := getQuestTenant(r)
	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	// 1. Fetch live staff pool for tenant
	staffPool := getFallbackUsers()
	if len(staffPool) == 0 {
		http.Error(w, `{"error":"No staff members found in tenant directory"}`, http.StatusBadRequest)
		return
	}

	// Filter active staff
	var eligible []User
	for _, u := range staffPool {
		if u.Role == "employee" || u.Role == "manager" || u.Role == "accountant" {
			eligible = append(eligible, u)
		}
	}
	if len(eligible) < 6 {
		eligible = staffPool
	}

	if len(eligible) > 60 {
		eligible = eligible[:60]
	}

	// 2. Group by department for cross-functional distribution
	deptMap := make(map[string][]User)
	for _, u := range eligible {
		d := u.Department
		if d == "" {
			d = "General"
		}
		deptMap[d] = append(deptMap[d], u)
	}

	var interleaved []User
	for len(interleaved) < len(eligible) {
		for dept, users := range deptMap {
			if len(users) > 0 {
				interleaved = append(interleaved, users[0])
				deptMap[dept] = users[1:]
			}
		}
	}

	// 3. Distribute round-robin into the 6 teams
	var newParticipants []QuestParticipant
	teamIDs := []string{"team-1", "team-2", "team-3", "team-4", "team-5", "team-6"}

	for idx, u := range interleaved {
		teamID := teamIDs[idx%len(teamIDs)]
		role := "member"
		if idx < len(teamIDs) {
			role = "captain"
		}

		avatar := u.Avatar
		if avatar == "" {
			avatar = fmt.Sprintf("/character%d.jpg", (idx%20)+1)
		}

		newParticipants = append(newParticipants, QuestParticipant{
			ID:         fmt.Sprintf("part-%d-%s", time.Now().Unix(), u.ID),
			QuestID:    questId,
			TenantSlug: tenant,
			TeamID:     teamID,
			UserID:     u.ID,
			UserName:   u.Name,
			UserEmail:  u.Email,
			Department: u.Department,
			Avatar:     avatar,
			Role:       role,
			Status:     "ACTIVE",
			JoinedAt:   time.Now(),
		})
	}

	reigniteParticipants = newParticipants
	updateTeamMemberCounts(questId)

	json.NewEncoder(w).Encode(map[string]any{
		"status":       "SUCCESS",
		"message":      fmt.Sprintf("Successfully auto-distributed %d staff members across 6 balanced teams!", len(newParticipants)),
		"participants": reigniteParticipants,
		"teams":        reigniteTeams,
	})
}

func updateTeamMemberCounts(questId string) {
	for i := range reigniteTeams {
		if reigniteTeams[i].QuestID == questId {
			count := 0
			captainId := ""
			for _, p := range reigniteParticipants {
				if p.QuestID == questId && p.TeamID == reigniteTeams[i].ID {
					count++
					if p.Role == "captain" {
						captainId = p.UserID
					}
				}
			}
			reigniteTeams[i].MemberCount = count
			if captainId != "" {
				reigniteTeams[i].CaptainID = captainId
			}
		}
	}
}

// HandleQuestChallenges handles /quests/challenges
func HandleQuestChallenges(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	if r.Method == http.MethodGet {
		var list []QuestChallenge
		for _, c := range reigniteChallenges {
			if c.QuestID == questId {
				list = append(list, c)
			}
		}
		json.NewEncoder(w).Encode(list)
		return
	}

	if r.Method == http.MethodPut {
		var payload struct {
			ID     string `json:"id"`
			Status string `json:"status"` // LOCKED, OPEN, IN_PROGRESS, SUBMITTED, VERIFIED, COMPLETED
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}

		for i := range reigniteChallenges {
			if reigniteChallenges[i].ID == payload.ID {
				reigniteChallenges[i].Status = payload.Status
				json.NewEncoder(w).Encode(reigniteChallenges[i])
				return
			}
		}
		http.Error(w, `{"error":"Challenge not found"}`, http.StatusNotFound)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestConcepts handles /quests/concepts
func HandleQuestConcepts(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(reigniteConcepts)
		return
	}

	if r.Method == http.MethodPost {
		var payload QuestConcept
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		payload.ID = fmt.Sprintf("cpt-%d", time.Now().Unix())
		if payload.QuestID == "" {
			payload.QuestID = questId
		}
		payload.TenantSlug = getQuestTenant(r)
		payload.Status = "PENDING"
		payload.CreatedAt = time.Now()

		reigniteConcepts = append([]QuestConcept{payload}, reigniteConcepts...)
		json.NewEncoder(w).Encode(payload)
		return
	}

	if r.Method == http.MethodPut {
		var payload struct {
			ID       string `json:"id"`
			Status   string `json:"status"` // APPROVED, REJECTED
			LockedBy string `json:"locked_by"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}

		for i := range reigniteConcepts {
			if reigniteConcepts[i].ID == payload.ID {
				reigniteConcepts[i].Status = payload.Status
				reigniteConcepts[i].LockedBy = payload.LockedBy
				json.NewEncoder(w).Encode(reigniteConcepts[i])
				return
			}
		}
		http.Error(w, `{"error":"Concept not found"}`, http.StatusNotFound)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestScores handles /quests/scores (Awards points, recalculates leaderboard, logs audit trail)
func HandleQuestScores(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(reigniteScores)
		return
	}

	if r.Method == http.MethodPost {
		var payload struct {
			QuestID       string `json:"quest_id"`
			ChallengeID   string `json:"challenge_id"`
			ChallengeName string `json:"challenge_name"`
			TeamID        string `json:"team_id"`
			TeamName      string `json:"team_name"`
			Points        int    `json:"points"`
			MaxPoints     int    `json:"max_points"`
			Reason        string `json:"reason"`
			ScoredBy      string `json:"scored_by"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		if payload.QuestID == "" {
			payload.QuestID = questId
		}

		prevScore := 0
		var existingScoreIdx = -1
		for i, s := range reigniteScores {
			if s.QuestID == payload.QuestID && s.ChallengeID == payload.ChallengeID && s.TeamID == payload.TeamID {
				prevScore = s.Points
				existingScoreIdx = i
				break
			}
		}

		newScoreEntry := QuestScore{
			ID:            fmt.Sprintf("scr-%d", time.Now().UnixNano()),
			QuestID:       payload.QuestID,
			TenantSlug:    getQuestTenant(r),
			ChallengeID:   payload.ChallengeID,
			ChallengeName: payload.ChallengeName,
			TeamID:        payload.TeamID,
			TeamName:      payload.TeamName,
			Points:        payload.Points,
			MaxPoints:     payload.MaxPoints,
			ScoredBy:      payload.ScoredBy,
			Reason:        payload.Reason,
			Source:        "FACILITATOR_PUBLISH",
			Status:        "VALID",
			CreatedAt:     time.Now(),
		}

		if existingScoreIdx >= 0 {
			reigniteScores[existingScoreIdx] = newScoreEntry
		} else {
			reigniteScores = append(reigniteScores, newScoreEntry)
		}

		auditEntry := QuestScoreAudit{
			ID:            fmt.Sprintf("aud-%d", time.Now().UnixNano()),
			QuestID:       payload.QuestID,
			TenantSlug:    getQuestTenant(r),
			ChallengeID:   payload.ChallengeID,
			TeamID:        payload.TeamID,
			PreviousScore: prevScore,
			NewScore:      payload.Points,
			Reason:        payload.Reason,
			ModifiedBy:    payload.ScoredBy,
			CreatedAt:     time.Now(),
		}
		reigniteScoreAudits = append([]QuestScoreAudit{auditEntry}, reigniteScoreAudits...)

		recalculateLeaderboard(payload.QuestID)

		json.NewEncoder(w).Encode(map[string]any{
			"status":      "SUCCESS",
			"score":       newScoreEntry,
			"audit":       auditEntry,
			"leaderboard": reigniteTeams,
		})
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

func recalculateLeaderboard(questId string) {
	teamPointsMap := make(map[string]int)
	for _, s := range reigniteScores {
		if s.QuestID == questId && s.Status == "VALID" {
			teamPointsMap[s.TeamID] += s.Points
		}
	}

	for i := range reigniteTeams {
		if reigniteTeams[i].QuestID == questId {
			reigniteTeams[i].TotalPoints = teamPointsMap[reigniteTeams[i].ID]
		}
	}

	sort.Slice(reigniteTeams, func(i, j int) bool {
		return reigniteTeams[i].TotalPoints > reigniteTeams[j].TotalPoints
	})

	for r := range reigniteTeams {
		reigniteTeams[r].Rank = r + 1
	}
}

// HandleQuestScoreAudit handles GET /quests/scores/audit
func HandleQuestScoreAudit(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.RLock()
	defer questMu.RUnlock()

	questId := r.URL.Query().Get("quest_id")
	var list []QuestScoreAudit
	for _, a := range reigniteScoreAudits {
		if questId == "" || a.QuestID == questId {
			list = append(list, a)
		}
	}
	json.NewEncoder(w).Encode(list)
}

// HandleQuestScoreboard handles GET /quests/scoreboard (Arena TV / Public View)
func HandleQuestScoreboard(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.RLock()
	defer questMu.RUnlock()

	questId := r.URL.Query().Get("quest_id")
	var targetQuest *QuestInstance
	for _, q := range reigniteQuests {
		if questId == "" || q.ID == questId {
			targetQuest = &q
			break
		}
	}
	if targetQuest == nil && len(reigniteQuests) > 0 {
		targetQuest = &reigniteQuests[0]
	}

	var sortedTeams []QuestTeam
	for _, t := range reigniteTeams {
		if targetQuest != nil && t.QuestID == targetQuest.ID {
			sortedTeams = append(sortedTeams, t)
		}
	}
	sort.Slice(sortedTeams, func(i, j int) bool {
		return sortedTeams[i].TotalPoints > sortedTeams[j].TotalPoints
	})
	for i := range sortedTeams {
		sortedTeams[i].Rank = i + 1
	}

	var activeChallenge *QuestChallenge
	for _, c := range reigniteChallenges {
		if c.Status == "OPEN" || c.Status == "IN_PROGRESS" {
			activeChallenge = &c
			break
		}
	}

	response := map[string]any{
		"quest":            targetQuest,
		"leaderboard":      sortedTeams,
		"active_challenge": activeChallenge,
		"announcements":    reigniteAnnouncements,
		"scores":           reigniteScores,
		"last_updated":     time.Now().Format(time.RFC3339),
	}

	json.NewEncoder(w).Encode(response)
}

// HandleQuestAnnouncements handles /quests/announcements
func HandleQuestAnnouncements(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(reigniteAnnouncements)
		return
	}

	if r.Method == http.MethodPost {
		var newAnc QuestAnnouncement
		if err := json.NewDecoder(r.Body).Decode(&newAnc); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		newAnc.ID = fmt.Sprintf("anc-%d", time.Now().Unix())
		newAnc.PublishedAt = time.Now()
		newAnc.TenantSlug = getQuestTenant(r)

		reigniteAnnouncements = append([]QuestAnnouncement{newAnc}, reigniteAnnouncements...)
		json.NewEncoder(w).Encode(newAnc)
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

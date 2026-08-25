package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
)

// QuestPrize Model
type QuestPrize struct {
	ID          string `json:"id"`
	QuestID     string `json:"quest_id"`
	TenantSlug  string `json:"tenant_slug"`
	Rank        int    `json:"rank,omitempty"`
	Title       string `json:"title"`
	AwardType   string `json:"award_type"` // CASH, TROPHY, GIFT, CERTIFICATE
	Amount      string `json:"amount"`
	Description string `json:"description"`
	Icon        string `json:"icon,omitempty"`
	OrderIndex  int    `json:"order_index"`
}

// QuestInstance Model
type QuestInstance struct {
	ID                     string              `json:"id"`
	TenantSlug             string              `json:"tenant_slug"`
	Name                   string              `json:"name"`
	Slug                   string              `json:"slug"`
	Description            string              `json:"description"`
	CoverImage             string              `json:"cover_image"`
	Status                 string              `json:"status"` // DRAFT, ACTIVE, COMPLETED, ARCHIVED
	GrandPrize             string              `json:"grand_prize"`
	Currency               string              `json:"currency,omitempty"`
	Prizes                 []QuestPrize        `json:"prizes,omitempty"`
	PrizesJson             string              `json:"prizes_json,omitempty"`
	TotalMaxPoints         int                 `json:"total_max_points"`
	Location               string              `json:"location"`
	StartsAt               string              `json:"starts_at"`
	EndsAt                 string              `json:"ends_at"`
	ParticipationType      string              `json:"participation_type,omitempty"`
	AutoBalance            bool                `json:"auto_balance,omitempty"`
	EnableStageTV          bool                `json:"enable_stage_tv,omitempty"`
	AllowManualAdjustments bool                `json:"allow_manual_adjustments,omitempty"`
	PrimaryColor           string              `json:"primary_color,omitempty"`
	AccentColor            string              `json:"accent_color,omitempty"`
	ScoringMode            string              `json:"scoring_mode,omitempty"`
	ConceptLockEnabled     bool                `json:"concept_lock_enabled,omitempty"`
	Teams                  []QuestTeam         `json:"teams,omitempty"`
	Challenges             []QuestChallenge    `json:"challenges,omitempty"`
	Schedule               []QuestScheduleItem `json:"schedule,omitempty"`
	CreatedBy              string              `json:"created_by"`
	CreatedAt              time.Time           `json:"created_at"`
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
	Initial     string `json:"initial,omitempty"`
	Motto       string `json:"motto"`
	TotalPoints int    `json:"total_points"`
	Rank        int    `json:"rank"`
	CaptainID   string `json:"captain_id,omitempty"`
	MemberCount int    `json:"member_count"`
	Status      string `json:"status,omitempty"` // ACTIVE, INACTIVE
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

// QuestScheduleItem Model (Configurable Event Schedule / Calendar Timeline)
type QuestScheduleItem struct {
	ID               string    `json:"id"`
	QuestID          string    `json:"quest_id"`
	TenantSlug       string    `json:"tenant_slug"`
	Day              string    `json:"day"` // Day 1, Day 2, Day 3
	StartTime        string    `json:"start_time"`
	EndTime          string    `json:"end_time"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	Category         string    `json:"category"` // Arrival, Ceremony, Challenge, Meal, Sports, Awards
	Location         string    `json:"location"`
	ChallengeID      string    `json:"challenge_id,omitempty"`
	MaxScore         int       `json:"max_score,omitempty"`
	FacilitatorNotes string    `json:"facilitator_notes,omitempty"`
	Status           string    `json:"status"` // UPCOMING, LIVE, COMPLETED
	OrderIndex       int       `json:"order_index"`
	CreatedAt        time.Time `json:"created_at"`
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
			ID:                     "qst-reignite-2026",
			TenantSlug:             "neweratransports",
			Name:                   "REIGNITE 2026: Team Quest & Championship",
			Slug:                   "reignite-2026",
			Description:            "Annual enterprise retreat, creative innovation pitch, trivia knowledge wars, and physical agility championship.",
			CoverImage:             "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
			Status:                 "ACTIVE",
			GrandPrize:             "₦500,000",
			Currency:               "NGN",
			TotalMaxPoints:         850,
			Location:               "Epe Resort & Conference Centre, Lagos",
			StartsAt:               "2026-08-25T09:00:00.000Z",
			EndsAt:                 "2026-08-27T18:00:00.000Z",
			ParticipationType:      "BOTH",
			AutoBalance:            true,
			EnableStageTV:          true,
			AllowManualAdjustments: true,
			PrimaryColor:           "#1A56DB",
			AccentColor:            "#F59E0B",
			ScoringMode:            "AUTOMATIC_WITH_JUDGE_OVERRIDE",
			ConceptLockEnabled:     true,
			CreatedBy:              "HR Directorate",
			CreatedAt:              time.Now(),
		},
	}

	reignitePrizes = []QuestPrize{
		{
			ID:          "prz-1",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Rank:        1,
			Title:       "1st Place Grand Championship Trophy & Cash",
			AwardType:   "CASH",
			Amount:      "₦500,000",
			Description: "Awarded to the squad with the highest cumulative championship points across all 11 quests.",
			Icon:        "🏆",
			OrderIndex:  1,
		},
		{
			ID:          "prz-2",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Rank:        2,
			Title:       "2nd Place Silver Podium Award",
			AwardType:   "CASH",
			Amount:      "₦250,000",
			Description: "Runner-up squad award for high performance and sportsmanship.",
			Icon:        "🥈",
			OrderIndex:  2,
		},
		{
			ID:          "prz-3",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Rank:        3,
			Title:       "3rd Place Bronze Podium Award",
			AwardType:   "CASH",
			Amount:      "₦100,000",
			Description: "Bronze medal championship podium squad prize.",
			Icon:        "🥉",
			OrderIndex:  3,
		},
		{
			ID:          "prz-4",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Rank:        0,
			Title:       "Best Theme Identity & Team Spirit",
			AwardType:   "CASH",
			Amount:      "₦50,000",
			Description: "Special award for the most energetic chant, banner, and synchronized team identity.",
			Icon:        "🔥",
			OrderIndex:  4,
		},
		{
			ID:          "prz-5",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Rank:        0,
			Title:       "Championship MVP (Most Valuable Performer)",
			AwardType:   "CASH",
			Amount:      "₦25,000",
			Description: "Individual recognition award for exceptional leadership, agility, and participation.",
			Icon:        "⭐",
			OrderIndex:  5,
		},
	}

	reigniteTeams = []QuestTeam{
		{
			ID:          "team-a",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team A",
			CustomName:  "Alpha (Blue Eagles)",
			Initial:     "A",
			Slug:        "team-a",
			Logo:        "🦅",
			Color:       "#1A56DB",
			Motto:       "Swift, Strategic, Unstoppable",
			TotalPoints: 0,
			Rank:        1,
			MemberCount: 0,
			Status:      "ACTIVE",
		},
		{
			ID:          "team-b",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team B",
			CustomName:  "Bravo (Red Vipers)",
			Initial:     "B",
			Slug:        "team-b",
			Logo:        "🐍",
			Color:       "#EF4444",
			Motto:       "Relentless Speed & Precision",
			TotalPoints: 0,
			Rank:        2,
			MemberCount: 0,
			Status:      "ACTIVE",
		},
		{
			ID:          "team-c",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team C",
			CustomName:  "Charlie (Gold Titans)",
			Initial:     "C",
			Slug:        "team-c",
			Logo:        "⚡",
			Color:       "#F59E0B",
			Motto:       "Power, Intellect, Victory",
			TotalPoints: 0,
			Rank:        3,
			MemberCount: 0,
			Status:      "ACTIVE",
		},
		{
			ID:          "team-d",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team D",
			CustomName:  "Delta (Green Lions)",
			Initial:     "D",
			Slug:        "team-d",
			Logo:        "🦁",
			Color:       "#10B981",
			Motto:       "Courage in Every Stride",
			TotalPoints: 0,
			Rank:        4,
			MemberCount: 0,
			Status:      "ACTIVE",
		},
		{
			ID:          "team-e",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team E",
			CustomName:  "Echo (Silver Wolves)",
			Initial:     "E",
			Slug:        "team-e",
			Logo:        "🐺",
			Color:       "#64748B",
			Motto:       "Silent, United, Lethal",
			TotalPoints: 0,
			Rank:        5,
			MemberCount: 0,
			Status:      "ACTIVE",
		},
		{
			ID:          "team-f",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team F",
			CustomName:  "Foxtrot (Iron Rhinos)",
			Initial:     "F",
			Slug:        "team-f",
			Logo:        "🦏",
			Color:       "#8B5CF6",
			Motto:       "Unbreakable Resolve",
			TotalPoints: 0,
			Rank:        6,
			MemberCount: 0,
			Status:      "ACTIVE",
		},
		{
			ID:          "team-g",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team G",
			CustomName:  "Golf (Copper Hawks)",
			Initial:     "G",
			Slug:        "team-g",
			Logo:        "🦅",
			Color:       "#D97706",
			Motto:       "Precision from Above",
			TotalPoints: 0,
			Rank:        7,
			MemberCount: 0,
			Status:      "INACTIVE",
		},
		{
			ID:          "team-h",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team H",
			CustomName:  "Hotel (Platinum Panthers)",
			Initial:     "H",
			Slug:        "team-h",
			Logo:        "🐆",
			Color:       "#475569",
			Motto:       "Prowling with Purpose",
			TotalPoints: 0,
			Rank:        8,
			MemberCount: 0,
			Status:      "INACTIVE",
		},
		{
			ID:          "team-i",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team I",
			CustomName:  "India (Diamond Sharks)",
			Initial:     "I",
			Slug:        "team-i",
			Logo:        "🦈",
			Color:       "#06B6D4",
			Motto:       "Unstoppable Force",
			TotalPoints: 0,
			Rank:        9,
			MemberCount: 0,
			Status:      "INACTIVE",
		},
		{
			ID:          "team-j",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Name:        "Team J",
			CustomName:  "Juliet (Emerald Dragons)",
			Initial:     "J",
			Slug:        "team-j",
			Logo:        "🐉",
			Color:       "#059669",
			Motto:       "Fiery Spirit & Grace",
			TotalPoints: 0,
			Rank:        10,
			MemberCount: 0,
			Status:      "INACTIVE",
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

	// 21 Pre-seeded Itinerary Schedule Items for REIGNITE 2026
	reigniteSchedule = []QuestScheduleItem{
		// DAY 1
		{
			ID:          "sch-d1-01",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 1",
			StartTime:   "09:00 AM",
			EndTime:     "11:00 AM",
			Title:       "Executive Arrival & Hotel Check-in",
			Description: "Delegates arrive at Epe Resort & Conference Centre, pick up badge credentials and retreat kits.",
			Category:    "Arrival",
			Location:    "Resort Lobby & Reception",
			Status:      "COMPLETED",
			OrderIndex:  1,
			CreatedAt:   time.Now(),
		},
		{
			ID:          "sch-d1-02",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 1",
			StartTime:   "11:30 AM",
			EndTime:     "01:00 PM",
			Title:       "Welcome Address & Opening Ceremony",
			Description: "Opening remarks by MD/CEO, unveiling of the REIGNITE 2026 Theme, rules, and grand ₦500,000 prize.",
			Category:    "Ceremony",
			Location:    "Main Conference Auditorium",
			Status:      "COMPLETED",
			OrderIndex:  2,
			CreatedAt:   time.Now(),
		},
		{
			ID:          "sch-d1-03",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 1",
			StartTime:   "01:00 PM",
			EndTime:     "02:30 PM",
			Title:       "Networking Lunch & Squad Formations",
			Description: "Delegates break into assigned 10-person squads across 6 tables for strategy and bonding.",
			Category:    "Meal",
			Location:    "Dining Pavilion",
			Status:      "COMPLETED",
			OrderIndex:  3,
			CreatedAt:   time.Now(),
		},
		{
			ID:               "sch-d1-04",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 1",
			StartTime:        "03:00 PM",
			EndTime:          "04:30 PM",
			Title:            "Quest 1: Team Identity Presentation",
			Description:      "Each team takes the stage to present their custom Name, Motto, Pose, and Team Chant.",
			Category:         "Challenge",
			Location:         "Outdoor Amphitheatre",
			ChallengeID:      "chl-day1-identity",
			MaxScore:         50,
			FacilitatorNotes: "5 minutes per team. Judged across creativity, teamwork, energy, and delivery.",
			Status:           "LIVE",
			OrderIndex:       4,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d1-05",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 1",
			StartTime:        "05:00 PM",
			EndTime:          "06:30 PM",
			Title:            "Quest 2: Who Are We? (5 Incredible Things)",
			Description:      "Every team member shares 5 unique facts about their journey and how the company shaped them.",
			Category:         "Challenge",
			Location:         "Outdoor Amphitheatre",
			ChallengeID:      "chl-day1-who-are-we",
			MaxScore:         50,
			FacilitatorNotes: "Participation engine: 100% active member sharing awards maximum 50 points.",
			Status:           "UPCOMING",
			OrderIndex:       5,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d1-06",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 1",
			StartTime:        "07:30 PM",
			EndTime:          "10:00 PM",
			Title:            "Quest 3: Card Games & Karaoke Fun",
			Description:      "Evening bonding featuring interactive board/card games, karaoke battles, and social connection.",
			Category:         "Challenge",
			Location:         "Poolside Lounge",
			ChallengeID:      "chl-day1-games",
			MaxScore:         50,
			FacilitatorNotes: "Spirit & sportsmanship rubric scoring.",
			Status:           "UPCOMING",
			OrderIndex:       6,
			CreatedAt:        time.Now(),
		},

		// DAY 2
		{
			ID:          "sch-d2-01",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 2",
			StartTime:   "07:30 AM",
			EndTime:     "08:30 AM",
			Title:       "Energy Breakfast & Daily Briefing",
			Description: "Full breakfast buffet and facilitator announcements for Day 2 schedule.",
			Category:    "Meal",
			Location:    "Dining Pavilion",
			Status:      "UPCOMING",
			OrderIndex:  7,
			CreatedAt:   time.Now(),
		},
		{
			ID:               "sch-d2-02",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 2",
			StartTime:        "09:00 AM",
			EndTime:          "09:30 AM",
			Title:            "Core Challenge Concept Registration Deadline",
			Description:      "Team captains must register and lock their 10-minute performance concepts to avoid topic duplication.",
			Category:         "Ceremony",
			Location:         "Facilitator Command Desk",
			FacilitatorNotes: "Duplicate lock enforced by Chief Facilitator.",
			Status:           "UPCOMING",
			OrderIndex:       8,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d2-03",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 2",
			StartTime:        "10:00 AM",
			EndTime:          "01:00 PM",
			Title:            "Quest 4: REIGNITE — The Core Challenge",
			Description:      "10-minute theatrical, musical, or innovation presentations bringing the REIGNITE theme to life.",
			Category:         "Challenge",
			Location:         "Main Auditorium Stage",
			ChallengeID:      "chl-day2-core-challenge",
			MaxScore:         200,
			FacilitatorNotes: "6 rubric dimensions (40, 40, 30, 30, 30, 30 = 200 pts).",
			Status:           "UPCOMING",
			OrderIndex:       9,
			CreatedAt:        time.Now(),
		},
		{
			ID:          "sch-d2-04",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 2",
			StartTime:   "01:00 PM",
			EndTime:     "02:30 PM",
			Title:       "Power Lunch & Mid-Day Recharge",
			Description: "Buffet lunch, rest, and preparation for the afternoon agility and trivia rounds.",
			Category:    "Meal",
			Location:    "Dining Pavilion",
			Status:      "UPCOMING",
			OrderIndex:  10,
			CreatedAt:   time.Now(),
		},
		{
			ID:               "sch-d2-05",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 2",
			StartTime:        "03:00 PM",
			EndTime:          "04:00 PM",
			Title:            "Quest 5: Egg & Spoon Agility Race",
			Description:      "Fast-paced team balance relay requiring speed, coordination, and steady teamwork.",
			Category:         "Challenge",
			Location:         "Lawn Arena",
			ChallengeID:      "chl-day2-egg-race",
			MaxScore:         50,
			FacilitatorNotes: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
			Status:           "UPCOMING",
			OrderIndex:       11,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d2-06",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 2",
			StartTime:        "04:30 PM",
			EndTime:          "05:30 PM",
			Title:            "Quest 6: The Knowledge Quest (10 Questions)",
			Description:      "Objective corporate and industry knowledge test. Automated scoring via official answer key.",
			Category:         "Challenge",
			Location:         "Conference Hall",
			ChallengeID:      "chl-day2-quiz",
			MaxScore:         100,
			FacilitatorNotes: "10 questions × 10 points = 100 points maximum.",
			Status:           "UPCOMING",
			OrderIndex:       12,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d2-07",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 2",
			StartTime:        "06:00 PM",
			EndTime:          "07:00 PM",
			Title:            "Quest 7: Think Fast Rapid-Fire Round",
			Description:      "10 rapid-fire buzzer questions asked to all 6 teams simultaneously.",
			Category:         "Challenge",
			Location:         "Conference Hall",
			ChallengeID:      "chl-day2-think-fast",
			MaxScore:         50,
			FacilitatorNotes: "10 questions × 5 points = 50 points.",
			Status:           "UPCOMING",
			OrderIndex:       13,
			CreatedAt:        time.Now(),
		},
		{
			ID:          "sch-d2-08",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 2",
			StartTime:   "08:00 PM",
			EndTime:     "10:00 PM",
			Title:       "Dinner & Mid-Championship Standings Broadcast",
			Description: "Evening banquet and stage broadcast of Day 1 & Day 2 cumulative standings.",
			Category:    "Meal",
			Location:    "Grand Ballroom",
			Status:      "UPCOMING",
			OrderIndex:  14,
			CreatedAt:   time.Now(),
		},

		// DAY 3
		{
			ID:          "sch-d3-01",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 3",
			StartTime:   "07:30 AM",
			EndTime:     "08:30 AM",
			Title:       "Athletes' Warm-up & Light Breakfast",
			Description: "High-protein breakfast and team stretching before outdoor sports championship.",
			Category:    "Meal",
			Location:    "Sports Pavilion",
			Status:      "UPCOMING",
			OrderIndex:  15,
			CreatedAt:   time.Now(),
		},
		{
			ID:               "sch-d3-02",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 3",
			StartTime:        "09:00 AM",
			EndTime:          "10:30 AM",
			Title:            "Quest 8: Girls' Volleyball Championship",
			Description:      "Inter-squad women's volleyball tournament with group matches and finals.",
			Category:         "Sports",
			Location:         "Resort Sports Arena",
			ChallengeID:      "chl-day3-volleyball",
			MaxScore:         75,
			FacilitatorNotes: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
			Status:           "UPCOMING",
			OrderIndex:       16,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d3-03",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 3",
			StartTime:        "11:00 AM",
			EndTime:          "01:00 PM",
			Title:            "Quest 9: Corporate Football Championship",
			Description:      "Full inter-squad football tournament. Group stages, semi-finals, and championship final match.",
			Category:         "Sports",
			Location:         "Football Pitch",
			ChallengeID:      "chl-day3-football",
			MaxScore:         100,
			FacilitatorNotes: "Rank to points: 1st=100, 2nd=75, 3rd=60, 4th=45, 5th=30, 6th=20.",
			Status:           "UPCOMING",
			OrderIndex:       17,
			CreatedAt:        time.Now(),
		},
		{
			ID:          "sch-d3-04",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 3",
			StartTime:   "01:00 PM",
			EndTime:     "02:30 PM",
			Title:       "Champions Lunch & Rest Interval",
			Description: "Buffet lunch, rest, and warm-up for track relay and tug of war.",
			Category:    "Meal",
			Location:    "Dining Pavilion",
			Status:      "UPCOMING",
			OrderIndex:  18,
			CreatedAt:   time.Now(),
		},
		{
			ID:               "sch-d3-05",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 3",
			StartTime:        "03:00 PM",
			EndTime:          "04:00 PM",
			Title:            "Quest 10: 4×100m Track Relay Race",
			Description:      "Sprint track showdown featuring mixed gender relay runners.",
			Category:         "Sports",
			Location:         "Running Track",
			ChallengeID:      "chl-day3-relay",
			MaxScore:         50,
			FacilitatorNotes: "Rank to points: 1st=50, 2nd=40, 3rd=30, 4th=20, 5th=10, 6th=5.",
			Status:           "UPCOMING",
			OrderIndex:       19,
			CreatedAt:        time.Now(),
		},
		{
			ID:               "sch-d3-06",
			QuestID:          "qst-reignite-2026",
			TenantSlug:       "neweratransports",
			Day:              "Day 3",
			StartTime:        "04:30 PM",
			EndTime:          "05:30 PM",
			Title:            "Quest 11: Grand Tug of War Final",
			Description:      "The ultimate contest of endurance, grip, and team synergy.",
			Category:         "Sports",
			Location:         "Central Lawn Arena",
			ChallengeID:      "chl-day3-tug-of-war",
			MaxScore:         75,
			FacilitatorNotes: "Rank to points: 1st=75, 2nd=60, 3rd=45, 4th=30, 5th=20, 6th=10.",
			Status:           "UPCOMING",
			OrderIndex:       20,
			CreatedAt:        time.Now(),
		},
		{
			ID:          "sch-d3-07",
			QuestID:     "qst-reignite-2026",
			TenantSlug:  "neweratransports",
			Day:         "Day 3",
			StartTime:   "06:30 PM",
			EndTime:     "09:00 PM",
			Title:       "Gala Awards Dinner & ₦500,000 Grand Trophy Ceremony",
			Description: "Final banquet, leadership remarks, live scoreboard countdown, and trophy award to the Champion Squad.",
			Category:    "Awards",
			Location:    "Grand Ballroom",
			FacilitatorNotes: "Winner takes all: ₦500,000 Grand Prize.",
			Status:      "UPCOMING",
			OrderIndex:  21,
			CreatedAt:   time.Now(),
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
		if c, err := r.Cookie("tenant_slug"); err == nil && c.Value != "" {
			slug = strings.ToLower(strings.TrimSpace(c.Value))
		}
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
			if tenant == "" || tenant == "all" || q.TenantSlug == tenant {
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
		if newQuest.Currency == "" {
			newQuest.Currency = "NGN"
		}

		// Handle prizes if provided in payload
		if len(newQuest.Prizes) > 0 {
			for i, p := range newQuest.Prizes {
				if p.ID == "" {
					p.ID = fmt.Sprintf("prz-%s-%d", newQuest.ID, i+1)
				}
				p.QuestID = newQuest.ID
				p.TenantSlug = tenant
				if p.OrderIndex == 0 {
					p.OrderIndex = i + 1
				}
				newQuest.Prizes[i] = p
				reignitePrizes = append(reignitePrizes, p)
			}
			if b, err := json.Marshal(newQuest.Prizes); err == nil {
				newQuest.PrizesJson = string(b)
			}
		}

		// Handle teams if provided in payload
		if len(newQuest.Teams) > 0 {
			for i, t := range newQuest.Teams {
				if t.ID == "" {
					t.ID = fmt.Sprintf("team-%s-%d", newQuest.ID, i+1)
				}
				t.QuestID = newQuest.ID
				t.TenantSlug = tenant
				newQuest.Teams[i] = t
				reigniteTeams = append(reigniteTeams, t)
			}
		}

		// Handle challenges if provided in payload
		if len(newQuest.Challenges) > 0 {
			for i, c := range newQuest.Challenges {
				if c.ID == "" {
					c.ID = fmt.Sprintf("chl-%s-%d", newQuest.ID, i+1)
				}
				c.QuestID = newQuest.ID
				c.TenantSlug = tenant
				newQuest.Challenges[i] = c
				reigniteChallenges = append(reigniteChallenges, c)
			}
		}

		// Handle schedule if provided in payload
		if len(newQuest.Schedule) > 0 {
			for i, s := range newQuest.Schedule {
				if s.ID == "" {
					s.ID = fmt.Sprintf("sch-%s-%d", newQuest.ID, i+1)
				}
				s.QuestID = newQuest.ID
				s.TenantSlug = tenant
				s.OrderIndex = i + 1
				newQuest.Schedule[i] = s
				reigniteSchedule = append(reigniteSchedule, s)
			}
		}

		if db != nil {
			_, _ = db.Exec(`INSERT INTO QuestInstance (id, tenantSlug, name, slug, description, coverImage, status, grandPrize, currency, prizesJson, totalMaxPoints, location, startsAt, endsAt, participationType, autoBalance, enableStageTV, allowManualAdjustments, primaryColor, accentColor, scoringMode, conceptLockEnabled, createdBy)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), grandPrize=VALUES(grandPrize), currency=VALUES(currency), prizesJson=VALUES(prizesJson), totalMaxPoints=VALUES(totalMaxPoints), location=VALUES(location), startsAt=VALUES(startsAt), endsAt=VALUES(endsAt)`,
				newQuest.ID, newQuest.TenantSlug, newQuest.Name, newQuest.Slug, newQuest.Description, newQuest.CoverImage, newQuest.Status, newQuest.GrandPrize, newQuest.Currency, newQuest.PrizesJson, newQuest.TotalMaxPoints, newQuest.Location, newQuest.StartsAt, newQuest.EndsAt, newQuest.ParticipationType, newQuest.AutoBalance, newQuest.EnableStageTV, newQuest.AllowManualAdjustments, newQuest.PrimaryColor, newQuest.AccentColor, newQuest.ScoringMode, newQuest.ConceptLockEnabled, newQuest.CreatedBy)
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

	// Filter teams, challenges, participants, announcements, schedule, prizes
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

	var schedule []QuestScheduleItem
	for _, s := range reigniteSchedule {
		if targetQuest != nil && s.QuestID == targetQuest.ID {
			schedule = append(schedule, s)
		}
	}

	var prizes []QuestPrize
	for _, p := range reignitePrizes {
		if targetQuest != nil && p.QuestID == targetQuest.ID {
			prizes = append(prizes, p)
		}
	}

	response := map[string]any{
		"quest":         targetQuest,
		"teams":         teams,
		"challenges":    challenges,
		"schedule":      schedule,
		"prizes":        prizes,
		"participants":  participants,
		"concepts":      reigniteConcepts,
		"scores":        reigniteScores,
		"announcements": announcements,
	}

	json.NewEncoder(w).Encode(response)
}

// HandleQuestPrizes handles /quests/prizes (GET, POST, PUT, DELETE)
func HandleQuestPrizes(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	tenant := getQuestTenant(r)
	questID := r.URL.Query().Get("quest_id")
	if questID == "" && len(reigniteQuests) > 0 {
		questID = reigniteQuests[0].ID
	}

	switch r.Method {
	case http.MethodGet:
		var list []QuestPrize
		for _, p := range reignitePrizes {
			if (tenant == "all" || p.TenantSlug == tenant || p.TenantSlug == "neweratransports") &&
				(questID == "" || p.QuestID == questID) {
				list = append(list, p)
			}
		}
		json.NewEncoder(w).Encode(list)
		return

	case http.MethodPost:
		var newPrize QuestPrize
		if err := json.NewDecoder(r.Body).Decode(&newPrize); err != nil {
			http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
			return
		}
		if newPrize.ID == "" {
			newPrize.ID = fmt.Sprintf("prz-%d", time.Now().UnixNano())
		}
		if newPrize.QuestID == "" {
			newPrize.QuestID = questID
		}
		newPrize.TenantSlug = tenant
		reignitePrizes = append(reignitePrizes, newPrize)

		if db != nil {
			_, _ = db.Exec(`INSERT INTO QuestPrize (id, questId, tenantSlug, prizeRank, title, awardType, amount, description, icon, orderIndex)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
				ON DUPLICATE KEY UPDATE title=VALUES(title), awardType=VALUES(awardType), amount=VALUES(amount), description=VALUES(description), icon=VALUES(icon), orderIndex=VALUES(orderIndex)`,
				newPrize.ID, newPrize.QuestID, newPrize.TenantSlug, newPrize.Rank, newPrize.Title, newPrize.AwardType, newPrize.Amount, newPrize.Description, newPrize.Icon, newPrize.OrderIndex)
		}

		json.NewEncoder(w).Encode(newPrize)
		return

	case http.MethodPut:
		var updatedPrize QuestPrize
		if err := json.NewDecoder(r.Body).Decode(&updatedPrize); err != nil {
			http.Error(w, `{"error":"Invalid request payload"}`, http.StatusBadRequest)
			return
		}
		found := false
		for i, p := range reignitePrizes {
			if p.ID == updatedPrize.ID {
				if updatedPrize.Title != "" {
					reignitePrizes[i].Title = updatedPrize.Title
				}
				if updatedPrize.Amount != "" {
					reignitePrizes[i].Amount = updatedPrize.Amount
				}
				if updatedPrize.AwardType != "" {
					reignitePrizes[i].AwardType = updatedPrize.AwardType
				}
				if updatedPrize.Description != "" {
					reignitePrizes[i].Description = updatedPrize.Description
				}
				if updatedPrize.Icon != "" {
					reignitePrizes[i].Icon = updatedPrize.Icon
				}
				if updatedPrize.Rank >= 0 {
					reignitePrizes[i].Rank = updatedPrize.Rank
				}
				found = true
				break
			}
		}
		if db != nil {
			_, _ = db.Exec(`UPDATE QuestPrize SET title=?, awardType=?, amount=?, description=?, icon=?, prizeRank=? WHERE id=?`,
				updatedPrize.Title, updatedPrize.AwardType, updatedPrize.Amount, updatedPrize.Description, updatedPrize.Icon, updatedPrize.Rank, updatedPrize.ID)
		}
		if !found {
			http.Error(w, `{"error":"Prize not found"}`, http.StatusNotFound)
			return
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return

	case http.MethodDelete:
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, `{"error":"Missing prize id"}`, http.StatusBadRequest)
			return
		}
		var updated []QuestPrize
		for _, p := range reignitePrizes {
			if p.ID != id {
				updated = append(updated, p)
			}
		}
		reignitePrizes = updated
		if db != nil {
			_, _ = db.Exec(`DELETE FROM QuestPrize WHERE id=?`, id)
		}
		json.NewEncoder(w).Encode(map[string]any{"success": true})
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
}

// HandleQuestSchedule handles /quests/schedule (GET, POST, PUT, DELETE)
func HandleQuestSchedule(w http.ResponseWriter, r *http.Request) {
	EnsureQuestTables()
	w.Header().Set("Content-Type", "application/json")
	questMu.Lock()
	defer questMu.Unlock()

	questId := r.URL.Query().Get("quest_id")
	if questId == "" && len(reigniteQuests) > 0 {
		questId = reigniteQuests[0].ID
	}

	if r.Method == http.MethodGet {
		day := r.URL.Query().Get("day")
		var list []QuestScheduleItem
		for _, s := range reigniteSchedule {
			if s.QuestID == questId && (day == "" || s.Day == day) {
				list = append(list, s)
			}
		}
		sort.Slice(list, func(i, j int) bool {
			return list[i].OrderIndex < list[j].OrderIndex
		})
		json.NewEncoder(w).Encode(list)
		return
	}

	if r.Method == http.MethodPost {
		var newItem QuestScheduleItem
		if err := json.NewDecoder(r.Body).Decode(&newItem); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}
		if newItem.ID == "" {
			newItem.ID = fmt.Sprintf("sch-%d", time.Now().UnixNano())
		}
		if newItem.QuestID == "" {
			newItem.QuestID = questId
		}
		newItem.TenantSlug = getQuestTenant(r)
		newItem.CreatedAt = time.Now()
		if newItem.Status == "" {
			newItem.Status = "UPCOMING"
		}
		if newItem.OrderIndex == 0 {
			newItem.OrderIndex = len(reigniteSchedule) + 1
		}

		reigniteSchedule = append(reigniteSchedule, newItem)
		json.NewEncoder(w).Encode(newItem)
		return
	}

	if r.Method == http.MethodPut {
		var payload QuestScheduleItem
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, `{"error":"Invalid payload"}`, http.StatusBadRequest)
			return
		}

		for i := range reigniteSchedule {
			if reigniteSchedule[i].ID == payload.ID {
				if payload.Title != "" {
					reigniteSchedule[i].Title = payload.Title
				}
				if payload.Description != "" {
					reigniteSchedule[i].Description = payload.Description
				}
				if payload.StartTime != "" {
					reigniteSchedule[i].StartTime = payload.StartTime
				}
				if payload.EndTime != "" {
					reigniteSchedule[i].EndTime = payload.EndTime
				}
				if payload.Day != "" {
					reigniteSchedule[i].Day = payload.Day
				}
				if payload.Location != "" {
					reigniteSchedule[i].Location = payload.Location
				}
				if payload.Category != "" {
					reigniteSchedule[i].Category = payload.Category
				}
				if payload.Status != "" {
					reigniteSchedule[i].Status = payload.Status
				}
				if payload.FacilitatorNotes != "" {
					reigniteSchedule[i].FacilitatorNotes = payload.FacilitatorNotes
				}
				json.NewEncoder(w).Encode(reigniteSchedule[i])
				return
			}
		}
		http.Error(w, `{"error":"Schedule item not found"}`, http.StatusNotFound)
		return
	}

	if r.Method == http.MethodDelete {
		id := r.URL.Query().Get("id")
		var filtered []QuestScheduleItem
		for _, s := range reigniteSchedule {
			if s.ID != id {
				filtered = append(filtered, s)
			}
		}
		reigniteSchedule = filtered
		json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
		return
	}

	http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
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

	// 3. Distribute round-robin into the active teams
	var newParticipants []QuestParticipant
	var teamIDs []string
	for _, t := range reigniteTeams {
		if t.QuestID == questId && (t.Status == "" || t.Status == "ACTIVE") {
			teamIDs = append(teamIDs, t.ID)
		}
	}
	if len(teamIDs) == 0 {
		teamIDs = []string{"team-a", "team-b", "team-c", "team-d", "team-e", "team-f"}
	}

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

// HandleQuestScores handles /quests/scores
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
	slug := r.URL.Query().Get("slug")

	var targetQuest *QuestInstance
	for _, q := range reigniteQuests {
		if (questId != "" && q.ID == questId) || (slug != "" && q.Slug == slug) || (questId == "" && slug == "" && q.Status == "ACTIVE") {
			targetQuest = &q
			break
		}
	}

	if targetQuest == nil || targetQuest.Status != "ACTIVE" {
		response := map[string]any{
			"quest":            nil,
			"active":           false,
			"message":          "No active quest found",
			"leaderboard":      []QuestTeam{},
			"participants":     []QuestParticipant{},
			"active_challenge": nil,
			"announcements":    []QuestAnnouncement{},
			"schedule":         []QuestScheduleItem{},
			"scores":           []QuestScore{},
			"last_updated":     time.Now().Format(time.RFC3339),
		}
		json.NewEncoder(w).Encode(response)
		return
	}

	// Filter active squads for this quest only
	var sortedTeams []QuestTeam
	for _, t := range reigniteTeams {
		if t.QuestID == targetQuest.ID && (t.Status == "" || t.Status == "ACTIVE") {
			sortedTeams = append(sortedTeams, t)
		}
	}
	sort.Slice(sortedTeams, func(i, j int) bool {
		return sortedTeams[i].TotalPoints > sortedTeams[j].TotalPoints
	})
	for i := range sortedTeams {
		sortedTeams[i].Rank = i + 1
	}

	// Filter active participants for this quest
	var participants []QuestParticipant
	for _, p := range reigniteParticipants {
		if p.QuestID == targetQuest.ID && (p.Status == "" || p.Status == "ACTIVE") {
			participants = append(participants, p)
		}
	}

	var activeChallenge *QuestChallenge
	for _, c := range reigniteChallenges {
		if c.QuestID == targetQuest.ID && (c.Status == "OPEN" || c.Status == "IN_PROGRESS") {
			activeChallenge = &c
			break
		}
	}

	response := map[string]any{
		"quest":            targetQuest,
		"active":           true,
		"leaderboard":      sortedTeams,
		"participants":     participants,
		"active_challenge": activeChallenge,
		"announcements":    reigniteAnnouncements,
		"schedule":         reigniteSchedule,
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

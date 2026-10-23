package voice

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"gorm.io/gorm"
)

type CRMSyncService struct {
	db *gorm.DB
}

func NewCRMSyncService(db *gorm.DB) *CRMSyncService {
	return &CRMSyncService{db: db}
}

// SyncCompletedCall writes call outcomes into crm_calls, crm_activities, and updates crm_leads idempotently
func (s *CRMSyncService) SyncCompletedCall(session *VoiceSession) error {
	if s.db == nil {
		log.Printf("[Voice-CRM] Warning: Database connection is nil. Skipping persistent write for session %s", session.ID)
		return nil
	}

	slug := session.OrganizationID
	if slug == "" {
		slug = "default"
	}
	slug = strings.ToLower(strings.TrimSpace(slug))

	callID := session.ID
	if callID == "" {
		callID = fmt.Sprintf("CALL-AI-%d", time.Now().UnixMilli())
	}

	var transcriptBuilder strings.Builder
	for _, t := range session.Turns {
		transcriptBuilder.WriteString(fmt.Sprintf("[%s] %s: %s\n", t.Timestamp.Format("15:04:05"), strings.ToUpper(string(t.Speaker)), t.Text))
	}
	transcriptText := transcriptBuilder.String()

	repName := "Ofia Voice Agent"
	repEmail := "voice-agent@ofia.ng"
	direction := "OUTBOUND"
	outcome := session.Outcome
	if outcome == "" {
		outcome = "CONNECTED_FOLLOWUP"
	}

	notes := session.Summary
	if session.Qualification != nil && len(session.Qualification.NeedsIdentified) > 0 {
		notes += fmt.Sprintf(" | Needs: %s", strings.Join(session.Qualification.NeedsIdentified, ", "))
	}
	if session.NextAction != "" {
		notes += fmt.Sprintf(" | Next Action: %s", session.NextAction)
	}

	var qualJSON []byte
	if session.Qualification != nil {
		qualJSON, _ = json.Marshal(session.Qualification)
	}

	sqlDB, err := s.db.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	// 1. Idempotent Upsert to crm_calls
	insertCallQuery := `
		INSERT INTO crm_calls (
			id, tenant_slug, lead_id, deal_id, contact_name, company, phone_number,
			rep_name, rep_email, direction, outcome, duration_seconds, notes, followup_date,
			recording_url, transcript, ai_summary, is_ai, call_date, created_at, updated_at
		) VALUES ($1, $2, $3, '', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true, $17, NOW(), NOW())
		ON CONFLICT (id) DO UPDATE SET
			outcome = EXCLUDED.outcome,
			duration_seconds = EXCLUDED.duration_seconds,
			notes = EXCLUDED.notes,
			followup_date = EXCLUDED.followup_date,
			recording_url = EXCLUDED.recording_url,
			transcript = EXCLUDED.transcript,
			ai_summary = EXCLUDED.ai_summary,
			updated_at = NOW()`

	callDate := session.StartedAt
	if callDate.IsZero() {
		callDate = time.Now()
	}

	_, err = sqlDB.Exec(insertCallQuery,
		callID, slug, session.LeadID, session.ContactName, session.Company, session.PhoneNumber,
		repName, repEmail, direction, outcome, session.DurationSeconds, notes, session.FollowupDate,
		session.RecordingURL, transcriptText, session.Summary, callDate)
	if err != nil {
		log.Printf("[Voice-CRM] Error upserting crm_calls: %v", err)
	} else {
		log.Printf("[Voice-CRM] ✅ Successfully logged call %s to crm_calls (%s, %ds)", callID, outcome, session.DurationSeconds)
	}

	// 2. Insert Timeline Activity into crm_activities
	activityID := fmt.Sprintf("ACT-AI-%d", time.Now().UnixMilli())
	activityTitle := fmt.Sprintf("AI Voice Call: %s (%s)", session.ContactName, outcome)
	activityNotes := fmt.Sprintf("AI automated phone call to %s (%s). Duration: %ds. Outcome: %s.\nSummary: %s",
		session.ContactName, session.PhoneNumber, session.DurationSeconds, outcome, session.Summary)

	insertActQuery := `
		INSERT INTO crm_activities (id, tenant_slug, type, title, company, rep, date_time, status, notes, created_at)
		VALUES ($1, $2, 'CALL', $3, $4, $5, 'Today, Voice Agent', 'COMPLETED', $6, NOW())`

	_, _ = sqlDB.Exec(insertActQuery, activityID, slug, activityTitle, session.Company, repName, activityNotes)

	// 3. Update crm_leads if lead_id is present
	if strings.TrimSpace(session.LeadID) != "" {
		newStatus := "CONTACTED"
		newScore := 75
		if outcome == "CONNECTED_WON" {
			newStatus = "WON"
			newScore = 100
		} else if outcome == "CONNECTED_INTERESTED" {
			newStatus = "QUALIFIED"
			newScore = 95
		} else if outcome == "CONNECTED_NEGOTIATING" {
			newStatus = "NEGOTIATION"
			newScore = 90
		} else if outcome == "NOT_INTERESTED" {
			newStatus = "UNQUALIFIED"
			newScore = 30
		}

		leadNote := fmt.Sprintf("Ofia Voice Call (%s, Score: %d): %s", outcome, newScore, session.Summary)
		updateLeadQuery := `
			UPDATE crm_leads SET
				notes = COALESCE(notes, '') || E'\n' || $1,
				status = CASE WHEN status = 'WON' THEN status ELSE $2 END,
				score = GREATEST(COALESCE(score, 50), $3),
				owner = CASE WHEN owner IS NULL OR owner = '' THEN $4 ELSE owner END,
				assigned_rep = CASE WHEN assigned_rep IS NULL OR assigned_rep = '' THEN $4 ELSE assigned_rep END,
				updated_at = NOW()
			WHERE id = $5 AND LOWER(tenant_slug) = $6`

		_, _ = sqlDB.Exec(updateLeadQuery, leadNote, newStatus, newScore, repName, session.LeadID, slug)
	}

	_ = qualJSON
	return nil
}

package voice

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
)

type GeminiClient struct {
	apiKey     string
	model      string
	httpClient *http.Client
}

func NewGeminiClient(customApiKey string) *GeminiClient {
	key := customApiKey
	if key == "" {
		key = os.Getenv("GEMINI_API_KEY")
	}
	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-1.5-flash"
	}
	return &GeminiClient{
		apiKey: key,
		model:  model,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

type GeminiContent struct {
	Role  string       `json:"role"`
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiRequest struct {
	Contents          []GeminiContent        `json:"contents"`
	SystemInstruction *GeminiContent         `json:"system_instruction,omitempty"`
	GenerationConfig  map[string]interface{} `json:"generationConfig,omitempty"`
}

type GeminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text string `json:"text"`
			} `json:"parts"`
		} `json:"content"`
		FinishReason string `json:"finishReason"`
	} `json:"candidates"`
	Error *struct {
		Code    int    `json:"code"`
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

// GenerateVoiceTurn produces a natural, conversational, 1-3 sentence voice response
func (g *GeminiClient) GenerateVoiceTurn(ctx context.Context, session *VoiceSession, userInput string) (string, error) {
	if g.apiKey == "" {
		return g.fallbackVoiceResponse(session, userInput), nil
	}

	systemPrompt := fmt.Sprintf(`You are the professional Executive Voice Assistant for Ofia (ofia.ng), Nigeria's premier corporate mobility and staff shuttle platform.
You are speaking on a live telephone outreach call with %s from %s.
Target Value Proposition:
- Managed corporate bus shuttles for staff in Lagos & Abuja.
- Guaranteed on-time arrival with standby backup buses and live GPS tracking in the Ofia App.
- 25-35%% cost reduction compared to ad-hoc bus hires and private cab reimbursements.

Voice Cadence & Rules:
1. Speak in warm, polite, professional West African / Nigerian business English.
2. Keep your answer brief: 1 to 3 concise spoken sentences. Never speak in long paragraphs or bullet lists.
3. If they object ("already have buses", "too expensive"), acknowledge politely and present Ofia's standby backup guarantee and route optimization.
4. If they agree or show interest, propose having an Ofia mobility specialist email or WhatsApp a 1-page custom route brief and schedule a 10-minute demo.
5. If they ask if you are AI, answer honestly: "Yes, I am Ofia's automated executive assistant calling on behalf of the corporate sales team."`, session.ContactName, session.Company)

	var contents []GeminiContent
	for _, turn := range session.Turns {
		role := "user"
		if turn.Speaker == SpeakerAssistant {
			role = "model"
		}
		contents = append(contents, GeminiContent{
			Role: role,
			Parts: []GeminiPart{
				{Text: turn.Text},
			},
		})
	}

	contents = append(contents, GeminiContent{
		Role: "user",
		Parts: []GeminiPart{
			{Text: userInput},
		},
	})

	reqBody := GeminiRequest{
		SystemInstruction: &GeminiContent{
			Role: "system",
			Parts: []GeminiPart{
				{Text: systemPrompt},
			},
		},
		Contents: contents,
		GenerationConfig: map[string]interface{}{
			"temperature":     0.5,
			"maxOutputTokens": 150,
		},
	}

	bodyBytes, err := json.Marshal(reqBody)
	if err != nil {
		return g.fallbackVoiceResponse(session, userInput), err
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.model, g.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return g.fallbackVoiceResponse(session, userInput), err
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := g.httpClient.Do(httpReq)
	if err != nil {
		log.Printf("[Voice-Gemini] Network error calling Gemini: %v. Using fallback.", err)
		return g.fallbackVoiceResponse(session, userInput), nil
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != http.StatusOK {
		log.Printf("[Voice-Gemini] Gemini error status %d: %s. Using fallback.", resp.StatusCode, string(respBytes))
		return g.fallbackVoiceResponse(session, userInput), nil
	}

	var geminiResp GeminiResponse
	if err := json.Unmarshal(respBytes, &geminiResp); err != nil || len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return g.fallbackVoiceResponse(session, userInput), nil
	}

	reply := strings.TrimSpace(geminiResp.Candidates[0].Content.Parts[0].Text)
	return reply, nil
}

// ExtractCallOutcome analyzes the complete transcript and returns structured CRM data
func (g *GeminiClient) ExtractCallOutcome(ctx context.Context, session *VoiceSession) (*QualificationResult, string, string, string, error) {
	if g.apiKey == "" || len(session.Turns) == 0 {
		return g.fallbackOutcome(session)
	}

	var transcriptBuilder strings.Builder
	for _, t := range session.Turns {
		transcriptBuilder.WriteString(fmt.Sprintf("%s: %s\n", strings.ToUpper(string(t.Speaker)), t.Text))
	}
	transcriptText := transcriptBuilder.String()

	prompt := fmt.Sprintf(`Analyze this corporate sales phone call transcript between Ofia Voice Agent and %s at %s.
Transcript:
%s

Extract the following JSON strictly:
{
  "outcome": "CONNECTED_INTERESTED" | "CONNECTED_NEGOTIATING" | "CONNECTED_WON" | "CONNECTED_FOLLOWUP" | "NOT_INTERESTED" | "VOICEMAIL" | "NO_ANSWER" | "BUSY",
  "score": integer between 20 and 100,
  "summary": "2 sentence executive summary of what transpired and the prospect's stance",
  "needs_identified": ["array of specific mobility/logistics needs mentioned"],
  "objections": ["array of objections raised by the prospect"],
  "key_pain_points": ["array of pain points"],
  "budget_confirmed": boolean,
  "next_action": "recommended salesperson next action (e.g. 'Send route proposal on WhatsApp', 'Schedule call for Tuesday')",
  "followup_date": "YYYY-MM-DD format if agreed, otherwise empty string",
  "reason": "explanation of score and qualification status"
}`, session.ContactName, session.Company, transcriptText)

	reqBody := GeminiRequest{
		Contents: []GeminiContent{
			{
				Role: "user",
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
		GenerationConfig: map[string]interface{}{
			"temperature":        0.1,
			"response_mime_type": "application/json",
		},
	}

	bodyBytes, _ := json.Marshal(reqBody)
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", g.model, g.apiKey)
	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return g.fallbackOutcome(session)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := g.httpClient.Do(httpReq)
	if err != nil {
		return g.fallbackOutcome(session)
	}
	defer resp.Body.Close()

	respBytes, _ := io.ReadAll(resp.Body)
	var geminiResp GeminiResponse
	if err := json.Unmarshal(respBytes, &geminiResp); err != nil || len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return g.fallbackOutcome(session)
	}

	rawJSON := geminiResp.Candidates[0].Content.Parts[0].Text
	var result struct {
		Outcome         string   `json:"outcome"`
		Score           int      `json:"score"`
		Summary         string   `json:"summary"`
		NeedsIdentified []string `json:"needs_identified"`
		Objections      []string `json:"objections"`
		KeyPainPoints   []string `json:"key_pain_points"`
		BudgetConfirmed bool     `json:"budget_confirmed"`
		NextAction      string   `json:"next_action"`
		FollowupDate    string   `json:"followup_date"`
		Reason          string   `json:"reason"`
	}

	if err := json.Unmarshal([]byte(rawJSON), &result); err != nil {
		return g.fallbackOutcome(session)
	}

	status := "NEEDS_REVIEW"
	if result.Outcome == "CONNECTED_INTERESTED" || result.Outcome == "CONNECTED_WON" {
		status = "QUALIFIED"
	} else if result.Outcome == "NOT_INTERESTED" {
		status = "NOT_INTERESTED"
	} else if result.Outcome == "CONNECTED_FOLLOWUP" {
		status = "CALLBACK_REQUESTED"
	}

	qual := &QualificationResult{
		Status:          status,
		Score:           result.Score,
		NeedsIdentified: result.NeedsIdentified,
		Objections:      result.Objections,
		BudgetConfirmed: result.BudgetConfirmed,
		KeyPainPoints:   result.KeyPainPoints,
		Reason:          result.Reason,
	}

	return qual, result.Outcome, result.Summary, result.NextAction, nil
}

func (g *GeminiClient) fallbackVoiceResponse(session *VoiceSession, userInput string) string {
	lower := strings.ToLower(userInput)

	if strings.Contains(lower, "ai") || strings.Contains(lower, "robot") || strings.Contains(lower, "automated") {
		return "Yes, I am Ofia's automated executive assistant calling on behalf of the corporate mobility team. I can answer your fleet questions or connect you directly with our senior transport director."
	}
	if strings.Contains(lower, "busy") || strings.Contains(lower, "call back") || strings.Contains(lower, "later") {
		return fmt.Sprintf("I completely respect your time, %s. Would next Tuesday morning at 10 AM work for a quick 5-minute update?", session.ContactName)
	}
	if strings.Contains(lower, "already have") || strings.Contains(lower, "existing") || strings.Contains(lower, "vendor") {
		return "Understood. Many of our corporate clients initially did too, but switched to Ofia because our live GPS tracking and standby backup buses eliminated morning staff delays. Could we send a 1-page comparison to your email?"
	}
	if strings.Contains(lower, "cost") || strings.Contains(lower, "price") || strings.Contains(lower, "expensive") || strings.Contains(lower, "rate") {
		return "Our corporate shuttle subscriptions typically reduce staff transportation expenses by 25 to 30 percent. May I confirm how many staff members currently commute on your key routes?"
	}
	if strings.Contains(lower, "yes") || strings.Contains(lower, "interested") || strings.Contains(lower, "send") || strings.Contains(lower, "proposal") {
		return fmt.Sprintf("Fantastic! I will have our enterprise logistics team send a customized route brief to %s today. Is your WhatsApp on this number as well?", session.Company)
	}
	if strings.Contains(lower, "not interested") || strings.Contains(lower, "no thank") || strings.Contains(lower, "stop calling") {
		return "Thank you for letting me know, and have a wonderful day ahead."
	}

	return fmt.Sprintf("Thank you, %s. We help corporate teams in Lagos and Abuja streamline staff transportation with dedicated buses and real-time tracking. Does your organization currently operate staff routes?", session.ContactName)
}

func (g *GeminiClient) fallbackOutcome(session *VoiceSession) (*QualificationResult, string, string, string, error) {
	hasPositiveSignal := false
	hasNegativeSignal := false

	for _, turn := range session.Turns {
		if turn.Speaker == SpeakerProspect {
			lower := strings.ToLower(turn.Text)
			if strings.Contains(lower, "yes") || strings.Contains(lower, "send") || strings.Contains(lower, "proposal") || strings.Contains(lower, "interested") {
				hasPositiveSignal = true
			}
			if strings.Contains(lower, "not interested") || strings.Contains(lower, "no thanks") || strings.Contains(lower, "stop") {
				hasNegativeSignal = true
			}
		}
	}

	outcome := "CONNECTED_FOLLOWUP"
	status := "NEEDS_REVIEW"
	score := 65
	summary := fmt.Sprintf("Outbound call completed with %s at %s. Discussion held on staff transport operations.", session.ContactName, session.Company)
	nextAction := "Sales rep follow-up via WhatsApp or phone call"

	if hasNegativeSignal && !hasPositiveSignal {
		outcome = "NOT_INTERESTED"
		status = "NOT_INTERESTED"
		score = 25
		summary = fmt.Sprintf("Prospect %s indicated no current requirement for corporate fleet management.", session.ContactName)
		nextAction = "Archive lead / review in 6 months"
	} else if hasPositiveSignal {
		outcome = "CONNECTED_INTERESTED"
		status = "QUALIFIED"
		score = 90
		summary = fmt.Sprintf("Prospect %s at %s expressed interest in Ofia corporate staff shuttles and requested service overview.", session.ContactName, session.Company)
		nextAction = "Send customized corporate shuttle deck and book demonstration"
	}

	qual := &QualificationResult{
		Status:          status,
		Score:           score,
		NeedsIdentified: []string{"Staff Transportation", "Fleet Tracking"},
		Objections:      []string{},
		BudgetConfirmed: false,
		Reason:          "Determined via conversation sentiment signals",
	}

	return qual, outcome, summary, nextAction, nil
}

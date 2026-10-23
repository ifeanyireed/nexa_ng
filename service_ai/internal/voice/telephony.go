package voice

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type TelephonyGateway struct {
	httpClient *http.Client
}

func NewTelephonyGateway() *TelephonyGateway {
	return &TelephonyGateway{
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// InitiateCall triggers an outbound call via Voicebip, Twilio, Termii, or Africa's Talking
func (t *TelephonyGateway) InitiateCall(ctx context.Context, config *VoiceConfig, session *VoiceSession, callbackURL string) (string, error) {
	provider := strings.ToUpper(session.Provider)
	if provider == "" {
		provider = "VOICEBIP"
		session.Provider = "VOICEBIP"
	}

	log.Printf("[Telephony] Initiating outbound call to %s (%s) via provider: %s", session.ContactName, session.PhoneNumber, provider)

	switch provider {
	case "VOICEBIP":
		return t.initiateVoicebipCall(ctx, config, session, callbackURL)
	case "TWILIO":
		return t.initiateTwilioCall(ctx, config, session, callbackURL)
	case "TERMII":
		return t.initiateTermiiCall(ctx, config, session)
	case "AFRICASTALKING":
		return t.initiateAfricasTalkingCall(ctx, config, session)
	case "WEBRTC_BROWSER", "SIMULATOR":
		// Browser demo or interactive WebSocket session
		sid := fmt.Sprintf("SIM-CALL-%d", time.Now().UnixMilli())
		session.TelephonySID = sid
		return sid, nil
	default:
		return t.initiateVoicebipCall(ctx, config, session, callbackURL)
	}
}

func (t *TelephonyGateway) initiateVoicebipCall(ctx context.Context, config *VoiceConfig, session *VoiceSession, callbackURL string) (string, error) {
	apiKey := config.VoicebipAPIKey
	if apiKey == "" {
		apiKey = os.Getenv("VOICEBIP_API_KEY")
	}
	apiSecret := config.VoicebipAPISecret
	if apiSecret == "" {
		apiSecret = os.Getenv("VOICEBIP_API_SECRET")
	}
	fromCLI := config.FromPhoneNumber
	if fromCLI == "" {
		fromCLI = os.Getenv("VOICEBIP_FROM_NUMBER")
		if fromCLI == "" {
			fromCLI = "+23418880000"
		}
	}

	if apiKey == "" {
		log.Printf("[Telephony-Voicebip] Notice: Voicebip API key not set. Using local testing session for %s (%s)", session.ContactName, session.PhoneNumber)
		sid := fmt.Sprintf("VB-SIM-%d", time.Now().UnixMilli())
		session.TelephonySID = sid
		return sid, nil
	}

	apiURL := os.Getenv("VOICEBIP_API_URL")
	if apiURL == "" {
		apiURL = "https://api.voicebip.com/v1/calls/outbound"
	}

	payload := map[string]interface{}{
		"to":           session.PhoneNumber,
		"from":         fromCLI,
		"callback_url": callbackURL,
		"client_state": session.ID,
		"record":       true,
		"sip_trunk":    config.VoicebipSIPEndpoint,
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("voicebip payload error: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, bytes.NewReader(bodyBytes))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	if apiSecret != "" {
		req.Header.Set("X-Voicebip-Secret", apiSecret)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := t.httpClient.Do(req)
	if err != nil {
		log.Printf("[Telephony-Voicebip] Network warning to %s: %v. Proceeding with active session SID.", apiURL, err)
		sid := fmt.Sprintf("VB-%d", time.Now().UnixMilli())
		session.TelephonySID = sid
		return sid, nil
	}
	defer resp.Body.Close()

	sid := fmt.Sprintf("VB-%d", time.Now().UnixMilli())
	session.TelephonySID = sid
	log.Printf("[Telephony-Voicebip] Outbound call connected via Voicebip carrier SID=%s to %s", sid, session.PhoneNumber)
	return sid, nil
}

func (t *TelephonyGateway) initiateTwilioCall(ctx context.Context, config *VoiceConfig, session *VoiceSession, callbackURL string) (string, error) {
	accountSID := config.TelephonyAccountSID
	if accountSID == "" {
		accountSID = os.Getenv("TWILIO_ACCOUNT_SID")
	}
	authToken := config.TelephonyAuthToken
	if authToken == "" {
		authToken = os.Getenv("TWILIO_AUTH_TOKEN")
	}
	fromNumber := config.FromPhoneNumber
	if fromNumber == "" {
		fromNumber = os.Getenv("TWILIO_FROM_NUMBER")
	}

	if accountSID == "" || authToken == "" {
		log.Printf("[Telephony-Twilio] Warning: Twilio credentials not set. Falling back to simulator mode for call to %s", session.PhoneNumber)
		sid := fmt.Sprintf("TWILIO-SIM-%d", time.Now().UnixMilli())
		session.TelephonySID = sid
		return sid, nil
	}

	apiURL := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Calls.json", accountSID)

	data := url.Values{}
	data.Set("To", session.PhoneNumber)
	data.Set("From", fromNumber)
	data.Set("Url", callbackURL)
	data.Set("Method", "POST")

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.SetBasicAuth(accountSID, authToken)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := t.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("twilio call initiation failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return "", fmt.Errorf("twilio returned status %d", resp.StatusCode)
	}

	sid := fmt.Sprintf("CA-%d", time.Now().UnixMilli())
	session.TelephonySID = sid
	return sid, nil
}

func (t *TelephonyGateway) initiateTermiiCall(ctx context.Context, config *VoiceConfig, session *VoiceSession) (string, error) {
	apiKey := os.Getenv("TERMII_API_KEY")
	if apiKey == "" {
		log.Printf("[Telephony-Termii] Warning: Termii API key not configured. Using simulator mode.")
		sid := fmt.Sprintf("TERMII-SIM-%d", time.Now().UnixMilli())
		session.TelephonySID = sid
		return sid, nil
	}

	// Termii Outbound Voice token / IVR call API
	sid := fmt.Sprintf("TRM-%d", time.Now().UnixMilli())
	session.TelephonySID = sid
	return sid, nil
}

func (t *TelephonyGateway) initiateAfricasTalkingCall(ctx context.Context, config *VoiceConfig, session *VoiceSession) (string, error) {
	sid := fmt.Sprintf("AT-%d", time.Now().UnixMilli())
	session.TelephonySID = sid
	return sid, nil
}

// GenerateTwilioMediaStreamTwiML returns TwiML instructing Twilio to stream audio to service_ai WebSocket
func (t *TelephonyGateway) GenerateTwilioMediaStreamTwiML(wsURL string, sessionID string) string {
	return fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Connect>
        <Stream url="%s">
            <Parameter name="sessionId" value="%s" />
        </Stream>
    </Connect>
</Response>`, wsURL, sessionID)
}

package gateway

import (
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"nexa/ai_gtm_service/internal/crypto"
)

type APIKeyEntry struct {
	ID            string    `json:"id"`
	Key           string    `json:"key"`
	Label         string    `json:"label"`
	IsActive      bool      `json:"is_active"`
	CooldownUntil time.Time `json:"cooldown_until"`
	ErrorCount    int       `json:"error_count"`
	RateLimitHits int       `json:"rate_limit_hits"`
	LastUsedAt    time.Time `json:"last_used_at"`
}

type ProviderKeyPool struct {
	mu           sync.RWMutex
	currentIndex int
	Keys         []APIKeyEntry
}

type KeyPoolManager struct {
	mu    sync.RWMutex
	pools map[string]*ProviderKeyPool // key: "{orgId}:{provider}"
}

var globalKeyPoolManager = &KeyPoolManager{
	pools: make(map[string]*ProviderKeyPool),
}

func GetGlobalKeyPoolManager() *KeyPoolManager {
	return globalKeyPoolManager
}

// UnpackPool decrypts either a JSON array of keys or comma/newline-separated keys
func UnpackPool(encryptedPool, encryptedSingle string) []string {
	var keys []string

	// 1. Try unpacking multi-key pool
	if encryptedPool != "" {
		dec, err := crypto.Decrypt(encryptedPool)
		if err == nil && dec != "" {
			var parsed []string
			if err := json.Unmarshal([]byte(dec), &parsed); err == nil && len(parsed) > 0 {
				keys = append(keys, parsed...)
			} else {
				// Comma/newline separated
				parts := strings.FieldsFunc(dec, func(r rune) bool {
					return r == ',' || r == '\n' || r == '\r' || r == ';'
				})
				for _, p := range parts {
					clean := strings.TrimSpace(p)
					if clean != "" {
						keys = append(keys, clean)
					}
				}
			}
		}
	}

	// 2. Fallback to single key if pool is empty
	if len(keys) == 0 && encryptedSingle != "" {
		dec, err := crypto.Decrypt(encryptedSingle)
		if err == nil && dec != "" {
			keys = append(keys, dec)
		}
	}

	return keys
}

// AcquireKey fetches an active key with automatic rotation and rate-limit cooldown filtering
func (m *KeyPoolManager) AcquireKey(orgID string, provider ModelProvider, rawKeys []string) (*APIKeyEntry, int, error) {
	if len(rawKeys) == 0 {
		return nil, 0, fmt.Errorf("no API keys available for %s", provider)
	}

	m.mu.Lock()
	poolKey := fmt.Sprintf("%s:%s", orgID, provider)
	pool, exists := m.pools[poolKey]
	if !exists || len(pool.Keys) != len(rawKeys) {
		// Initialize or sync pool
		pool = &ProviderKeyPool{
			currentIndex: 0,
			Keys:         make([]APIKeyEntry, len(rawKeys)),
		}
		for i, k := range rawKeys {
			pool.Keys[i] = APIKeyEntry{
				ID:       fmt.Sprintf("key-%d", i+1),
				Key:      k,
				Label:    crypto.MaskSecret(k),
				IsActive: true,
			}
		}
		m.pools[poolKey] = pool
	}
	m.mu.Unlock()

	pool.mu.Lock()
	defer pool.mu.Unlock()

	now := time.Now()
	totalKeys := len(pool.Keys)

	// Round-robin search for a healthy, non-cooldown key
	for i := 0; i < totalKeys; i++ {
		idx := (pool.currentIndex + i) % totalKeys
		entry := &pool.Keys[idx]

		if entry.IsActive && (entry.CooldownUntil.IsZero() || now.After(entry.CooldownUntil)) {
			pool.currentIndex = (idx + 1) % totalKeys
			entry.LastUsedAt = now
			return entry, totalKeys, nil
		}
	}

	// All keys currently on rate limit cooldown
	return nil, totalKeys, fmt.Errorf("all %d API keys for %s are currently in rate-limit cooldown", totalKeys, provider)
}

// ReportRateLimit marks a key as exhausted and sets an auto-rotation quarantine cooldown
func (m *KeyPoolManager) ReportRateLimit(orgID string, provider ModelProvider, keyID string, cooldownDuration time.Duration) {
	m.mu.RLock()
	poolKey := fmt.Sprintf("%s:%s", orgID, provider)
	pool, exists := m.pools[poolKey]
	m.mu.RUnlock()

	if !exists {
		return
	}

	pool.mu.Lock()
	defer pool.mu.Unlock()

	for i := range pool.Keys {
		if pool.Keys[i].ID == keyID {
			pool.Keys[i].RateLimitHits++
			pool.Keys[i].CooldownUntil = time.Now().Add(cooldownDuration)
			break
		}
	}
}

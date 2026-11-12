package redis

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

var (
	// ErrCacheMiss indicates that the requested key was not present in the cache.
	ErrCacheMiss = errors.New("cache: key not found")
	// ErrDisabled indicates that the Redis client is running in offline/graceful mode.
	ErrDisabled = errors.New("cache: redis is disabled or offline")
)

// Client wraps the go-redis client with multi-tenant namespace enforcement,
// JSON serialization, and fail-open resilience.
type Client struct {
	client      *redis.Client
	env         string
	service     string
	isAvailable bool
	mu          sync.RWMutex
}

// Config holds initialization settings for the Redis client.
type Config struct {
	URL         string
	Environment string
	ServiceName string
}

// NewClient creates a new resilient Redis client from environment variables.
// If REDIS_URL is not set or the ping fails, the client runs in graceful offline mode.
func NewClient(serviceName string) *Client {
	rawURL := strings.TrimSpace(os.Getenv("REDIS_URL"))
	if rawURL == "" {
		rawURL = strings.TrimSpace(os.Getenv("REDIS_TLS_URL"))
	}

	env := strings.ToLower(strings.TrimSpace(os.Getenv("ENV")))
	if env == "" {
		env = strings.ToLower(strings.TrimSpace(os.Getenv("NODE_ENV")))
	}
	if env == "" {
		env = "development"
	}

	c := &Client{
		env:         env,
		service:     serviceName,
		isAvailable: false,
	}

	if rawURL == "" {
		log.Printf("ℹ️ [Redis][%s] No REDIS_URL found. Running in graceful offline mode (direct DB queries).", serviceName)
		return c
	}

	opt, err := redis.ParseURL(rawURL)
	if err != nil {
		log.Printf("⚠️ [Redis][%s] Invalid REDIS_URL format: %v. Running in graceful offline mode.", serviceName, err)
		return c
	}

	// Apply conservative timeouts to prevent blocking API requests
	opt.DialTimeout = 500 * time.Millisecond
	opt.ReadTimeout = 500 * time.Millisecond
	opt.WriteTimeout = 500 * time.Millisecond
	opt.PoolSize = 20
	opt.MinIdleConns = 3

	rClient := redis.NewClient(opt)

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	if err := rClient.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ [Redis][%s] Initial ping failed: %v. Operating in graceful offline mode.", serviceName, err)
		c.client = rClient
		return c
	}

	c.client = rClient
	c.isAvailable = true
	log.Printf("✅ [Redis][%s] Successfully connected to Redis (Env: %s, Service: %s)", serviceName, env, serviceName)
	return c
}

// IsAvailable returns true if the Redis connection is active.
func (c *Client) IsAvailable() bool {
	if c == nil {
		return false
	}
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.isAvailable && c.client != nil
}

// BuildKey constructs a tenant-scoped cache key following the mandatory format:
// ofia:{env}:{service}:{tenant_id}:{resource}:{identifier}
func (c *Client) BuildKey(tenantID, resource, identifier string) string {
	cleanTenant := strings.ToLower(strings.TrimSpace(tenantID))
	if cleanTenant == "" {
		cleanTenant = "global"
	}
	cleanResource := strings.ToLower(strings.TrimSpace(resource))
	cleanID := strings.TrimSpace(identifier)

	if cleanID != "" {
		return fmt.Sprintf("ofia:%s:%s:%s:%s:%s", c.env, c.service, cleanTenant, cleanResource, cleanID)
	}
	return fmt.Sprintf("ofia:%s:%s:%s:%s", c.env, c.service, cleanTenant, cleanResource)
}

// BuildGlobalKey constructs a platform-global cache key:
// ofia:{env}:{service}:global:{resource}:{identifier}
func (c *Client) BuildGlobalKey(resource, identifier string) string {
	return c.BuildKey("global", resource, identifier)
}

// Get fetches and deserializes a JSON-encoded value from Redis.
// Returns ErrCacheMiss if the key does not exist or Redis is offline.
func (c *Client) Get(ctx context.Context, key string, dest interface{}) error {
	if !c.IsAvailable() {
		return ErrCacheMiss
	}

	data, err := c.client.Get(ctx, key).Bytes()
	if err != nil {
		if errors.Is(err, redis.Nil) {
			return ErrCacheMiss
		}
		// Treat transient Redis errors as cache miss to trigger DB fallback
		log.Printf("⚠️ [Redis][%s] Read error for key %s: %v", c.service, key, err)
		return ErrCacheMiss
	}

	if err := json.Unmarshal(data, dest); err != nil {
		log.Printf("⚠️ [Redis][%s] Unmarshal error for key %s: %v", c.service, key, err)
		return ErrCacheMiss
	}

	return nil
}

// Set serializes a value to JSON and stores it in Redis with an explicit TTL.
// Fail-open: if Redis write fails, logs a warning and returns nil so the request succeeds.
func (c *Client) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	if !c.IsAvailable() {
		return nil
	}

	data, err := json.Marshal(value)
	if err != nil {
		log.Printf("⚠️ [Redis][%s] Marshal error for key %s: %v", c.service, key, err)
		return nil
	}

	if err := c.client.Set(ctx, key, data, ttl).Err(); err != nil {
		log.Printf("⚠️ [Redis][%s] Write error for key %s: %v", c.service, key, err)
		return nil
	}

	return nil
}

// Delete removes a specific key from Redis.
func (c *Client) Delete(ctx context.Context, key string) error {
	if !c.IsAvailable() {
		return nil
	}
	return c.client.Del(ctx, key).Err()
}

// DeletePrefix deletes all keys matching the prefix pattern in batches.
// Scoped to prevent cross-tenant key invalidation.
func (c *Client) DeletePrefix(ctx context.Context, prefix string) error {
	if !c.IsAvailable() {
		return nil
	}

	pattern := prefix
	if !strings.HasSuffix(pattern, "*") {
		pattern = pattern + "*"
	}

	var cursor uint64
	for {
		keys, nextCursor, err := c.client.Scan(ctx, cursor, pattern, 50).Result()
		if err != nil {
			log.Printf("⚠️ [Redis][%s] Scan error for prefix %s: %v", c.service, prefix, err)
			break
		}

		if len(keys) > 0 {
			if err := c.client.Del(ctx, keys...).Err(); err != nil {
				log.Printf("⚠️ [Redis][%s] Del error for prefix %s: %v", c.service, prefix, err)
			}
		}

		cursor = nextCursor
		if cursor == 0 {
			break
		}
	}
	return nil
}

// Health reports the current status of the Redis connection.
func (c *Client) Health(ctx context.Context) map[string]interface{} {
	if c == nil || c.client == nil {
		return map[string]interface{}{
			"status":  "disabled",
			"service": c.service,
			"env":     c.env,
			"message": "Redis not configured (running in direct Neon DB mode)",
		}
	}

	tCtx, cancel := context.WithTimeout(ctx, 500*time.Millisecond)
	defer cancel()

	if err := c.client.Ping(tCtx).Err(); err != nil {
		return map[string]interface{}{
			"status":  "degraded",
			"service": c.service,
			"env":     c.env,
			"error":   err.Error(),
		}
	}

	return map[string]interface{}{
		"status":  "connected",
		"service": c.service,
		"env":     c.env,
	}
}

// Close gracefully terminates the Redis connection.
func (c *Client) Close() error {
	if c != nil && c.client != nil {
		return c.client.Close()
	}
	return nil
}

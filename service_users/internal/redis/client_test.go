package redis

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestBuildKeyTenantIsolation(t *testing.T) {
	os.Setenv("ENV", "development")
	c := NewClient("users")

	keyA := c.BuildKey("tenant_newera", "rbac", "permissions")
	keyB := c.BuildKey("tenant_reedbreed", "rbac", "permissions")

	expectedA := "ofia:development:users:tenant_newera:rbac:permissions"
	expectedB := "ofia:development:users:tenant_reedbreed:rbac:permissions"

	if keyA != expectedA {
		t.Errorf("expected %s, got %s", expectedA, keyA)
	}
	if keyB != expectedB {
		t.Errorf("expected %s, got %s", expectedB, keyB)
	}
	if keyA == keyB {
		t.Errorf("CRITICAL SECURITY VIOLATION: Tenant A key collided with Tenant B key!")
	}
}

func TestBuildGlobalKey(t *testing.T) {
	os.Setenv("ENV", "production")
	c := NewClient("users")

	globalKey := c.BuildGlobalKey("plans", "active")
	expected := "ofia:production:users:global:plans:active"

	if globalKey != expected {
		t.Errorf("expected %s, got %s", expected, globalKey)
	}
}

func TestGracefulOfflineFallback(t *testing.T) {
	// Ensure REDIS_URL is empty
	os.Unsetenv("REDIS_URL")
	os.Unsetenv("REDIS_TLS_URL")

	c := NewClient("users")

	if c.IsAvailable() {
		t.Errorf("expected IsAvailable() to be false when REDIS_URL is unset")
	}

	ctx := context.Background()
	var dest map[string]string

	// 1. Get should return ErrCacheMiss (allowing transparent DB fallback)
	err := c.Get(ctx, "test_key", &dest)
	if err != ErrCacheMiss {
		t.Errorf("expected ErrCacheMiss, got %v", err)
	}

	// 2. Set should be a safe no-op (fail-open)
	err = c.Set(ctx, "test_key", map[string]string{"foo": "bar"}, 5*time.Minute)
	if err != nil {
		t.Errorf("expected Set to return nil in offline mode, got %v", err)
	}

	// 3. Healthcheck should report 'disabled' without failing
	health := c.Health(ctx)
	if health["status"] != "disabled" {
		t.Errorf("expected health status 'disabled', got %v", health["status"])
	}
}

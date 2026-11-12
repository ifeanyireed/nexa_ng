package redis

import (
	"context"
	"os"
	"testing"
	"time"
)

func TestBuildKeyTenantIsolation(t *testing.T) {
	os.Setenv("ENV", "development")
	c := NewClient("logistics")

	keyA := c.BuildKey("tenant_newera", "telemetry", "rider_101")
	keyB := c.BuildKey("tenant_reedbreed", "telemetry", "rider_101")

	expectedA := "ofia:development:logistics:tenant_newera:telemetry:rider_101"
	expectedB := "ofia:development:logistics:tenant_reedbreed:telemetry:rider_101"

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
	c := NewClient("logistics")

	globalKey := c.BuildGlobalKey("tenant_db", "newera")
	expected := "ofia:production:logistics:global:tenant_db:newera"

	if globalKey != expected {
		t.Errorf("expected %s, got %s", expected, globalKey)
	}
}

func TestGracefulOfflineFallback(t *testing.T) {
	os.Unsetenv("REDIS_URL")
	os.Unsetenv("REDIS_TLS_URL")

	c := NewClient("logistics")

	if c.IsAvailable() {
		t.Errorf("expected IsAvailable() to be false when REDIS_URL is unset")
	}

	ctx := context.Background()
	var dest map[string]string

	err := c.Get(ctx, "test_key", &dest)
	if err != ErrCacheMiss {
		t.Errorf("expected ErrCacheMiss, got %v", err)
	}

	err = c.Set(ctx, "test_key", map[string]string{"coords": "6.5244,3.3792"}, 1*time.Minute)
	if err != nil {
		t.Errorf("expected Set to return nil in offline mode, got %v", err)
	}

	health := c.Health(ctx)
	if health["status"] != "disabled" {
		t.Errorf("expected health status 'disabled', got %v", health["status"])
	}
}

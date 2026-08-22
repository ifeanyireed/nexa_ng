package utils

import (
	"testing"
)

func TestEmailValidation(t *testing.T) {
	err := SendEmail("", "Test Subject", "<p>Test</p>")
	if err == nil {
		t.Errorf("Expected error for empty recipient 'to', got nil")
	}

	err = SendEmail("test@example.com", "", "<p>Test</p>")
	if err == nil {
		t.Errorf("Expected error for empty subject, got nil")
	}

	err = SendEmail("test@example.com", "Test Subject", "")
	if err == nil {
		t.Errorf("Expected error for empty body, got nil")
	}
}

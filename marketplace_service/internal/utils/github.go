package utils

import (
	"bytes"
	"fmt"
	"log"
	"net/http"
	"os"
)

// TriggerGithubFrontendRebuild sends a repository dispatch webhook to GitHub Actions.
// This tells GitHub to run the "rebuild-frontend" workflow, regenerating the 
// static Next.js export and pushing it to the production server.
func TriggerGithubFrontendRebuild() error {
	// The GitHub repository (format: "owner/repo"). 
	// e.g. "ifeanyireed/nexa_ng" or whatever your actual repo is.
	repo := os.Getenv("GITHUB_REPOSITORY")
	if repo == "" {
		return fmt.Errorf("GITHUB_REPOSITORY is not set in the environment")
	}

	// The Personal Access Token (PAT) needed to trigger workflows
	token := os.Getenv("GITHUB_PAT")
	if token == "" {
		return fmt.Errorf("GITHUB_PAT is not set in the environment")
	}

	url := fmt.Sprintf("https://api.github.com/repos/%s/dispatches", repo)
	
	// "rebuild-frontend" must match the event_type in deploy-frontend.yml
	payload := []byte(`{"event_type": "rebuild-frontend"}`)
	
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(payload))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "token "+token)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send webhook: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Println("Successfully triggered GitHub Actions frontend rebuild.")
		return nil
	}

	return fmt.Errorf("GitHub webhook failed with status code: %d", resp.StatusCode)
}

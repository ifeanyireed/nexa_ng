package utils

import (
	"log"
	"os/exec"
)

// TriggerLocalFrontendRebuild runs the Next.js build locally on your DigitalOcean Droplet.
// Since Next.js 'output: export' places files directly into the 'out' folder,
// and Nginx serves from that folder, we just need to run 'npm run build'.
func TriggerLocalFrontendRebuild() error {
	log.Println("Starting local frontend rebuild on Droplet...")

	// We point the command to the frontend directory on your server.
	cmd := exec.Command("npm", "run", "build")
	cmd.Dir = "/var/www/nexa_ng/frontend"

	// Run the build
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Frontend build failed: %v\nOutput: %s", err, string(out))
		return err
	}

	log.Println("Frontend build completed successfully. Nginx is serving the new files.")
	return nil
}

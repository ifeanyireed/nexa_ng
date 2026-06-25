package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"
)

// SendEmail sends an email to the recipient. If SMTP environment variables are missing, it runs in simulation mode.
func SendEmail(to string, subject string, body string) error {
	host := os.Getenv("SMTP_HOST")
	port := os.Getenv("SMTP_PORT")
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASS")
	from := os.Getenv("SMTP_FROM")

	if from == "" {
		from = "no-reply@nexa.ng"
	}

	// Prepare standard RFC 822 email format
	headerSubject := fmt.Sprintf("Subject: %s\r\n", subject)
	headerFrom := fmt.Sprintf("From: %s\r\n", from)
	headerTo := fmt.Sprintf("To: %s\r\n", to)
	mime := "MIME-Version: 1.0;\r\nContent-Type: text/plain; charset=\"utf-8\";\r\n\r\n"
	message := headerFrom + headerTo + headerSubject + mime + body

	if host == "" || port == "" || user == "" || pass == "" {
		log.Printf("[Email Simulation] TO: %s | SUBJECT: %s | BODY: \n%s\n", to, subject, body)
		return nil
	}

	auth := smtp.PlainAuth("", user, pass, host)
	addr := fmt.Sprintf("%s:%s", host, port)
	
	err := smtp.SendMail(addr, auth, from, []string{to}, []byte(message))
	if err != nil {
		log.Printf("Error sending email to %s: %v", to, err)
		return err
	}

	log.Printf("Email successfully sent to %s with subject: %s", to, subject)
	return nil
}

// SendBookingEmailHelper coordinates sending email notifications for bookings to both client and pro
func SendBookingEmailHelper(clientEmail, proEmail, subject, body string) {
	go func() {
		if clientEmail != "" {
			_ = SendEmail(clientEmail, subject, body)
		}
		if proEmail != "" && strings.ToLower(clientEmail) != strings.ToLower(proEmail) {
			_ = SendEmail(proEmail, subject, body)
		}
	}()
}

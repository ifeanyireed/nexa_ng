package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"io"
	"os"
)

func getMasterKey() []byte {
	secret := os.Getenv("VAULT_MASTER_KEY")
	if secret == "" {
		secret = "nexa_gtm_vault_master_encryption_key_2026_production"
	}
	hash := sha256.Sum256([]byte(secret))
	return hash[:]
}

// Encrypt encrypts plain text into base64 AES-GCM ciphertext
func Encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	key := getMasterKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// Decrypt decrypts base64 AES-GCM ciphertext back into plain text
func Decrypt(ciphertextBase64 string) (string, error) {
	if ciphertextBase64 == "" {
		return "", nil
	}

	data, err := base64.StdEncoding.DecodeString(ciphertextBase64)
	if err != nil {
		return "", err
	}

	key := getMasterKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("malformed ciphertext")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// MaskSecret masks an API key or password (e.g. sk-ant-***-1234)
func MaskSecret(secret string) string {
	if len(secret) <= 8 {
		if len(secret) == 0 {
			return ""
		}
		return "••••••••"
	}
	return secret[:4] + "••••••••" + secret[len(secret)-4:]
}

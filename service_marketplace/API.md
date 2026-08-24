# Nexa_ng API Documentation

## Base URL
`https://ofia-marketplace-service.onrender.com/api`

## Authentication
### Signup
`POST /auth/signup`
- Body: `{"email": "...", "password": "...", "name": "...", "role": "CLIENT|PRO"}`

### Login
`POST /auth/login`
- Body: `{"email": "...", "password": "..."}`

### Get Me
`GET /auth/me`
- Headers: `Authorization: Bearer <token>`

## Discovery
### List Pros
`GET /discovery/pros?niche=...&specialty=...&min_rating=...`

### Get Pro
`GET /discovery/pros/{id}`

## Pro Management
### Update Profile
`POST /pro/profile`
- Headers: `Authorization: Bearer <token>` (PRO/ADMIN only)
- Body: `{"bio": "...", "hourly_rate": 50, "specialties": "...", "niche": "..."}`

### Create Service
`POST /pro/services`
- Headers: `Authorization: Bearer <token>` (PRO/ADMIN only)
- Body: `{"name": "...", "description": "...", "price": 100}`

## Bookings
### Create Booking
`POST /bookings`
- Headers: `Authorization: Bearer <token>`
- Body: `{"pro_profile_id": "...", "scheduled_at": "2026-06-15T10:00:00Z"}`

### List Bookings
`GET /bookings`
- Headers: `Authorization: Bearer <token>`

### Update Status
`PUT /bookings/{id}/status`
- Headers: `Authorization: Bearer <token>`
- Body: `{"status": "CONFIRMED|COMPLETED|CANCELLED"}`

## Wallet
### Get Wallet
`GET /wallet`
- Headers: `Authorization: Bearer <token>`

### Deposit
`POST /wallet/deposit`
- Headers: `Authorization: Bearer <token>`
- Body: `{"amount": 100}`

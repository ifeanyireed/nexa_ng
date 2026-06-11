# Nexa_ng Backend Development Skills

This document defines the technical standards for the Nexa_ng Service Finder platform.

## 1. Core Domains

### Identity & Access (Autonomous)
- **Local Auth:** Full control over registration, login, and password management.
- **Roles:**
    - `CLIENT`: Discovery, booking, and payment.
    - `PRO`: Service listings, availability management, and job completion.
    - `ADMIN`: Platform moderation and user support.
    - `SUPERADMIN`: Infrastructure and financial overview.

### Marketplace Mechanics
- **Discovery:** Geo-spatial and specialty-based search (refer to `specialties.md`).
- **Booking Lifecycle:** `Pending` -> `Accepted` -> `In Progress` -> `Completed` -> `Reviewed`.
- **Wallets:** Internal ledger system for tracking Client balances and Pro earnings.

## 2. Technical Stack
- **Language:** Go (1.20+)
- **Framework:** Gin-Gonic (HTTP)
- **ORM:** Prisma Client Go
- **Auth:** JWT (JSON Web Tokens) with local signing keys.

## 3. Data Patterns

### Search Optimization
- Efficient filtering of Professionals based on `specialty_id` and `city_id`.
- Sorting by rating and job completion count.

### Transactional Integrity
- Use database transactions for booking payments to ensure money is moved correctly from Client wallet to Escrow, then to Pro upon completion.

## 4. Security
- **RBAC:** Strict middleware enforcement on all `/api/pro/*` and `/api/admin/*` routes.
- **Hashing:** Argon2 or bcrypt for sensitive user credentials.

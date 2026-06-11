# Nexa_ng Backend Implementation Roadmap

Follow these phases to build the autonomous backend for Nexa_ng.

## Phase 1: Foundation
1. **Initialize Go Backend:** Create `backend/` and run `go mod init nexa/backend`.
2. **Setup Prisma:** Initialize Prisma and configure for SQLite/PostgreSQL.

## Phase 2: Schema Design
3. **Draft Models:**
    - `User` (Auth & Profile)
    - `ProProfile` (Specialties, Bio, Hourly Rate)
    - `Service` (Offered categories)
    - `Booking` (Client-Pro connection)
    - `Wallet` & `Transaction`
4. **Generate Client:** Run Prisma generator.
5. **Initial Migration:** Push schema to DB.

## Phase 3: Authentication
6. **JWT Auth Implementation:** Create local signup/login handlers with password hashing.
7. **RBAC Middleware:** Protect routes based on `CLIENT`, `PRO`, and `ADMIN` roles.

## Phase 4: Core Marketplace Features
8. **Discovery APIs:** Implement search and filtering for pros and services.
9. **Pro Dashboard:** APIs for pros to manage their profile and offerings.
10. **Booking Engine:** Implement the full lifecycle of a service request.

## Phase 5: Wallet & Integration
11. **Payments:** Implement fund deposit and payout logic.
12. **Frontend Integration:** Systematic replacement of hardcoded data in Next.js pages with real API fetches (using `slugs.md` as checklist).

## Phase 6: Documentation & Verification
13. **API Documentation:** Create `API.md` listing all created endpoints with their methods, parameters, and example responses.
14. **System Verification:** Perform `curl` tests for ALL endpoints to ensure reliability and correct behavior.
15. **Final Audit:** End-to-end testing of the marketplace flow in the browser.

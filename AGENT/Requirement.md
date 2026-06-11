# Nexa_ng Implementation Requirements

## Backend Standards
- [ ] Backend is fully autonomous (no external auth dependencies for core flow).
- [ ] JWT payloads include `user_id` and `role`.
- [ ] All password storage uses secure hashing (Argon2/bcrypt).
- [ ] Database schema covers all categories in `specialties.md`.

## Integration Standards
- [ ] Every `page.tsx` in `src/app` is free of hardcoded mock arrays.
- [ ] UI reflects user state (e.g., login buttons change to dashboard links).
- [ ] `RoleGate` effectively blocks unauthorized access to Pro/Admin areas.

## API Standards
- [ ] Error messages are clear and follow a consistent format.
- [ ] Pagination is implemented for large lists (Pro results, Bookings).
- [ ] Payload keys use `snake_case`.

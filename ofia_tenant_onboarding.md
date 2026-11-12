# Ofia — Automated Tenant Onboarding & Infrastructure Provisioning

## 1. Project objective

Replace Ofia's current manual tenant-provisioning process with a complete self-service onboarding wizard.

The implementation must cover the frontend screens, backend provisioning services, provider API integrations, database setup, credential management and onboarding workflow.

The two primary infrastructure integrations are:

- **Cloudinary:** Automatically provision a new customer-owned Cloudinary account using its Agent Account Creation API.
- **Neon:** Automatically create a temporary Claimable Neon database for the customer during onboarding, then guide the customer through claiming ownership of that database into their own Neon account and organisation.

The Neon Claimable Database flow is the intended primary approach. Do not replace it with a customer API-key entry workflow.

## 2. Audit the existing implementation first

Before writing code, inspect:

- Existing Ofia tenant creation and provisioning workflows.
- Separate Admin frontend and its tenant-management screens.
- Existing tenant database schema and infrastructure credentials table.
- Existing Neon database connections and migration processes.
- Existing Cloudinary integration.
- Authentication and user-registration flows.
- Existing microservices and how they resolve tenant configuration.
- Existing Redis configuration and infrastructure.

Document what already exists, what needs modification and what needs to be added.

Do not create a second tenant-management or provisioning system.

## 3. Cloudinary account provisioning

Use Cloudinary's Agent Account Creation API to test automatic account creation for new Ofia customers.

Expected workflow:

1. Customer completes the relevant business-registration information.
2. Ofia's backend initiates Cloudinary account creation using the customer's email.
3. Cloudinary returns the account configuration and credentials.
4. Cloudinary sends its verification email to the customer.
5. Ofia securely stores the returned credentials against the correct tenant.
6. Customer completes Cloudinary's email verification.
7. Ofia verifies that the account and integration are operational.

Also investigate support for customers who already have Cloudinary accounts and want to connect them instead.

Important:
- Never expose Cloudinary API secrets in frontend code.
- Verify API eligibility, rate limits and commercial restrictions.
- Implement proper handling for failed provisioning and unverified accounts.

## 4. Neon Claimable Database provisioning — primary workflow

This is a critical requirement.

Ofia must provision a temporary Neon Claimable Database for each new tenant during onboarding. The customer should not need to create a Neon account before Ofia can initiate database provisioning.

### Step A: Create the temporary database

When the customer reaches the infrastructure-provisioning stage:

1. Ofia's backend calls Neon's Claimable Database provisioning API.
2. Neon creates the temporary PostgreSQL database.
3. Neon returns the project details and initial database connection credentials.
4. Ofia securely stores the project ID, connection details and claim-related metadata against the tenant.
5. Ofia updates the onboarding status to `database_provisioned`.

### Step B: Initialise the database

Before asking the customer to claim ownership:

1. Connect to the temporary database from the backend.
2. Run the appropriate Ofia database migrations.
3. Initialise the required tenant-specific schema and configuration.
4. Create the necessary database roles and permissions.
5. Verify database connectivity and successful initialisation.

The application must be able to use the database during the onboarding process.

### Step C: Send the customer an ownership-claim email

Database claiming must be an explicit stage of the onboarding wizard.

Ofia should:

1. Request a valid claim link from Neon's Claimable Database API.
2. Generate the claim link immediately before sending the email because claim codes are short-lived.
3. Send the customer an email explaining that their business database has been created and is ready to be claimed.
4. Include a prominent **Claim Your Database** button.
5. Direct the customer to Neon's official claim and authentication process.

The customer should be able to sign in to an existing Neon account or create a new one, then select the destination organisation and approve the transfer.

The customer must not provide their Neon password to Ofia.

### Step D: Confirm ownership transfer

After the customer completes the claim process:

1. Ofia must verify the actual claim status through Neon's supported API or status mechanism.
2. Wait for Neon's confirmed successful transfer state, including the documented `reconciled` state where applicable.
3. Retrieve the updated connection credentials.
4. Update the tenant's infrastructure configuration securely.
5. Verify that the database is accessible using the new credentials.
6. Run a connectivity test from the relevant Ofia services.
7. Mark the Neon integration as `connected` and ownership as `customer_owned`.

Do not assume that clicking the email link means ownership transfer has completed.

### Step E: Claim expiry and reminders

The temporary database has a limited unclaimed lifetime, and the claim code has a separate expiry.

Implement:

- Claim-link regeneration where supported.
- Reminder emails.
- Claim-status tracking.
- Expiry warnings.
- Failure handling if the database expires before the customer claims it.
- A recovery process that can provision a replacement database and restore the necessary tenant setup where possible.

Verify the actual limits and expiry behaviour against Neon's current documentation before implementation.

**The ownership-claim stage must be part of the onboarding completion criteria.**

## 5. Onboarding wizard screens

Design and implement the following screens.

### Screen 1: Business registration
- Business name.
- Business email.
- Administrator's name.
- Administrator's email.
- Password and authentication.
- Business category.
- Other required tenant details.

### Screen 2: Business profile
- Business information.
- Contact information.
- Business address.
- Business-specific configuration.

### Screen 3: Infrastructure provisioning
Show the customer the infrastructure setup progress.

Include:
- Cloudinary account creation.
- Cloudinary email verification.
- Neon database provisioning.
- Database initialisation.
- Neon ownership claiming.
- Final connection verification.

### Screen 4: Neon database claiming
Display:
- Confirmation that the database has been created.
- Explanation that the customer will own their database.
- A button to send or resend the claim email.
- Claim status.
- Instructions for creating or connecting a Neon account.
- Claim-link expiry information where appropriate.

The customer should be able to leave this screen, open their email, complete the claim process and return to Ofia.

### Screen 5: Integration verification
Show the actual connection status of:
- Neon PostgreSQL.
- Cloudinary.
- Other required infrastructure services.

### Screen 6: Onboarding completion
Only declare onboarding complete when the mandatory infrastructure requirements have been verified.

Allow customers to resume onboarding if they leave before completion.

## 6. Backend provisioning architecture

Build or extend a central Ofia Provisioning Engine.

It should coordinate:
- Tenant creation.
- Cloudinary account provisioning.
- Neon Claimable Database creation.
- Database migrations.
- Claim-email generation and delivery.
- Claim-status reconciliation.
- Credential rotation.
- Tenant configuration updates.
- Final connection verification.

Implement:
- Provider-specific API adapters.
- Idempotency to prevent duplicate resource creation.
- Retry mechanisms.
- Failure recovery.
- Secure secret storage.
- Audit logging.
- Provisioning state tracking.
- Background jobs for reminders and status checks.
- Tenant isolation and access control.

Never store plaintext provider secrets in browser storage or expose them to the frontend.

## 7. Tenant infrastructure registry

Extend the existing infrastructure registry or create the necessary schema additions.

Track, at minimum:

- Tenant ID.
- Provider.
- Resource/project ID.
- Resource type.
- Ownership status.
- Provisioning status.
- Verification status.
- Claim status.
- Customer email.
- Credential vault reference.
- Provisioning timestamp.
- Claim-email timestamp.
- Claim expiry information.
- Last successful connection test.
- Error details and retry metadata.

Suggested Neon lifecycle states:

`not_started`

`provisioning`

`database_provisioned`

`migrations_running`

`claim_pending`

`claim_email_sent`

`claim_in_progress`

`ownership_transferred`

`credentials_refresh_pending`

`connected`

`failed`

`expired`

## 8. Admin application integration

The existing Ofia Admin application must continue to support authorised administrators.

Add visibility into:
- Tenant provisioning progress.
- Cloudinary account status.
- Neon project status.
- Database claim status.
- Ownership confirmation.
- Failed provisioning operations.
- Retry and recovery operations.
- Infrastructure connection health.

Administrators must be able to diagnose issues without manually managing every tenant's database connection.

## 9. Security and reliability

- Encrypt infrastructure credentials at rest.
- Keep all provider API calls server-side.
- Use least-privilege credentials wherever supported.
- Never expose database connection strings or provider secrets unnecessarily.
- Implement tenant-level access isolation.
- Log administrative and infrastructure operations.
- Rotate and refresh credentials after ownership transfer.
- Avoid duplicate projects during retries.
- Protect claim links and customer-specific provisioning tokens.
- Verify all provider responses before advancing onboarding states.

## 10. Testing and acceptance criteria

Run a real end-to-end test using provider APIs and accounts available to Ofia.

The demonstration must show:

1. A new business registers on Ofia.
2. Ofia creates the tenant.
3. Cloudinary account provisioning is initiated.
4. Cloudinary sends the verification email.
5. Ofia provisions a temporary Neon Claimable Database.
6. Database migrations run successfully.
7. Ofia sends the Neon ownership-claim email.
8. The customer follows the email link.
9. The customer creates or signs into their Neon account.
10. The customer claims the database into their own Neon organisation.
11. Ofia detects the successful transfer.
12. Ofia refreshes the database connection credentials.
13. The relevant Ofia services reconnect successfully.
14. The onboarding wizard shows verified completion.
15. The Admin application displays the correct infrastructure and ownership status.

Test expired claim links, failed provisioning, duplicate requests, interrupted onboarding, expired unclaimed databases and credential-rotation failures.

Do not report mocked integrations as successful live provider integrations.

## 11. Deliverables

- Existing-system audit.
- Proposed architecture and implementation plan.
- Complete onboarding wizard screens.
- Backend APIs and provisioning engine.
- Cloudinary API integration.
- Neon Claimable Database integration.
- Neon ownership-claim email workflow.
- Database migrations and schema updates.
- Secure credential management.
- Admin application updates.
- Automated tests and end-to-end demonstration.
- Deployment and environment configuration documentation.

## Final implementation instruction

The Neon Claimable Database workflow is a central requirement, not an optional alternative.

The intended customer experience is:

**Register on Ofia → Ofia creates the temporary Neon database → Ofia initialises it → Customer receives an email → Customer claims ownership through Neon → Ofia refreshes credentials → Database is verified → Onboarding completes.**

Build this into the existing Ofia architecture without duplicating tenant management, authentication or infrastructure configuration functionality.

## Additional requirement: Tenant slug selection and availability checking

The onboarding wizard must include a dedicated **Choose Your Business URL / Tenant Slug** step.

The tenant slug identifies the business within Ofia's multi-tenant ecosystem and forms part of its unique tenant URL.

### 1. Customer chooses their slug

After entering their business name, the customer should be asked to choose a preferred tenant slug.

Example:

- Business name: Laurel Academy
- Suggested slug: `laurelacademy`
- Tenant URL preview: `laurelacademy.ofia.ng`

Ofia may suggest a slug automatically based on the business name, but the customer must be able to edit it.

### 2. Live slug availability lookup

As the customer types, the frontend should call a backend availability-check endpoint.

The backend must check:

- Existing tenant slugs.
- Previously registered or reserved slugs.
- System-reserved names.
- Slugs that are unavailable because they conflict with existing Ofia routes or platform functionality.

Display clear feedback:

- Available: The customer can use this slug.
- Already taken: Suggest alternative slugs.
- Reserved: Explain that the slug cannot be used.
- Invalid: Explain the permitted characters and length.
- Checking: Show that availability is being verified.

Implement debouncing so the backend is not called on every keystroke.

### 3. Slug validation rules

Define and enforce consistent slug rules:

- Lowercase letters.
- Numbers where appropriate.
- Hyphens between words.
- No spaces or special characters.
- No leading or trailing hyphens.
- Enforce a reasonable minimum and maximum length.

Normalise slugs consistently before checking availability.

### 4. Alternative suggestions

If the requested slug is taken, Ofia should suggest alternatives based on the business name.

For example, if `laurelacademy` is taken:

- `laurel-academy`
- `laurelacademyng`
- `laurelacademy01`

Suggestions must also be checked against the availability service before being presented as available.

### 5. Backend enforcement and race-condition protection

Availability checks alone are not sufficient.

When the customer submits the onboarding form, the backend must perform an authoritative availability check and reserve the slug transactionally.

Enforce a database-level unique constraint on the appropriate slug scope so that two customers cannot register the same slug simultaneously.

The system must handle the possibility that another customer claims a slug between the initial availability check and final registration.

### 6. Admin application integration

The existing Admin application should display:

- Tenant name.
- Tenant slug.
- Tenant URL.
- Slug registration date.
- Slug status.
- Any authorised slug changes.

Slug changes must be controlled because changing a tenant slug can affect storefront URLs, links, integrations and customer access.

### 7. Acceptance criteria

Demonstrate that:

1. A customer can enter a business name.
2. Ofia suggests an appropriate slug.
3. The customer can edit the suggested slug.
4. Availability is checked against existing tenants.
5. Taken and reserved slugs are rejected.
6. Alternative suggestions are offered.
7. Two simultaneous registrations cannot claim the same slug.
8. The confirmed slug is permanently associated with the correct tenant.
9. The tenant's URL resolves to the correct business workspace.
10. The Admin application displays the assigned slug.

**Important:** Slug selection and successful reservation must happen before the tenant's infrastructure provisioning is finalised. The tenant ID and slug must remain consistently associated throughout provisioning, database creation and service configuration.
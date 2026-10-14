# OFIA MOBILITY WHITE-LABEL ARCHITECTURE & MULTI-TENANT SPECIFICATION

Transforming Ofia Mobile Applications into a Multi-Tenant, White-Label Mobility Platform with Tiered Neon Database Isolation.

You have:

* **Ofia Admin** → platform/super-admin control plane & central database registry
* **Ofia ERP** → tenant environment; tenant backend, dashboard, fleet management, and tenant-level mobile-app configuration
* **Ofia Mobile Go** (`@mobile_go`) → customer/passenger-facing Flutter app
* **Ofia Mobile Driver** (`@mobile_driver`) → driver-facing Flutter app
* Existing Ofia apps are already designed and largely complete
* Existing splash, logo, banners, icons and screens must be preserved
* Goal: **one Flutter codebase per app, capable of serving many tenants through tenant-specific configuration, without creating separate Flutter projects/folders for each client**

---

# 1. CONTEXT

We currently have two Flutter mobile applications:

1. **Ofia Mobile Go** — customer/passenger application
2. **Ofia Mobile Driver** — driver application

These applications are currently designed as essentially single-client applications. The screens, UI, assets, navigation and functionality have already been designed and reviewed.

We now need to transform them into **multi-tenant, configurable white-label applications** without creating separate Flutter projects, codebases, folders or duplicated application logic for every client.

The target end-to-end architecture is:

```text
                         OFIA ADMIN
             (Super Admin / Platform Control Plane)
             (Central Tenant DB Registry & Provisioning)
                            │
               ┌────────────┴────────────┐
               │                         │
           TENANT A                  TENANT B
      (Standard Fleet)          (Enterprise White-Label)
               │                         │
          OFIA ERP A                OFIA ERP B
      (Fleet Operations)        (Fleet Operations)
               │                         │
        Tenant Config             Tenant Config
               │                         │
        ┌──────┴──────┐           ┌──────┴──────┐
        │             │           │             │
   Mobility App   Driver App   Mobility App  Driver App
        │             │           │             │
        └─────────────┴───────────┴─────────────┘
                        │
                API Gateway Router
            (Tenant Resolution & Auth)
                        │
         ┌──────────────┴──────────────┐
         ▼                             ▼
[Shared Neon Project/DB]      [Dedicated Neon Project]
 (RLS / Logical Catalog)      (Full Physical Isolation)
 (Cost-effective, Zero Cold)  (Dedicated Compute, PITR)
```

The critical principle is:

> **ONE CODEBASE + MANY TENANTS + TENANT-SPECIFIC CONFIGURATION + TIERED DATABASE ISOLATION**

Do not create a separate Flutter project for each client.

Do not duplicate screens.

Do not duplicate business logic.

Do not hard-code a client's branding into the application.

---

# 2. PRIMARY OBJECTIVE

Transform both existing Ofia Flutter applications into configurable multi-tenant applications where:

* each installation/build can be associated with a tenant;
* the backend knows which tenant the application belongs to;
* tenant data is isolated;
* tenant branding can be different;
* tenant assets can be different;
* tenant splash-screen content can be different;
* tenant banners can be different;
* available mobility services can be different;
* features can be enabled/disabled per tenant;
* configuration can be changed without rebuilding the APK wherever technically possible;
* the existing Ofia UI/design is preserved;
* the same Flutter codebase serves all tenants;
* Ofia Admin can provision and control tenants;
* Ofia ERP allows the tenant administrator to configure the parts of the mobile app that they are permitted to configure.

---

# 3. DO NOT REBUILD THE EXISTING UI

Before making architectural changes:

### Audit the existing applications.

Inspect:

* all screens;
* routes;
* navigation;
* widgets;
* components;
* services;
* API clients;
* authentication;
* local storage;
* state management;
* assets;
* splash implementation;
* banner implementation;
* logos;
* colors;
* typography;
* icons;
* images;
* hard-coded strings;
* hard-coded tenant information;
* hard-coded service availability;
* hard-coded API endpoints;
* hard-coded business rules.

Do NOT redesign the application.

Do NOT replace existing screens merely for the sake of implementing multi-tenancy.

The existing visual design is considered approved.

The goal is to **parameterize the existing application**.

---

# 4. ESTABLISH A TENANT IDENTITY MODEL

Every tenant must have a unique immutable:

```text
tenantId
```

Example:

```text
tenantId: TEN_001
tenantId: TEN_002
tenantId: TEN_003
```

Do not use:

* tenant name;
* company name;
* display name;
* email;
* domain;

as the primary tenant identifier.

The tenant ID must be stable even if the tenant changes its name.

---

# 5. MOBILE APPLICATION IDENTITY

We need to distinguish between:

### Platform

```text
Ofia
```

### Application

```text
mobile-go
mobile-driver
```

### Tenant

```text
tenantId
```

### Installation/device

Each installation should have its own installation/device identifier where required.

The system should conceptually be able to resolve:

```text
Platform
   ↓
Application
   ↓
Tenant
   ↓
User
   ↓
Device / Installation
```

Do not confuse:

```text
tenantId
```

with:

```text
userId
```

or:

```text
deviceId
```

or:

```text
buildId
```

These are separate concepts.

---

# 6. DETERMINE HOW TENANT ID IS PROVIDED TO THE MOBILE APP

Implement a robust tenant-resolution strategy.

The architecture supports three resolution models, with **Option C (Build-Time Identity + Runtime Hydration)** serving as the mandatory production standard for enterprise white-label accounts:

### Option A — Tenant-Specific Build Configuration (Build-Time Only)

```text
TENANT_ID=TEN_001
APP_TYPE=go  # or driver
```

Injected into the build via `--dart-define` or generated config constants. All branding, package names, and endpoints are compiled directly into the binary. (Static, requires rebuilds for branding changes).

### Option B — Dynamic Tenant Discovery (Universal Container)

The app is published as a single universal listing. Tenant resolution occurs dynamically at runtime via:
* Deep links / QR codes (`https://go.ofia.ng/join/:tenantSlug`);
* Corporate email domain matching (`user@acmetransit.com` resolves `acme` fleet);
* Onboarding tenant code prompt.

### Option C — Combination: Build-Time Store Identity + Runtime Configuration (Recommended Enterprise Standard)

For enterprise tenants deploying under their **own Google Play Developer and Apple Developer accounts**, the application uses **Option C**:

1. **Build-Time Native Identity:**
   * Unique `applicationId` / `bundleId` (`com.acmetransit.rider`, `com.acmetransit.driver`);
   * Unique App Store and Google Play listing metadata, native app icons, and native launch splash screens;
   * Immutable build-time `TENANT_ID` and tenant public signing keys injected via build flavor matrix;
   * Third-party SDK keys restricted to that specific tenant bundle ID (Google Maps, Firebase).

2. **Runtime Configuration Hydration:**
   * Once launched, the app immediately queries the Ofia Backend Configuration Service:
     ```http
     GET /api/v1/mobile/config
     Header: X-Ofia-Tenant-Id: TEN_001
     ```
   * Dynamically loads tenant theme colors, promotional banners, service entitlements (Ride, Delivery, Shuttles), splash messages, and fleet rules from Ofia ERP without requiring app store updates.

Do NOT hard-code:

```dart
const tenantId = "TEN_001";
```

inside application logic. Create a proper tenant/app configuration layer (`TenantConfigService`) that resolves identity from build environment flags and hydrates state from the backend.

---

# 7. CENTRAL MOBILE CONFIGURATION MODEL

Create a central configuration object/service.

Conceptually:

```text
MobileAppConfig
```

which can contain:

```text
tenantId
appType
appName
displayName
logo
splashLogo
splashBackground
splashMessage
primaryColor
secondaryColor
accentColor
banners
enabledServices
featureFlags
supportInformation
contactInformation
etc.
```

Do not scatter configuration throughout the Flutter application.

Screens should consume configuration through a central configuration/state layer.

---

# 8. BRANDING CONFIGURATION

The following should be tenant configurable:

### Logo

Each tenant can have its own:

* app logo;
* splash logo;
* possibly light/dark variants if the design requires it.

### Colors

Support configurable:

* primary color;
* secondary color;
* accent color;
* background color where appropriate.

Do not allow arbitrary tenant configuration to destroy the approved UI design.

Use controlled theme tokens.

Example:

```text
primaryColor
secondaryColor
accentColor
```

rather than allowing tenants to modify every widget individually.

---

# 9. SPLASH SCREEN CONFIGURATION

The existing splash screen must remain visually consistent with the approved Ofia design.

However, its tenant-specific content should be configurable.

Support:

### Tenant splash logo

Uploaded by the tenant/admin.

### Splash message

Example:

> "Welcome to ABC Transport"

or:

> "Move smarter with ABC"

### Optional supporting text

If currently supported by the design.

### Background

If the existing design allows it, support configurable background asset/color.

The splash screen must NOT require a new Flutter build every time the tenant changes:

```text
splash message
logo
background
```

wherever technically feasible.

---

# 10. ASSET MANAGEMENT

Do NOT put every client's assets into:

```text
assets/clientA/
assets/clientB/
assets/clientC/
```

inside the Flutter repository.

That would defeat the purpose of multi-tenancy.

Instead, use tenant-aware remote asset storage.

Conceptually:

```text
Storage
│
├── tenants/
│   ├── TEN_001/
│   │   ├── branding/
│   │   │   ├── logo.png
│   │   │   ├── splash-logo.png
│   │   │   └── ...
│   │   └── banners/
│   │       ├── banner-01.png
│   │       └── banner-02.png
│   │
│   └── TEN_002/
│       ├── branding/
│       └── banners/
```

The exact storage implementation should follow the existing backend architecture.

The Flutter app receives URLs/references to the assets.

Example:

```json
{
  "logoUrl": "...",
  "splashLogoUrl": "...",
  "bannerUrls": []
}
```

Assets must be tenant-scoped.

---

# 11. BANNER MANAGEMENT

The existing in-app banner capability should become tenant-aware.

Each tenant should be able to have its own:

* banner image;
* title;
* description;
* CTA;
* destination/action;
* active/inactive state;
* ordering;
* optional start/end dates.

For example:

```text
Tenant A
    Banner 1
    Banner 2

Tenant B
    Banner 1
    Banner 2
    Banner 3
```

The application must never display Tenant A's banners to Tenant B.

---

# 12. SERVICE / MODULE ENTITLEMENTS

This is extremely important.

The mobility platform currently offers multiple services.

For example:

```text
Service 1
Service 2
Service 3
Service 4
Service 5
Service 6
```

Tenant A might have:

```text
Service 1
Service 2
Service 4
```

Tenant B might have:

```text
Service 1
Service 3
Service 5
Service 6
```

The tenant configuration must determine which services are available.

Example:

```json
{
  "services": {
    "ride": true,
    "delivery": false,
    "schoolTransport": true,
    "corporateTransport": false
  }
}
```

---

# 13. VERY IMPORTANT — FEATURE HIDING IS NOT SECURITY

Do NOT merely hide a service in Flutter.

For example:

```dart
if (!enabled) {
   hideButton();
}
```

is insufficient.

The backend must also enforce tenant entitlements.

If:

```text
Tenant A
delivery = false
```

then Tenant A's backend must reject unauthorized delivery operations even if somebody manipulates the mobile application.

Therefore:

```text
Flutter
   ↓
UI entitlement
   ↓
API
   ↓
Backend authorization
   ↓
Tenant entitlement validation
   ↓
Database
```

The backend is the ultimate authority.

---

# 14. REAL-TIME CONFIGURATION

We want to be able to change configurable features without rebuilding/redeploying the APK.

For example:

### Today

```text
Tenant A
Ride = ON
Delivery = OFF
```

### Tomorrow

Super Admin changes:

```text
Delivery = ON
```

The already-installed app should retrieve the updated configuration and display the service.

No APK rebuild should be required for ordinary runtime configuration.

The same applies to:

* banners;
* splash text;
* logos;
* colors;
* service availability;
* feature flags;
* other runtime configuration.

---

# 15. CONFIGURATION CACHING

The app should not necessarily request configuration on every screen.

Implement sensible configuration caching.

Example:

```text
App launch
     ↓
Load cached config
     ↓
Display application
     ↓
Fetch latest configuration
     ↓
Validate
     ↓
Update local configuration
```

The agent should design appropriate behavior for:

* offline mode;
* stale configuration;
* failed configuration request;
* invalid configuration;
* asset download failure.

The application should degrade gracefully.

---

# 16. OFIA ADMIN — SUPER ADMIN CONFIGURATION

Add a dedicated section to **Ofia Admin**:

# Mobile App Provisioning

This is the platform-level control center.

The Super Admin should be able to:

### Tenant selection

Select:

```text
Tenant
```

### Application selection

Choose:

```text
Mobile Go
Mobile Driver
```

### Provisioning status

Show:

```text
Not Provisioned
Provisioned
Active
Suspended
Revoked
```

### Tenant/app identity

Display:

```text
Tenant ID
Application ID
Configuration ID
Build/version
Provisioning date
```

Do not expose unnecessary technical fields to ordinary tenant administrators.

---

# 17. OFIA ADMIN — MOBILE APP TECHNICAL CONFIGURATION SCREEN

Create a screen such as:

```text
Mobile App Provisioning
```

Sections:

### App Identity

* Tenant
* App type
* App status
* Tenant ID
* Application identifier

### Runtime Configuration

* Configuration version
* Last configuration update
* Configuration status

### Feature Entitlements

Super Admin controls which modules/services the tenant is allowed to use.

### Build / Release Information

Where applicable:

* current app version;
* minimum supported version;
* build number;
* release status.

### Security

* app activation;
* app suspension;
* configuration signing/versioning if required.

### Deployment

Where applicable:

* Android package information;
* iOS bundle information;
* release/build status.

Do not create unnecessary build-generation functionality unless the current deployment architecture actually requires it.

---

# 18. OFIA ADMIN — BRANDING / ASSET CONFIGURATION

Create a dedicated screen:

# Mobile App Branding

Allow Super Admin to configure or override tenant branding where appropriate.

Sections:

### App Logo

Upload:

* primary logo;
* splash logo.

### Colors

Configure:

* primary;
* secondary;
* accent.

### Splash Screen

Configure:

* splash message;
* supporting text;
* logo;
* background.

### Banners

Upload/manage tenant-specific banners.

### Preview

Provide a mobile preview showing:

```text
Splash
Home
Service selection
Banner
```

using the tenant's configuration.

---

# 19. OFIA ERP — TENANT MOBILE APP CONFIGURATION

Inside the existing **Ofia ERP** tenant environment, add:

# Mobile App

This is where the tenant administrator manages the configurable parts of their own mobile experience.

They should NOT see platform-level technical configuration.

They should see only things they are permitted to manage.

Possible sections:

```text
Mobile App
├── Overview
├── Branding
├── Splash Screen
├── Banners
├── Services
├── App Information
└── Preview
```

---

# 20. OFIA ERP — BRANDING

Tenant administrator can manage:

* logo;
* splash logo;
* approved brand colors;
* splash message;
* supporting text.

The system should validate:

* file type;
* file size;
* image dimensions;
* aspect ratio where required.

---

# 21. OFIA ERP — SPLASH SCREEN

Create a dedicated configuration interface.

Fields:

```text
Splash Logo
Splash Message
Supporting Text
Background
```

Provide:

### Live preview

The administrator should see what the splash screen will look like before publishing.

Include:

```text
Save Draft
Preview
Publish
```

---

# 22. OFIA ERP — BANNERS

Tenant administrators should be able to:

* upload banner;
* add title;
* add description;
* configure CTA;
* select destination;
* activate/deactivate;
* reorder banners.

Where supported:

```text
Start date
End date
```

---

# 23. OFIA ERP — SERVICES

The tenant should see available services.

However, distinguish between:

### Entitled services

Controlled by Ofia Admin.

### Activated services

Controlled by the tenant, if permitted.

Example:

```text
Ofia Admin:
Tenant is entitled to:
✓ Ride
✓ Delivery
✓ Corporate Transport
✗ School Transport
```

Tenant sees:

```text
Ride                  ON
Delivery              OFF
Corporate Transport   ON
```

The tenant cannot enable:

```text
School Transport
```

because it was never entitled by the platform.

---

# 24. MOBILE GO VS MOBILE DRIVER

The configuration system must understand that:

```text
mobile-go
```

and

```text
mobile-driver
```

are different applications.

Some configuration is shared:

```text
Tenant
Brand
Logo
Colors
Configuration
```

Some configuration is application-specific.

For example:

```text
Mobile Go
→ customer services
→ booking
→ passenger experience
→ customer banners
```

while:

```text
Mobile Driver
→ driver availability
→ trips
→ navigation
→ earnings
→ driver status
```

Do not accidentally expose customer modules inside the driver application.

---

# 25. SHARED TENANT CONFIGURATION

Where appropriate, maintain a common tenant configuration:

```text
Tenant
├── Branding
├── Identity
├── Entitlements
└── General configuration
```

Then application-specific configuration:

```text
Tenant
├── Mobile Go Config
└── Mobile Driver Config
```

This avoids duplicating the same tenant information.

---

# 26. APP CONFIGURATION VERSIONING

Every configuration update should have a version.

Example:

```text
configVersion: 17
```

The mobile app can compare:

```text
localConfigVersion
vs
serverConfigVersion
```

and retrieve updates only when required.

This also provides an audit trail.

---

# 27. AUDIT LOG

Ofia Admin should be able to see:

```text
Who changed the configuration?
What changed?
When?
Which tenant?
Which application?
Previous value?
New value?
```

Example:

```text
Tenant: ABC Transport
Application: Mobile Go

Changed:
Delivery: OFF → ON

Changed by:
Super Admin

Date:
2026-10-08
```

---

# 28. SECURITY / APPLICATION DATA ISOLATION

Every API request originating from a mobile application must ultimately resolve to the correct tenant.

Do not trust the Flutter application alone to enforce tenant isolation.

The backend must determine:

```text
Authenticated user
      ↓
Tenant membership
      ↓
Tenant ID
      ↓
Authorization
      ↓
Tenant-scoped data
```

A user from Tenant A must never be able to retrieve Tenant B's:

* passengers;
* drivers;
* vehicles;
* trips;
* bookings;
* banners;
* branding;
* configuration;
* operational data.

---

# 28B. NEON DATABASE MULTI-TENANCY & TIERED ISOLATION ARCHITECTURE

Mobility systems handle high-frequency, safety-critical, and financial data: real-time GPS telemetry (driver location updates every 3–5 seconds), passenger travel histories, driver banking/payout accounts, and fare transactions. 

To provide enterprise-grade security and compliance without incurring excessive cost or operational overhead, the platform utilizes a **Tiered Hybrid Database Isolation Architecture** built on Neon PostgreSQL.

### 1. The Isolation Spectrum on Neon

| Isolation Model | Blast Radius | Compute Overhead | Cost Profile | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Separate Neon Project** | **Absolute (Physical + Compute)** | High (N independent computes) | High | Tier 2 Enterprise / VIP White-Label Fleets |
| **Separate Neon Branch** | **Strong (Copy-on-write)** | Medium (Isolated endpoints) | Medium | Tenant Staging / Sandbox / A/B Testing |
| **Separate Logical DB (`CREATE DATABASE`)** | **High (Catalog isolated)** | Low (Shared project compute) | Low | Standard Managed Fleets |
| **Shared DB + Row-Level Security (RLS)** | **Medium (Logical namespace)** | Lowest (Shared pool) | Lowest | Starter / Micro Fleets & Self-Serve |

### 2. The Tiered Hybrid Architecture

Rather than forcing every tenant into a separate Neon Project on day one (which causes compute cold-start latency, migration drift, and quota exhaustion), the platform divides tenants into two distinct operational tiers:

#### Tier 1 — Standard Fleets (Shared Project, Logical Database or RLS)
* Run on a shared Neon database with `tenant_id` scoping and PostgreSQL Row-Level Security (RLS) or logical databases (`CREATE DATABASE tenant_[slug]`).
* Benefits: Instant onboarding, zero cold-start delay for small fleets, consolidated connection pooling, and zero idle compute billing.

#### Tier 2 — Enterprise White-Label Fleets (Dedicated Neon Project)
* Reserved for paying white-label enterprise clients who demand dedicated compute guarantees, contractual data residency, private SLAs, or isolated backups.
* Automatically provisioned via the Neon API / Neon MCP tool (`create_project`) directly from `@ofia_admin`.
* Benefits:
  * **Zero Noisy Neighbors:** Peak morning rush-hour pings from a 2,000-vehicle fleet cannot exhaust CPU, RAM, or connection pools of other tenants.
  * **Independent Point-In-Time Recovery (PITR):** Neon allows instant branching and rollback from any second. Tenant A can be restored without touching Tenants B, C, or D.
  * **Clean Enterprise Handover:** If a client graduates to self-hosted infrastructure, their entire Neon project can be transferred or exported without dissecting shared tables.

### 3. Control Plane Database Registry (`tenant_database_configs`)

The central control plane database in `@ofia_admin` acts as the single source of truth for database routing:

```sql
CREATE TABLE tenant_database_configs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) UNIQUE NOT NULL,
  tenant_slug VARCHAR(100) UNIQUE NOT NULL,
  isolation_tier VARCHAR(30) NOT NULL DEFAULT 'SHARED', -- 'SHARED' | 'DEDICATED_PROJECT' | 'DEDICATED_BRANCH'
  neon_project_id VARCHAR(100),
  neon_endpoint_id VARCHAR(100),
  neon_branch_id VARCHAR(100),
  connection_string_encrypted TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  scale_to_zero_delay_seconds INT DEFAULT 300,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tenant_db_lookup ON tenant_database_configs (tenant_id, is_active);
```

### 4. Dynamic Connection Routing & Serverless Pooling in `@ofia_erp`

The backend database layer in [`ofia_erp/src/lib/db.ts`](file:///Volumes/ReedBreedCC/ofia_ng/ofia_erp/src/lib/db.ts) dynamically resolves database connections per request:

```text
API Request (with X-Tenant-Id: TEN_001)
     ↓
Tenant Database Cache (Redis / In-Memory LRU, 60s TTL)
     ↓
Resolve Connection String
     ↓
Neon Serverless Pooler (-pooler.neon.tech:5432)
     ↓
Tenant Postgres Engine (Dedicated or Shared)
```

Implementation guidelines:
* **Connection Pooling:** Always connect through Neon's serverless connection pooler (`-pooler.neon.tech`) using `@neondatabase/serverless` to prevent connection exhaustion in serverless edge environments.
* **Pool Cache:** Maintain an LRU cache of active `Pool` instances keyed by `tenant_id` to prevent socket thrashing while tearing down idle tenant pools after 5 minutes of inactivity.

### 5. Mobile Application Decoupling Principle

Neither [`mobile_go`](file:///Volumes/ReedBreedCC/ofia_ng/mobile_go/lib/main.dart) nor [`mobile_driver`](file:///Volumes/ReedBreedCC/ofia_ng/mobile_driver/lib/main.dart) should **ever** connect directly to Neon PostgreSQL or hold database credentials.

* The Flutter apps interact **strictly** with the backend API gateway via HTTPS/WebSockets.
* Requests carry the immutable `tenantId` (via `X-Tenant-Id` header, JWT payload, or subdomain mapping).
* The backend authenticates the user, resolves the tenant's database connection dynamically, and executes the queries.
* This abstraction ensures that promoting a tenant from Tier 1 (Shared) to Tier 2 (Dedicated Neon Project) requires **zero mobile app updates or rebuilds**.

### 6. Mitigating Real-Time Mobility Latency & Scale-to-Zero

Neon projects auto-suspend compute to optimize cost when idle. In mobility applications, a 1–3 second cold-start delay when a passenger opens the app to hail a ride is unacceptable.

* **For Dedicated Enterprise Projects:** Configure the Neon compute endpoint `suspend_timeout_seconds` to a higher threshold (e.g. 1,800 seconds / 30 minutes) during daytime operational fleet hours (6:00 AM – 11:00 PM).
* **Warm-up Ping on App Launch:** When [`mobile_go`](file:///Volumes/ReedBreedCC/ofia_ng/mobile_go/lib/main.dart) initializes its splash screen or fetches runtime configuration, the gateway fires an asynchronous warm-up query (`SELECT 1`) to ensure the tenant's compute is fully warm before the user reaches the booking map.
* **Driver Location Buffer:** Stream high-frequency driver GPS pings into a low-latency Redis/WebSocket layer, batching persistence to the tenant database to minimize transactional overhead on isolated compute.

### 7. Cross-Tenant Analytics & Super-Admin Reporting

When enterprise tenants reside in separate Neon projects, `@ofia_admin` cannot execute a single cross-database SQL query (`SELECT SUM(fare) FROM trips`).

Super-admin platform metrics (e.g. total rides across all fleets, aggregate GMV, system health) are fulfilled via:
1. **Asynchronous Fan-out Queries:** For on-demand administrative dashboards, `@ofia_admin` issues parallel queries across active tenant connections with aggregate reduction.
2. **Event-Driven Telemetry:** Real-time billing and GMV events are published to a central analytics event bus (or transactional ledger in the Control Plane database) upon trip completion.

### 8. Schema Migration & Drift Prevention Strategy

To prevent schema divergence across dozens of isolated Neon projects:
* **Template Branching:** Maintain a golden `main-schema` branch in Neon.
* **Orchestrated Migration Runner:** CI/CD deployment pipelines query `tenant_database_configs` and sequentially apply schema migrations (via Prisma/Drizzle/migrate) across all active tenant connection strings, logging execution status and aborting on failures.
* **Drift Detection:** Automated daily cron checks verify table checksums across all provisioned tenant projects to guarantee schema uniformity.

---

# 29. DO NOT DUPLICATE FLUTTER PROJECTS

The final repository should remain conceptually:

```text
mobile-go/
mobile-driver/
```

NOT:

```text
client-a-mobility/
client-b-mobility/
client-c-mobility/

client-a-driver/
client-b-driver/
client-c-driver/
```

All tenants should use the same application codebase.

---

# 30. ASSET ARCHITECTURE

Separate:

### Static application assets

These remain inside the Flutter application:

```text
icons
generic illustrations
default UI assets
fonts
generic images
```

### Tenant assets

These live in tenant-specific storage:

```text
tenant logo
tenant splash logo
tenant banners
tenant promotional imagery
```

### Runtime business data

This comes from the tenant backend:

```text
drivers
vehicles
trips
bookings
services
notifications
etc.
```

Do not mix these three categories.

---

# 31. DEFAULT / FALLBACK CONFIGURATION

The app must have a safe default configuration.

If tenant branding fails to load:

```text
Use default Ofia branding.
```

If a banner fails:

```text
Hide banner.
```

If an optional asset fails:

```text
Use fallback.
```

The app must not crash because a tenant uploaded an invalid or unavailable asset.

---

# 32. CONFIGURATION VALIDATION

Before publishing tenant configuration:

Validate:

* required fields;
* valid colors;
* valid image types;
* image dimensions;
* file sizes;
* valid URLs;
* valid service IDs;
* valid feature flags.

Prevent invalid configurations from reaching production.

---

# 33. PREVIEW SYSTEM

Both:

### Ofia Admin

and, where appropriate,

### Ofia ERP

should have a mobile preview.

The preview should render the actual configuration model rather than a fake static mockup.

For example:

```text
Tenant ABC
      ↓
Configuration
      ↓
Preview Renderer
      ↓
Mobile Go Preview
```

This allows the administrator to see:

* splash screen;
* logo;
* colors;
* banners;
* enabled services.

before publishing.

---

# 34. PUBLISHING MODEL

Use:

```text
Draft
   ↓
Preview
   ↓
Validate
   ↓
Publish
   ↓
Active configuration
```

Do not immediately overwrite production configuration every time an administrator changes a field.

This will make the system safer.

---

# 35. IMPORTANT DISTINCTION: RUNTIME VS BUILD-TIME

The implementation must explicitly classify every configurable item as either:

### Build-time

Things that genuinely require an APK/app-store build.

Examples may include:

* application package identifier;
* app-store identity;
* certain native splash assets;
* native permissions;
* signing identity.

### Runtime

Things that should NOT require rebuilding the APK:

* tenant logo inside the application;
* splash message;
* banners;
* colors;
* service availability;
* feature flags;
* promotional content;
* tenant information.

The agent must identify which existing Ofia assets currently require native build-time treatment and determine whether they can be moved to runtime configuration.

---

# 36. IMPORTANT: NATIVE SPLASH SCREEN

If the current splash screen uses native Android/iOS launch-screen assets, do not assume those can all be changed remotely.

Investigate the existing implementation.

If we want a tenant-specific native launch experience without separate builds, determine whether:

1. a generic native launch screen can be used; followed immediately by
2. a runtime-configurable Ofia splash screen.

This is likely preferable for a universal multi-tenant build.

Do not promise runtime modification of assets that are technically compiled into the native application.

---

# 37. APP VERSION MANAGEMENT

The system should distinguish:

```text
App version
```

from:

```text
Configuration version
```

Example:

```text
Mobile Go
App version: 2.1.0
Configuration version: 47
```

A configuration update should not require:

```text
App version 2.1.1
```

unless the code itself has changed.

---

# 37B. WHITE-LABEL STORE DISTRIBUTION ARCHITECTURE: MULTI-TENANT GOOGLE PLAY & APPLE APP STORE SPECIFICATION

When enterprise mobility clients require their own branded applications (e.g. Acme Go, Acme Driver), publishing all branded variants under a single Ofia developer account is strictly prohibited by both Apple and Google Play policies. 

The production architecture mandates: **One shared Flutter core engine per application (`mobile_go` and `mobile_driver`), deployed to each enterprise tenant's distinct Google Play Console and Apple Developer Program accounts via automated build flavoring and CI/CD pipelines.**

---

### 1. The Multi-Account Distribution Mandate

Publishing dozens of white-label apps under a single software vendor account triggers fatal store rejections:
* **Apple App Store Trap:** Violation of **Guideline 4.2.6 (Commercial Templates)** and **Guideline 4.3 (Spam)**. Apple explicitly rejects templated applications unless submitted from the content owner’s own developer account.
* **Google Play Policy Trap:** Violation of the **Repetitive Content / Spam & Minimum Functionality** policy. Publishing multiple apps with identical codebases differing only by colors/logos under one developer account leads to automated policy strikes and account termination.
* **Blast Radius Isolation:** If Tenant A suffers a policy warning or account suspension, Tenant B and the core Ofia platform are completely insulated.

```text
                           OFIA CORE REPOSITORIES
                 ┌────────────────────────────────────┐
                 │  mobile_go      (Passenger Core)   │
                 │  mobile_driver  (Driver Core)      │
                 └──────────────────┬─────────────────┘
                                    │
                         CI/CD Build Matrix (Fastlane)
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
   TENANT A (Acme Transit)                           TENANT B (Metro Fleet)
   ┌───────────────────────────────────┐             ┌───────────────────────────────────┐
   │ Google Play Org: Acme Transit Ltd │             │ Google Play Org: Metro Transit Plc│
   │ Apple Dev Org: Acme Transit Ltd   │             │ Apple Dev Org: Metro Transit Plc  │
   │ Bundle ID: com.acmetransit.go     │             │ Bundle ID: com.metro.rider        │
   │ Driver ID: com.acmetransit.driver │             │ Driver ID: com.metro.driver       │
   └───────────────────────────────────┘             └───────────────────────────────────┘
```

---

### 2. Apple App Store Guidelines & Architecture Compliance

Apple enforces the most rigorous review standards for white-label applications. All tenant deployments must adhere to these specific guidelines:

#### A. Guideline 4.2.6 (Commercial Templates & App Generation)
* **The Rule:** *"Apps created from a commercial template or app generation service must be submitted directly by the provider of the app’s content. These services should not submit apps on behalf of their clients and may offer tools that let their clients create customized apps or publish them through their own developer accounts."*
* **Implementation:** Each tenant must register an **Apple Developer Program Organization Account** ($99/year).
* **The D-U-N-S Requirement:** Tenants must possess a valid Dun & Bradstreet (D-U-N-S) number matching their legal business entity. (Verification typically takes 1–3 weeks; this must be initiated during tenant contract signing).
* **Delegation to Ofia:** The client does not compile or upload builds. In **App Store Connect**, the client adds the Ofia deployment service account as an **App Manager** or **Admin** and provisions an **App Store Connect API Key** (`.p8`) for Fastlane automation.

#### B. Alternative: Apple Business Manager (ABM) / Custom Apps
* For non-public enterprise clients (e.g. internal corporate employee shuttles, private hospital patient transport, closed-campus fleets):
  * Distribute via **Apple Custom Apps** through Apple Business Manager (ABM).
  * Apps are not published on the public consumer App Store and avoid public consumer review friction while being privately installable on tenant staff devices.

#### C. Apple Technical & Policy Requirements in Code
1. **Location Privacy Purpose Strings (`Info.plist`):**
   * Apple rejects generic phrases like `"App needs location"`. Purpose strings must explicitly detail business utility:
     * `NSLocationWhenInUseUsageDescription`: `"$(PRODUCT_NAME) uses your location to discover nearby vehicles, display pickup points, and track your trip progress."` (Both apps).
     * `NSLocationAlwaysAndWhenInUseUsageDescription`: `"$(PRODUCT_NAME) Driver requires continuous background location access to receive ride dispatches, provide real-time turn-by-turn navigation, and calculate accurate trip distances even when the screen is locked."` (`mobile_driver` only).
     * `UIBackgroundModes`: Include `location` strictly in `mobile_driver`. Never include in `mobile_go`.
2. **Mandatory In-App Account Deletion (Guideline 5.1.1(v)):**
   * Reviewers test this manually. `security_screen.dart` must feature an operational **Delete Account** action that invokes `POST /api/v1/user/delete-account`, revokes active auth tokens, and initiates data anonymization.
3. **In-App Purchase (IAP) Exemption (Guideline 3.1.5(a)):**
   * Physical mobility, passenger fares, parcel logistics, and vehicle rentals are explicitly exempt from Apple's 30% digital goods commission. Direct payment gateways (Paystack, Flutterwave, Stripe) are 100% compliant.

---

### 3. Google Play Store Review Policies & Technical Optimizations

Google Play enforces automated scanning and human verification for location-heavy mobility apps.

#### A. Package ID & Namespace Parameterization
* Google Play Console instantly rejects uploads containing `com.example.*`.
* In `build.gradle.kts`:
  ```kotlin
  defaultConfig {
      applicationId = project.findProperty("APP_ID") ?: "com.ofia.go"
      namespace = project.findProperty("APP_NAMESPACE") ?: "com.ofia.go"
      // ...
  }
  ```
* Every tenant build injects dedicated production IDs: e.g. `com.acmetransit.go` and `com.acmetransit.driver`.

#### B. Location & Background Tracking Compliance (#1 Rejection Cause)
* **Passenger App (`mobile_go`):**
  * Strictly foreground only:
    ```xml
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    ```
  * Never declare `ACCESS_BACKGROUND_LOCATION` in `mobile_go`. Ride-hailing riders do not qualify under Google Play policy.
* **Driver App (`mobile_driver`):**
  * Drivers require location when minimized or navigating via external maps.
  * In `AndroidManifest.xml`:
    ```xml
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    ```
  * **Mandatory Prominent In-App Disclosure:** Prior to displaying the Android OS runtime permission dialog, the app must present a full-screen custom modal explicitly stating:
    > *"Ofia Driver collects location data to enable trip dispatching, route navigation, and accurate fare calculation even when the app is closed or not in use."*
  * **Just-In-Time Request:** Trigger this permission strictly when the driver toggles **"Go Online"**, never on initial app startup or splash.
  * **Ongoing Notification:** When online, maintain a non-dismissible Android Foreground Service notification (`"Online — actively dispatching and tracking trip location"`).
  * **Submission Declaration & Video:** For every tenant Driver submission in Play Console, submit a public YouTube/Drive link showing the in-app disclosure dialog followed by background tracking in action.

#### C. Account Deletion & Data Safety Form
* Google Play policy mandates two deletion mechanisms:
  1. **In-App Deletion:** Functional delete trigger in `security_screen.dart`.
  2. **Web-Based Deletion URL:** A publicly accessible web URL where users can request account and data deletion without opening the mobile app (hosted dynamically on Ofia ERP: `https://<tenant-domain>/privacy/delete-account`).
* Both links must be populated in the tenant's Google Play Console Data Safety questionnaire.

#### D. Google Maps API Key Protection
* Never commit plain-text Google Maps keys in `AndroidManifest.xml` or `AppDelegate.swift`.
* Inject via Gradle `manifestPlaceholders` from environment variables during CI.
* Restrict the Google Cloud API key strictly to the tenant's production Android package name + production SHA-1 signing fingerprint, and iOS bundle identifier.

#### E. Android Vitals Stability Thresholds
* Google Play enforces strict discovery penalties and blocks updates if apps exceed stability thresholds:
  * **User-Perceived Crash Rate:** Must remain below **1.09%**.
  * **User-Perceived ANR Rate (Application Not Responding):** Must remain below **0.47%**.
* Architecture mandates wrapping root entry points in `runZonedGuarded` with automated crash telemetry (Crashlytics/Sentry) and executing polyline decoding/heavy calculations inside background isolates (`compute()`).

---

### 4. Multi-Tenant Build Matrix & Automated CI/CD Pipeline (Fastlane)

To manage deployments across N tenant accounts without manual intervention, the platform utilizes a configuration matrix powered by Fastlane.

#### A. Tenant Build Configuration Schema (`configs/tenants/acme_transit.yaml`)
```yaml
tenant_id: "TEN_001"
tenant_slug: "acme_transit"
brand_name: "Acme Transit"

android:
  package_name_go: "com.acmetransit.go"
  package_name_driver: "com.acmetransit.driver"
  google_maps_key: "AIzaSyAcmeAndroidKey..."
  play_store_service_account_json: "credentials/acme_google_play_service_account.json"

ios:
  bundle_id_go: "com.acmetransit.go"
  bundle_id_driver: "com.acmetransit.driver"
  google_maps_key: "AIzaSyAcmeiOSKey..."
  apple_team_id: "ABC123XYZ"
  app_store_connect_key_id: "KEY12345"
  app_store_connect_issuer_id: "issuer-uuid-here"

assets:
  app_icon_source: "tenants/acme/icon.png"
  splash_logo_source: "tenants/acme/splash.png"
  primary_color_hex: "#0F766E"
```

#### B. Pre-Build Automation Script (`scripts/configure_tenant.py`)
Prior to compilation, the CI runner invokes:
```bash
python3 scripts/configure_tenant.py --tenant acme_transit --app go
```
This automated task:
1. Replaces native app icons using `flutter_launcher_icons:main --path configs/tenants/acme_transit.yaml`.
2. Generates native splash assets via `flutter_native_splash`.
3. Injects tenant `applicationId`, package namespace, and Maps API keys into Gradle & Xcode properties.
4. Copies tenant-specific `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) into native target folders.
5. Injects compile-time constants:
   ```bash
   flutter build appbundle --dart-define=TENANT_ID=TEN_001 --dart-define=APP_TYPE=go
   ```

#### C. Multi-Account Deployment via Fastlane

* **iOS Lane (`fastlane/Fastfile`):**
  Uses `fastlane match` backed by an encrypted private repository (with separate branches per tenant) to manage distribution certificates and provisioning profiles:
  ```ruby
  lane :deploy_ios do |options|
    tenant = options[:tenant]
    config = YAML.load_file("configs/tenants/#{tenant}.yaml")
    
    api_key = app_store_connect_api_key(
      key_id: config["ios"]["app_store_connect_key_id"],
      issuer_id: config["ios"]["app_store_connect_issuer_id"],
      key_filepath: "credentials/#{tenant}_AuthKey.p8"
    )
    
    match(
      type: "appstore",
      app_identifier: config["ios"]["bundle_id_go"],
      git_branch: "tenant_#{tenant}"
    )
    
    build_app(workspace: "ios/Runner.xcworkspace", scheme: "Runner")
    upload_to_app_store(api_key: api_key)
  end
  ```

* **Android Lane (`fastlane/Fastfile`):**
  Uses `upload_to_play_store` (`supply`) authenticated via each tenant's dedicated Google Cloud service account JSON:
  ```ruby
  lane :deploy_android do |options|
    tenant = options[:tenant]
    config = YAML.load_file("configs/tenants/#{tenant}.yaml")
    
    upload_to_play_store(
      package_name: config["android"]["package_name_go"],
      json_key: config["android"]["play_store_service_account_json"],
      aab: "build/app/outputs/bundle/release/app-release.aab",
      track: "internal"  # Promoted to production upon approval
    )
  end
  ```

---

### 5. Compliance Matrix: Apple App Store vs. Google Play Store

| Compliance Vector | Apple App Store | Google Play Store | Technical Architectural Action |
| :--- | :--- | :--- | :--- |
| **White-Label / Template Policy** | **Guideline 4.2.6:** Must submit from Client’s own Organization Account. | **Repetitive Content Policy:** Multi-app identical publishing on 1 account triggers ban. | Publish to distinct client Developer Organization accounts; CI/CD parameterization. |
| **Account Type Required** | Organization (D-U-N-S verified), $99/yr. | Organization (D-U-N-S verified), $25 one-time. | Guide tenants through D-U-N-S setup during onboarding. |
| **Driver Background Location** | `UIBackgroundModes: location` + descriptive `NSLocationAlways...` string. | `FOREGROUND_SERVICE_LOCATION` + `ACCESS_BACKGROUND_LOCATION` + disclosure dialog. | Implement pre-prompt in-app disclosure dialog in `mobile_driver`; submit video demo to Play Console. |
| **Passenger Location** | Foreground only (`NSLocationWhenInUse...`). | Foreground only (`ACCESS_FINE_LOCATION`). | Exclude background location manifests strictly from `mobile_go`. |
| **Account Deletion** | **Guideline 5.1.1(v):** Functional in-app deletion button. | In-app deletion button + public web deletion URL. | Wire `security_screen.dart` to `DELETE /api/user`; provide web portal deletion link in Ofia ERP. |
| **Payments / In-App Purchases** | **Exempt (Guideline 3.1.5(a)):** Physical transport exempt from 30% IAP. | **Exempt:** Physical rides exempt from Google Play Billing. | Direct payment processors (Stripe, Paystack, Flutterwave) permitted in both apps. |
| **Map API Protection** | Restrict by iOS Bundle ID. | Restrict by Android package name + production SHA-1. | Generate tenant-specific Maps API keys in Google Cloud; inject via CI placeholders. |
| **Reviewer Test Access** | Working credentials + live route simulation mode. | Working credentials + video of background driver tracking. | Provide demo credentials with sandbox driver/trip simulation capabilities. |

---

# 38. TENANT PROVISIONING FLOW

The desired operational flow should eventually look like this:

### Step 1

Super Admin creates tenant.

```text
ABC Transport
tenantId = TEN_001
```

### Step 2

Super Admin provisions:

```text
Mobile Go
Mobile Driver
Database Isolation Tier:
  - SHARED (Tier 1: Logical DB / RLS on shared Neon compute)
  - DEDICATED_NEON_PROJECT (Tier 2: Enterprise dedicated Neon Project via Neon API)
```

### Step 3

Super Admin assigns entitlements:

```text
Ride ✓
Delivery ✓
Corporate Transport ✗
School Transport ✗
```

### Step 4

Tenant admin enters Ofia ERP.

### Step 5

Tenant uploads:

```text
Logo
Splash Logo
Banners
```

### Step 6

Tenant configures:

```text
Splash Message
Brand Colors
Available tenant-controlled services
```

### Step 7

Tenant previews.

### Step 8

Tenant publishes.

### Step 9

Existing installed application retrieves:

```text
tenant configuration
```

### Step 10

Application renders the tenant's experience.

No new Flutter project is created.

---

# 39. MULTI-TENANT TESTING

Create test tenants.

At minimum:

```text
TENANT_A
TENANT_B
TENANT_C
```

Give each deliberately different:

* logo;
* colors;
* splash message;
* banners;
* service entitlements.

Install/use the same application code.

Verify:

### Tenant A

Only sees Tenant A configuration/data.

### Tenant B

Only sees Tenant B configuration/data.

### Tenant C

Only sees Tenant C configuration/data.

Then attempt cross-tenant access and ensure backend authorization rejects it.

---

# 40. CONFIGURATION TEST

Test this exact scenario:

### Initial state

```text
Tenant A
Ride = ON
Delivery = OFF
```

Install application.

Confirm:

```text
Ride visible
Delivery hidden
```

Then change the backend configuration:

```text
Delivery = ON
```

WITHOUT updating/reinstalling the APK.

Confirm that the existing application eventually shows:

```text
Delivery
```

after configuration refresh.

Then turn it off again and verify that it disappears.

---

# 41. ASSET TEST

Upload:

```text
Tenant A Logo
Tenant B Logo
```

Verify that the same application displays:

```text
Tenant A → Logo A
Tenant B → Logo B
```

Test banners the same way.

---

# 42. DO NOT BREAK THE EXISTING OFIA PRODUCT

Before implementation:

1. create a safe development branch;
2. preserve the current working version;
3. implement configuration behind controlled changes;
4. test existing flows;
5. migrate screen by screen;
6. do not rewrite functioning modules unnecessarily.

The objective is:

> **Architectural transformation, not unnecessary redevelopment.**

---

# 43. REQUIRED DELIVERABLE FROM THE AGENT

Before modifying code, produce an audit report containing:

### A. Current architecture

```text
mobile-go
mobile-driver
backend
authentication
API
storage
state management
```

### B. Current hard-coded tenant assumptions

List every location where:

* tenant information;
* branding;
* services;
* API endpoints;
* assets;
* configuration

are currently hard-coded.

### C. Current asset architecture

Identify:

* splash assets;
* logos;
* banners;
* icons;
* images;
* native assets.

### D. Recommended multi-tenant architecture

Show:

```text
Ofia Admin
      ↓
Tenant configuration
      ↓
Ofia ERP
      ↓
Backend configuration service
      ↓
Mobile Go / Mobile Driver
```

### E. Required database/backend changes

Specify:

* tables/collections (including `tenant_database_configs`, tenant branding, and service entitlement flags);
* fields;
* relationships;
* database routing & serverless connection pooling layer (`getTenantDbPool`);
* API endpoints;
* authorization rules.

### F. Required Ofia Admin screens

List every new screen and its fields.

### G. Required Ofia ERP screens

List every new screen and its fields.

### H. Required Flutter changes

List:

* configuration service;
* tenant resolver;
* theme provider;
* asset loader;
* feature entitlement manager;
* caching;
* refresh mechanism;
* error handling.

### I. Migration plan

Explain how to migrate the current single-tenant Ofia application without breaking existing functionality.

---

# 44. FINAL ARCHITECTURAL PRINCIPLE

The finished system should make onboarding a new mobility client look like this:

```text
CREATE TENANT
      ↓
ASSIGN SERVICES
      ↓
PROVISION MOBILE GO
      ↓
PROVISION MOBILE DRIVER
      ↓
UPLOAD BRAND ASSETS
      ↓
CONFIGURE SPLASH
      ↓
CONFIGURE BANNERS
      ↓
PREVIEW
      ↓
PUBLISH
      ↓
CLIENT APP BECOMES TENANT-SPECIFIC
```

**Not:**

```text
New client
   ↓
Copy Flutter project
   ↓
Create new folder
   ↓
Replace logo
   ↓
Change colors
   ↓
Modify code
   ↓
Create another APK
   ↓
Repeat forever
```

The entire purpose of this work is to ensure that **one maintained Ofia codebase can power dozens or hundreds of tenant-specific mobility applications while Ofia Admin and Ofia ERP control the configuration and the backend enforces tenant isolation.**

**Do not start implementation until the current Ofia Mobile Go and Ofia Mobile Driver repositories have been audited and the proposed architecture, database changes, API changes, configuration model, and screen additions have been explicitly mapped.**

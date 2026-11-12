# Ofia Platform (`ofia_erp` & `ofia_storefront`) — Tiered Pricing & Subscription Strategy

> **Document Purpose:** Canonical pricing, packaging, module-gating, and transaction fee specification unifying **Ofia Storefront (`ofia_storefront`)** and **Ofia Enterprise ERP (`ofia_erp`)**.

---

## 1. Executive Summary & Current Codebase Audit

### 1.1 Existing Pricing Fragmentation
An audit across `ofia_erp` and `ofia_storefront` revealed three separate, conflicting pricing structures and a static transaction fee calculation:

1. **Public B2B Marketing Page (`ofia_erp/src/app/business/page.tsx`) & Pitch Deck (`ofia_erp/public/pitch/index.html`):**
   - **Starter:** ₦5,000/mo (₦50,000/yr) — Core Booking Engine, Basic Profile, NexaChat
   - **Business:** ₦15,000/mo (₦150,000/yr) — Verified Partner Badge, CRM & Lead Pipelines, NexaShop
   - **Pro:** ₦50,000/mo (₦500,000/yr) — WhatsApp Broadcast, Custom API, Full Analytics, 0% Platform Commission
2. **Tenant Billing Portal (`ofia_erp/src/app/tenant/billing/page.tsx`):**
   - **Starter:** ₦25,000/mo (500 Leads, 200 emails/day, 2 Seats)
   - **Growth:** ₦65,000/mo (2,000 Leads, 500 emails/day, 5 Seats)
   - **Scale:** ₦150,000/mo (10,000 Leads, 2,500 emails/day, 15 Seats)
   - **Enterprise:** Custom (Unlimited Leads & Seats, Dedicated IP, On-Prem AI Models)
3. **Platform SuperAdmin Seed Data (`ofia_erp/src/lib/admin-data.ts`):**
   - Defines `planTier: "FREE_TRIAL" | "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE"` with monthly recurring revenue (`mrr`) figures ranging from ₦450,000 (`STARTER`) to ₦5,000,000 (`ENTERPRISE`).
4. **Hardcoded Storefront Commission (`commerce-orders-store.ts` in both apps):**
   - Currently hardcoded to a flat **1.5% platform fee** (`rawAmount * 0.015`, 98.5% merchant split) regardless of the tenant's `planTier` or whether Protected Escrow (`isEscrow`) is used.

### 1.2 Built-In Technical Enforcement Levers
The platform architecture already includes granular, zero-default access controls ready to enforce tiered subscriptions:
- **Top-Level Workspace Extensions (`ofia_erp/src/app/onboarding/page.tsx`):**
  - Digital Shopfront (`shop_front_ext` — `slug.ofia.shop`)
  - Enterprise ERP Suite (`erp_ext` — `slug.ofia.ng/erp`)
- **7 Storefront & Retail Sub-Modules (`shopSubModules` in `ofia_erp/src/lib/verticals.ts`):**
  - `store` (Online Storefront), `catalog` (Products Catalog), `services` (Services & Bookings Menu), `orders` (Order Fulfillment), `pos` (Point of Sale Cash Registers), `inventory` (Multi-Warehouse IMS), `referrals` (Viral Customer Referral & Affiliate Engine).
- **14 ERP Modules & 12 Role Portals (`ofia_erp/src/lib/access-control.ts` & `department-access-constants.ts`):**
  - **Operations:** `overview` (Executive Command), `ai` (Ofia Voice Agent & 15-Agent AI GTM Swarm), `marketplace` (Multi-Merchant Directory & Escrow Wallet), `shop` (Retail/POS/IMS), `mobility` (12-tab Fleet & Transport Manager), `dispatch` (Courier & Waybill Control Center).
  - **Enterprise Suite:** `crm` (B2B Pipelines, Email Blasts, Call Logger, Quotations), `accounting` (GAAP/IFRS General Ledger, Trial Balance, Payroll, Banking, FIRS 7.5% VAT), `hr` (360 Appraisals, OKR Banks, Team Quests), `workforce` (Recruitment, Academy LMS, GPS Attendance, Competency Matrices, Client Deployment), `users` (Staff Directory, Department Hierarchy, Mass Messaging).
  - **Portals & Team:** `employee` (Self-Service Portal), `manager` (Line Manager Calibrations), `md` (MD Executive Cockpit), `sales_closer` (Dedicated Closer Pipeline), `client` (Corporate Client Stakeholder Portal).
- **11 Specialized Industry Verticals (`ofia_storefront/src/types/storefront.ts`):**
  - `fashion`, `cars`, `food`, `property`, `gadgets`, `beauty`, `home-living`, `pharmacy`, `hardware`, `retail`, `dispatch`.
- **Infrastructure Cost Drivers:**
  - Strict Database-Per-Tenant Neon PostgreSQL architecture (`tenant-db-resolver.ts`), Multi-LLM Gateway token consumption (Claude, GPT-4o, Gemini, Groq), PSTN/SIP Telephony (`voicebip`), and Bring-Your-Own-Key (`BYOK`) support.

---

## 2. Unified 3-Layer Pricing Architecture

To capture value across solo merchants, multi-branch SMEs, and large corporate enterprises without pricing out entry-level storefronts, Ofia uses a **Hybrid 3-Layer Monetization Model**:

1. **Layer 1: Core Workspace Subscription** (`FREE_TRIAL` → `STARTER` → `GROWTH` → `SCALE` → `ENTERPRISE`)
2. **Layer 2: Tiered Transaction & Escrow Take-Rate** (commission decreases as subscription tier increases)
3. **Layer 3: Specialized Industry Module Add-Ons & Usage Packs** (Mobility Fleet, Workforce OS, AI Voice/Telephony)

---

## 3. Core Subscription Tiers Matrix

| Feature / Quota | **Free Trial / Launch** (`FREE_TRIAL`) | **Starter** (`STARTER`) | **Growth** (`GROWTH`) ⭐ *Most Popular* | **Scale** (`SCALE`) | **Enterprise** (`ENTERPRISE`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Target Customer** | New signups & early profile claimants | Solo merchants, creators, & service pros going digital | Growing retailers, clinics, salons, & B2B sales teams | Multi-branch retailers, schools, logistics & mid-market firms | Large enterprises, franchises, fleet operators, & BPO agencies |
| **Monthly Price (NGN)** | **₦0** *(14-day trial)* | **₦25,000 / mo** | **₦75,000 / mo** | **₦200,000 / mo** | **From ₦650,000 / mo** *(Custom)* |
| **Annual Price (NGN)** *(2 months free / ~17% off)* | — | **₦250,000 / yr** | **₦750,000 / yr** | **₦2,000,000 / yr** | **Custom Annual Contract** |
| **USD Reference Equivalent** | $0 | ~$16 / mo | ~$48 / mo | ~$125 / mo | ~$400+ / mo |
| **Included Staff Seats** | **1 Seat** (Owner) | **2 Seats** *(+₦6,000/seat)* | **10 Seats** *(+₦5,000/seat)* | **30 Seats** *(+₦4,000/seat)* | **Unlimited / Custom** |
| **Database Isolation** | Shared Trial Sandbox | Pooled Tenant Schema | Dedicated Neon Branch DB | Dedicated Neon DB + Point-in-Time Backups | Isolated Sovereign DB (`is_custom_db`) |
| **Subdomain & Custom DNS** | `slug.ofia.shop` | `slug.ofia.shop` + `slug.ofia.ng` | **Custom Domain CNAME** + Brand Colors/Logo | Multi-Subdomain + Custom Login Hero/Portal | Full White-Label (Remove *"Powered by Ofia"*) |

### 3.1 `ofia_storefront` Capabilities by Tier

| Storefront Capability (`shopSubModules`) | `FREE_TRIAL` | `STARTER` | `GROWTH` | `SCALE` | `ENTERPRISE` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Vertical Storefront Template (`store`)** | ✓ (1 Vertical) | ✓ (1 Vertical) | ✓ (1 Vertical) | ✓ (Up to 3 Verticals) | ✓ (All 11 Verticals) |
| **Products Catalog (`catalog`)** | Up to 25 SKUs | Up to 100 SKUs | **Unlimited SKUs** + Variants | **Unlimited SKUs** + Collections | **Unlimited** + API Sync |
| **Service & Appointment Bookings (`services`)** | ✓ (Basic) | ✓ | ✓ + Specialist Assignment | ✓ + SLA & Multi-Location | ✓ + Custom Workflows |
| **Order & Booking Fulfillment (`orders`)** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Point of Sale Terminal (`pos`)** | — | — | **Up to 2 POS Registers** | **Up to 10 POS Registers** | **Unlimited POS Registers** |
| **Warehouse Inventory (`inventory` / IMS)** | Basic Stock Count | Single Location Stock | **1 Warehouse Depot** + Barcode | **Up to 5 Depots** + GRN & Transfers | **Unlimited Depots** + Auto-POs |
| **Viral Referral & Affiliate Engine (`referrals`)** | — | — | — | ✓ (Vanity Links + Auto Payouts) | ✓ + Anti-Fraud & Custom Tiers |
| **B2B Wholesale / Contractor Tiered Pricing** | — | — | — | ✓ (`hardware` / B2B verticals) | ✓ |

### 3.2 `ofia_erp` Modules & Portals by Tier

| ERP Module (`ERP_MODULES`) | `FREE_TRIAL` | `STARTER` | `GROWTH` | `SCALE` | `ENTERPRISE` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Admin Command Overview (`overview`)** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Merchant Earnings & Escrow Wallet** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **CRM & Email Marketing (`crm`)** | Preview Only | Basic Contact List | **Full B2B Pipelines, Quotations & Blasts** | **Full CRM + Automated Lead Scoring** | **Enterprise CRM + Custom Webhooks** |
| **Sales Closer Portal (`sales_closer`)** | — | — | ✓ | ✓ | ✓ |
| **Employee & Manager Portals (`employee`, `manager`)** | — | — | ✓ | ✓ | ✓ |
| **User & Department Governance (`users`)** | — | Basic (2 Users) | Up to 3 Departments | **Full 12-Role & Department RBAC Matrix** | **Unlimited Hierarchy + Mass Messaging** |
| **Accounting & General Ledger (`accounting`)** | — | — | Basic Invoicing & Expenses | **Full Double-Entry GL, Trial Balance, Payroll & FIRS 7.5% VAT** | **Multi-Entity GL, Bank Feeds & Immutable Audit Trail** |
| **HR 360 Appraisals & Quests (`hr`)** | — | — | — | **Full Appraisal Cycles, OKR Banks & Team Quests** | **Full HR Suite + Custom Calibrations** |
| **MD Executive Deep Dive (`md`)** | — | — | — | ✓ | ✓ |
| **Ofia Dispatch Manager (`dispatch`)** | — | — | Add-On | **Included** (Waybills, Rider Map, Zonal Rates) | **Included** |
| **Ofia AI GTM Swarm (`ai`)** | — | — | **3 Core AI Agents** | **All 15 AI GTM Swarm Agents** | **15 Agents + Adversarial Debate + BYOK** |
| **Ofia Workforce Manager OS (`workforce` + `client`)** | — | — | Add-On | Add-On | **Included** |
| **Ofia Mobility Manager (`mobility`)** | — | — | Add-On | Add-On | **Included** |
| **Multi-Merchant Marketplace Manager (`marketplace`)** | — | — | — | Add-On | **Included** |

### 3.3 Usage Quotas (CRM, Enrichment, Email & AI)

| Quota Metric (`admin-data.ts`) | `FREE_TRIAL` | `STARTER` | `GROWTH` | `SCALE` | `ENTERPRISE` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Enriched Leads Quota (`leadsLimit`)** | 100 / trial | 500 / mo | 2,500 / mo | 10,000 / mo | 50,000+ / mo |
| **Active Multichannel Campaigns (`campaignsLimit`)** | 1 | 3 | 10 | 25 | 100+ |
| **Outbound Email Blasts** | 50 / day | 200 / day | 500 / day | 2,500 / day | Dedicated IP (Unlimited) |
| **Active AI Agents (`activeAgentsCount`)** | 2 | 4 | 8 | 15 (Full Swarm) | 15 + Custom Agents |
| **Bring-Your-Own-Key (`BYOK`) AI Routing** | — | — | — | ✓ (Optional) | ✓ (OpenAI, Anthropic, Gemini, Voicebip) |

---

## 4. Transaction, Escrow & Vertical Monetization (`ofia_storefront`)

Instead of a static `1.5%` platform fee across all orders in `commerce-orders-store.ts`, transaction fees dynamically adjust based on **Plan Tier** and **Settlement Mode (Direct vs. Protected Escrow)**:

### 4.1 Storefront & Booking Take-Rate Schedule

| Settlement Mode | `FREE_TRIAL` | `STARTER` | `GROWTH` | `SCALE` | `ENTERPRISE` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Direct Instant Checkout** (`isEscrow = false`) | **2.5%** | **2.0%** | **1.5%** | **1.0%** | **0.5% – 0.75%** |
| **Protected Escrow + Delivery OTP** (`isEscrow = true`) | **3.5%** | **3.0%** | **2.5%** | **2.0%** | **1.5%** |
| **In-Store POS Counter Checkout** (`channel = POS_COUNTER`) | — | — | **0%** (Free SaaS POS) | **0%** | **0%** |

> **Why Differentiate Escrow vs. Direct?**
> Escrow orders (`isEscrow: true`) lock 97%–98.5% of funds in `tenant_wallets.escrow_balance` until the buyer confirms the delivery OTP or service completion, providing dispute resolution and buyer trust. Charging a **+1.0% escrow protection premium** monetizes the trust layer while incentivizing merchants to upgrade tiers as their GMV scales.

### 4.2 High-Ticket Vertical Monetization (`cars`, `property`, `hardware`)
In high-ticket verticals where buyers book inspections rather than paying ₦180M via instant card checkout:
1. **Paid Escrow Booking Deposits:** Merchants can require a refundable or deductible booking deposit on **Valet Test Drives** (`cars`), **Physical Property Viewings** (`property`), or **On-Site Solar/Engineering Surveys** (`hardware`), processed through Ofia Escrow at the tier's Escrow Take-Rate.
2. **High-Intent RFQ / Inquiry Lead Credits:** Every verified `TestDriveRequest`, `ViewingRequest`, or `CustomOrderRequest` routed into the ERP CRM consumes **1 Enriched Lead Credit** (or ₦1,000–₦2,500 pay-as-you-go overage) with automated phone/email verification (`crm-phone-enricher.ts` / `crm-email-enricher.ts`).

---

## 5. Modular Add-Ons & Usage Packs (Layer 3 Upsells)

Any tenant on **Growth** or **Scale** can activate specialized operational modules à la carte without jumping to the ₦650,000/mo Enterprise base plan:

| Add-On Module | Module Key | Monthly Price (NGN) | Included Scope & Overages |
| :--- | :--- | :--- | :--- |
| **Ofia Mobility & Fleet Suite** | `mobility` | **+₦75,000 / mo** | Unlocks all 12 Mobility tabs (Live Telemetry, Vehicle Registry, Driver Rosters, Maintenance, Fixed Routes, Campus Shuttles, Interstate, Ride-Hail, Car Hire, School Bus, Staff Commute). Includes **10 vehicles** *(+₦3,500/extra vehicle/mo)*. |
| **Ofia Workforce & Outsourcing OS** | `workforce` + `client` | **+₦60,000 / mo** | Unlocks Recruitment Pipelines, Talent Academy LMS, Cryptographic Certificate Verification, GPS Attendance, Competency Matrices, Staff Deployment, and **Corporate Client Stakeholder Portal (`/erp/client`)**. |
| **Ofia Dispatch & Courier Control** | `dispatch` | **+₦35,000 / mo** *(Free on Scale+)* | Unlocks Zonal Dispatch Routing, 4x6 QR Waybill Generator, Rider Allocation Console, and Live Parcel Tracking. |
| **Ofia AI Voice Agent & Telephony** | `ai` (Voice + SIP) | **+₦50,000 / mo** + Usage | Unlocks Autonomous AI Phone Caller (`voicebip` Nigerian +234 PSTN/SIP), Call Transcripts, and Unsupervised WhatsApp Auto-Dialogue. Includes **250 AI Voice Minutes** *(+₦120/min or BYOK Voicebip SIP)*. |
| **Lead & Email Expansion Pack** | Quota Top-Up | **+₦20,000 / pack** | Adds **+2,500 Enriched Lead Credits** and **+15,000 Email Blast Sends** (non-expiring rollover while subscription is active). |

---

## 6. Promotional & Go-To-Market Mechanics

1. **14-Day Risk-Free Trial (`FREE_TRIAL`):**
   - Instant provisioning at `/onboarding` with subdomain reservation (`slug.ofia.ng` and `slug.ofia.shop`), no card required to explore the workspace.
2. **"First 500 Verified Merchants" Launch Promo:**
   - Preserves the offer in `ofia_erp/src/app/business/page.tsx`: businesses that complete KYB verification receive **3 Months Free on the Growth Tier** (or 0% direct storefront commission for their first ₦5,000,000 in GMV).
3. **Annual Billing Lock-In:**
   - **2 Months Free (~16.7% discount)** on annual upfront payment via Paystack, plus free migration/setup of the tenant's Product Catalog and Chart of Accounts.

---

## 7. Implementation Checklist Across Repositories

To align the codebase with this specification:

1. **Canonical Plan Config (`ofia_erp/src/lib/pricing-plans.ts`):**
   - Export `PLAN_TIERS` (`FREE_TRIAL`, `STARTER`, `GROWTH`, `SCALE`, `ENTERPRISE`), `MODULE_ADDONS`, and `getDefaultProvisioningForPlan(planTier)` returning the exact `PermissionMatrix` (`tenant_provision`) and `shopSubModules` flags.
2. **Unify Billing & Marketing UIs:**
   - Update `ofia_erp/src/app/business/page.tsx` (Public B2B Pricing section)
   - Update `ofia_erp/src/app/tenant/billing/page.tsx` (Tenant Billing & Upgrade Matrix)
   - Update `ofia_erp/src/app/tenant/page.tsx` (Tenant Overview Summary Cards)
   - Update `ofia_erp/src/lib/admin-data.ts` (SuperAdmin Tenant MRR & Quota definitions)
3. **Dynamic Commission Calculator (`commerce-orders-store.ts`):**
   - Replace hardcoded `0.015` in `ofia_storefront/src/lib/commerce-orders-store.ts` and `ofia_erp/src/lib/commerce-orders-store.ts` with `calculatePlatformFee(rawAmount, planTier, isEscrow, channel)`.

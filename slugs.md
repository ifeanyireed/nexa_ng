# 🗺️ Ofia / Nexa Platform Route & Subdomain Directory (`slugs.md`)

This document serves as the authoritative map of all route slugs, subdomains, frontend applications, and backend microservice boundaries across the entire ecosystem.

---

## 🌐 1. 5-Tier Subdomain & Host Routing Architecture

| Tier | Host Pattern | Target App / Module | Function |
| :--- | :--- | :--- | :--- |
| **Tier 1: Apex Domain** | `ofia.ng` / `domain.ng` | `ofia_business` (Public Marketplace) | Public search, nationwide 99+ niche directories, verified merchant pro profiles, booking checkout, and public auth (`/login`, `/signup`, `/join`). |
| **Tier 1b: Dedicated ERP Subdomain** | `erp.ofia.ng` / `erp.domain.com` | `ofia_business` (ERP Portal & Suite) | Dedicated Enterprise ERP landing page and direct suite routing (`/admin`, `/accountant`, `/hr`, etc.). Non-subdomain `/erp` redirects here. |
| **Tier 2: Cluster Subdomain** | `cluster.ofia.ng` (e.g. `handyman.ofia.ng`) | `ofia_business` (Cluster Portal) | Broad industry cluster hub with cross-service discovery & regional technician directory. |
| **Tier 3: Vertical Niche SOC** | `niche.ofia.ng` (e.g. `cars.ofia.ng`, `solar.ofia.ng`) | `ofia_business` (Vertical SOC) | Specialized Operations Center (SOC) with deep category filters, technical specs, and verified pro listings. |
| **Tier 4: Tenant Workplace** | `client_slug.ofia.ng` (e.g. `edusuite.ofia.ng`) | `ofia_business` (`/tenant/*` & `/erp/*`) | Tenant workspace management, BYOK key vault, team seats, and full enterprise ERP suite (`erp_ext`). |
| **Tier 5: Digital Shopfront** | `client_slug.ofia.shop` (e.g. `edusuite.ofia.shop`) | `ofia_business` (`/shopfront/*`) | Public-facing branded eCommerce digital storefront for verified merchants (`shop_front_ext`). *(No separate admin UI on .shop)* |

---

## 🏢 2. `ofia_business` Application Routes

### 🛒 A. Public Marketplace Discovery & Search (`ofia.ng`)
* **Home / Apex Landing**: `/`
* **Niche Vertical Landing**: `/[niche]` *(99+ Nigerian niches supported)*
* **Niche Search & Filters**: `/[niche]/search`
* **Niche Available Pros**: `/[niche]/available`
* **Niche Nearby Pros**: `/[niche]/near-me`
* **Niche Sub-Category**: `/[niche]/category/[slug]`
* **Niche Knowledge Articles**: `/[niche]/articles`
* **Niche Article View**: `/[niche]/articles/[slug]`
* **Niche Storefront Catalog**: `/[niche]/shop`
* **Niche Product Detail**: `/[niche]/shop/[slug]`
* **Business Pro Profile**: `/[niche]/[state]/[lga]/[business]`
* **Business Pro Shop**: `/[niche]/[state]/[lga]/[business]/shop`
* **Universal Categories Directory**: `/categories`
* **City Portals**: `/cities/[city]` *(e.g. `/cities/lagos`, `/cities/abuja`, `/cities/port-harcourt`)*
* **Nexa Verified Trust Page**: `/nexa-verified`
* **Business Merchant Info**: `/business`
* **Company About**: `/about`
* **Contact & Support**: `/contact`
* **Legal Policies**: `/legal/privacy`, `/legal/terms`

### 💳 B. Checkout, Escrow & Service Bookings
* **Cart Checkout**: `/checkout`
* **Shipping Address & Delivery**: `/checkout/shipping`
* **Order Payment Success**: `/checkout/success`
* **Book Nexa Verified Escrow**: `/book/nexa-verified/checkout`
* **Booking Confirmed**: `/book/nexa-verified/confirmed/[ref]`
* **Live Booking Milestone Tracking**: `/booking/[ref]/track`
* **Customer Review Submission**: `/booking/[ref]/review`

### 🔐 C. Public Authentication & Merchant Onboarding
* **User / Client Login**: `/login`
* **Client Registration**: `/signup`
* **Forgot Password**: `/forgot-password`
* **Tenant Workspace Onboarding**: `/onboarding`
* **Merchant Join Landing**: `/join`
* **Pro Merchant Registration**: `/join/register`
* **Field Technician Registration**: `/join/technician`

### 🏪 D. Tenant Public Digital Shopfront (`client_slug.ofia.shop`)
* **Storefront Home**: `/shopfront`
  - Featured product SKUs
  - On-demand appointment booking calendar
  - Verified customer reviews & rating badges
  - Direct 1-tap WhatsApp consultation widget

---

### ⚙️ E. Tenant Workspace Administration (`client_slug.ofia.ng/tenant/*`)
* **Tenant Workspace Hub**: `/tenant`
* **Workspace Settings & Modular Extensions**: `/tenant/settings` *(toggles `erp_ext` and `shop_front_ext`, custom domain CNAME)*
* **Billing & Paystack Card Subscriptions**: `/tenant/billing` *(Starter, Growth, Scale, Enterprise)*
* **Team Seats & Teammate Invites**: `/tenant/team`
* **BYOK AI Key Vault**: `/tenant/byok` *(AES-256 encrypted keys for Claude, OpenAI, Gemini)*
* **Quota Usage & Rate Limits**: `/tenant/usage` *(Daily email limits, lead search, token credits)*

---

### 💼 F. Enterprise ERP Suite (`client_slug.ofia.ng/erp/*`)

#### 🛡️ 1. Admin Mission Control (`/erp/admin/*`)
* **Admin Mission Control Cockpit**: `/erp/admin`

* **Autonomous AI GTM Swarm (`/erp/admin/ai/*`)**:
  - `/erp/admin/ai` — GTM Dashboard
  - `/erp/admin/ai/campaigns` — Multi-Channel Outbound Campaigns (Email, WhatsApp, LinkedIn)
  - `/erp/admin/ai/campaigns/new` — AI Campaign Wizard
  - `/erp/admin/ai/leads` — Verified B2B Lead Intelligence & ICP Enrichment
  - `/erp/admin/ai/studio` — AI Content & Copy Generation Studio
  - `/erp/admin/ai/knowledge` — Brand Vector Knowledge Base (RAG)
  - `/erp/admin/ai/strategy` — Autonomous Growth & Niche Playbooks
  - `/erp/admin/ai/team` — 15 Autonomous AI Specialist Agents
  - `/erp/admin/ai/approvals` — Human-in-the-loop Approval Center
  - `/erp/admin/ai/telegram` — Telegram 1-Tap Mobile Approval & Notification Bot
  - `/erp/admin/ai/analytics` — Outbound Deliverability & ROI Telemetry
  - `/erp/admin/ai/settings` — Sender Domains, DKIM/SPF & SMTP Relay
  - `/erp/admin/ai/pricing` — AI Token Quotas & Overage Tiers
  - `/erp/admin/ai/integrations` — CRM & Outreach Webhooks

* **Marketplace Merchant Storefront (`/erp/admin/marketplace/*`)**:
  - `/erp/admin/marketplace` — Store Overview & GMV Analytics
  - `/erp/admin/marketplace/shop` — Product Catalog & SKU Management
  - `/erp/admin/marketplace/bookings` — Service Appointments & Calendar
  - `/erp/admin/marketplace/deals` — Flash Deals & Promotional Discounts
  - `/erp/admin/marketplace/leads` — Inbound Customer Inquiries
  - `/erp/admin/marketplace/messages` — Live Customer Chat
  - `/erp/admin/marketplace/wallet` — Paystack Bank Transfer Payout Wallet
  - `/erp/admin/marketplace/analytics` — Storefront Traffic & Conversion Analytics
  - `/erp/admin/marketplace/profile` — Pro Business Profile & Showcase
  - `/erp/admin/marketplace/availability` — Business Working Hours & Calendar Slots
  - `/erp/admin/marketplace/settings` — Merchant Settings & Store Policies
  - `/erp/admin/marketplace/articles` — Merchant SEO Articles List
  - `/erp/admin/marketplace/articles/new` — Create SEO Article

* **Inventory Management System (IMS) (`/erp/admin/inventory/*`)**:
  - `/erp/admin/inventory` — Stock Valuation Cockpit & Low-Stock Alerts
  - `/erp/admin/inventory/items` — Master SKU Catalog, Barcodes & Cost Pricing
  - `/erp/admin/inventory/warehouses` — Multi-Warehouse Depots & Bin Allocations
  - `/erp/admin/inventory/transfers` — Inter-Branch Stock Transfers & Goods Received Notes (GRN)
  - `/erp/admin/inventory/adjustments` — Stock Audits, Shrinkage & Write-Offs
  - `/erp/admin/inventory/suppliers` — Vendor Purchase Orders & Restock Forecasting

* **Point of Sale (POS) Cashier Module (`/erp/admin/pos/*`)**:
  - `/erp/admin/pos` — Touch POS Register, Barcode Scanner, Multi-Tender Checkout (Cash, Card, Transfer, Split)
  - `/erp/admin/pos/sessions` — Cashier Shift Register & Daily Z-Reports
  - `/erp/admin/pos/receipts` — Thermal ESC/POS Slip Reprint & WhatsApp Slips
  - `/erp/admin/pos/terminals` — Moniepoint/OPay Android SmartPOS Hardware Pairing

* **Viral Referral & Affiliate Engine (`/erp/admin/referrals/*`)**:
  - `/erp/admin/referrals` — Viral K-Factor Cockpit & Performance Metrics
  - `/erp/admin/referrals/campaigns` — Reward Rules Builder ("Give ₦5,000 / Get ₦5,000")
  - `/erp/admin/referrals/affiliates` — Affiliate Partner Directory & Vanity Links
  - `/erp/admin/referrals/payouts` — Paystack Batch Commission Payouts with 5% WHT
  - `/erp/admin/referrals/analytics` — Multi-Touch Attribution Funnels & Anti-Fraud

* **Logistics Command Center (`/erp/admin/logistics/*`)**:
  - `/erp/admin/logistics` — Active Shipments & On-Time SLA Monitor
  - `/erp/admin/logistics/shipments` — Live Waybills & 4x6 QR Shipping Labels
  - `/erp/admin/logistics/dispatch` — Automated Proximity Courier / Field Tech Dispatch Console
  - `/erp/admin/logistics/fleet` — Driver Fleet Map (Bikes, Vans) & Live GPS
  - `/erp/admin/logistics/rates` — Regional Delivery Zones & Rate Matrix

* **Nexa Design System (`/erp/admin/components/*`)**:
  - `/erp/admin/components` — UI Component Showcase & Liquid-Glass Design Tokens

---

#### 💰 2. Finance & Accounting Suite (`/erp/accountant/*`)
* **Finance Cockpit**: `/erp/accountant`
* **Cash Flow Overview**: `/erp/accountant/overview`
* **Invoicing (Accounts Receivable)**: `/erp/accountant/invoices`
* **Vendor Bills (Accounts Payable)**: `/erp/accountant/bills`
* **Expense Tracker**: `/erp/accountant/expenses`
* **Chart of Accounts (COA)**: `/erp/accountant/coa`
* **General Ledger**: `/erp/accountant/ledger`
* **Ledger Summary**: `/erp/accountant/ledger-summary`
* **Journal Entries**: `/erp/accountant/journal-entries`
* **Recurring Journals**: `/erp/accountant/recurring-journals`
* **Trial Balance**: `/erp/accountant/trial-balance`
* **Income Statement (P&L)**: `/erp/accountant/income-statement`
* **Statement of Financial Position (Balance Sheet)**: `/erp/accountant/financial-position`
* **Banking Operations**: `/erp/accountant/banking`
* **Bank Accounts**: `/erp/accountant/bank-accounts`
* **Bank Reconciliation**: `/erp/accountant/reconcile`
* **Payroll Disbursement**: `/erp/accountant/payment-payroll`
* **Payroll Processing**: `/erp/accountant/payroll-payment-processing`
* **Employee Salary Structure**: `/erp/accountant/employee-salaries`
* **Statutory Tax Remittances (PAYE, Pension, NHF, ITF)**: `/erp/accountant/statutory-remittances`
* **Fiscal Period Close**: `/erp/accountant/period-close`
* **Clients / Debtors**: `/erp/accountant/clients`
* **Vendors / Creditors**: `/erp/accountant/vendors`
* **Product Inventory Valuation**: `/erp/accountant/products`
* **Stock Levels**: `/erp/accountant/product-stock`
* **Sales Estimates / Quotes**: `/erp/accountant/estimates`
* **Commercial Proposals**: `/erp/accountant/proposals`
* **Sales Orders**: `/erp/accountant/orders`
* **Received Payments**: `/erp/accountant/payments`
* **Payment Processing**: `/erp/accountant/payment-processing`
* **Credit Notes**: `/erp/accountant/credit-notes`
* **Debit Notes**: `/erp/accountant/debit-notes`
* **Client Retainers**: `/erp/accountant/retainers`
* **Aged Receivables**: `/erp/accountant/aged-receivables`
* **Aged Payables**: `/erp/accountant/aged-payables`
* **Annual Budget Planner**: `/erp/accountant/budget-planner`
* **Financial Reports Pack**: `/erp/accountant/finance-reports`
* **Financial Audit Trail**: `/erp/accountant/audit-trail`
* **Email Notification Recipients**: `/erp/accountant/email-notification-recipients`

---

#### 👥 3. Human Resources & Performance Appraisals (`/erp/hr/*`)
* **HR Dashboard**: `/erp/hr`
* **Staff Directory & Org Structure**: `/erp/hr/users`
* **Enterprise Objective Bank**: `/erp/hr/objectives`
* **Performance Appraisal Cycles**: `/erp/hr/cycle`
* **HR Analytics & Reports**: `/erp/hr/reports`
* **Review Evaluation Detail**: `/erp/hr/review/detail`

#### 👔 4. Department Manager Suite (`/erp/manager/*`)
* **Manager Team Dashboard**: `/erp/manager`
* **Subordinate KPI Appraisal Grading**: `/erp/manager/review/detail`

#### 🧑‍💻 5. Employee Self-Service (`/erp/employee/*`)
* **Employee Workspace**: `/erp/employee`
* **Staff Profile**: `/erp/employee/profile`
* **Performance Appraisals**: `/erp/employee/reviews`
* **Self-Appraisal Submission**: `/erp/employee/reviews/detail`

#### 👑 6. Managing Director Executive Cockpit (`/erp/md/*`)
* **Executive Cockpit**: `/erp/md`
* **Department Performance Ranking**: `/erp/md/department/detail`

#### 🔑 7. ERP Authentication & Recovery
* **ERP Password Reset**: `/erp/reset-password`

---

## 👑 3. `ofia_admin` Super Admin Routes (`admin.ofia.ng`)

| Category | Route | Purpose |
| :--- | :--- | :--- |
| **Command Center** | `/` | Super Admin cross-platform pulse, MRR, server health & active tenants. |
| **AI GTM Fleet** | `/ai/tenants` | Monitor AI GTM activity across all tenant organizations. |
| | `/ai/campaigns` | Global outbound email/WhatsApp campaign oversight. |
| | `/ai/system-prompt` | Global autonomous agent system prompt versioning. |
| | `/ai/logs` | Central LLM telemetry & token consumption logs. |
| | `/ai/byok-vault` | Global BYOK key vault status. |
| **Marketplace Governance** | `/marketplace/merchants` | Pro merchant vetting, KYC verification, and store approvals. |
| | `/marketplace/categories` | Master taxonomy & Nigerian niche configurations. |
| | `/marketplace/disputes` | Customer-merchant transaction dispute resolution. |
| | `/marketplace/settlements` | Paystack merchant payout wallet reconciliation. |
| | `/marketplace/moderation` | Content & review moderation queue. |
| **Enterprise ERP Admin** | `/erp/tenants` | Manage ERP tenant organizations. |
| | `/erp/users` | Global ERP user account directory. |
| | `/erp/departments` | Global department and role hierarchies. |
| | `/erp/audit-logs` | SOC2/Compliance security audit trail. |
| **System & Infrastructure** | `/system/health` | Live health of all 5 Go backend microservices. |
| | `/system/billing` | Paystack subscription tiers & revenue metrics. |
| | `/system/admins` | Super admin user seats & 2FA enforcement. |
| | `/system/settings` | Global environment variables & webhook secrets. |

---

## 🔌 4. Backend Go Microservices Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │      UNIFIED API GATEWAY / REVERSE PROXY     │
                                  │                 (Port: 8080)                 │
                                  └──────────────────────┬───────────────────────┘
                                                         │
         ┌───────────────────────┬───────────────────────┼───────────────────────┬───────────────────────┬───────────────────────┐
         │                       │                       │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼                       ▼                       ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
│   service_users   │   │    service_ai     │   │service_marketplace│   │    service_erp    │   │ service_logistics │   │   PostgreSQL 16   │
│   (Port: 8081)    │   │   (Port: 8082)    │   │   (Port: 8083)    │   │   (Port: 8084)    │   │   (Port: 8085)    │   │   (Port: 5432)    │
├───────────────────┤   ├───────────────────┤   ├───────────────────┤   ├───────────────────┤   ├───────────────────┤   ├───────────────────┤
│ • Auth & JWT      │   │ • 15 AI Agents    │   │ • 99+ Verticals   │   │ • General Ledger  │   │ • Waybill Labels  │   │ • Unified Schema  │
│ • Tenancy / Orgs  │   │ • Cold Outreach   │   │ • Merchant Stores │   │ • Invoices & Bills│   │ • Auto-Dispatch   │   │   with 5 Service  │
│ • Subscriptions   │   │ • Lead Extraction │   │ • Booking Escrow  │   │ • Bank Reconcile  │   │ • Fleet GPS Map   │   │   Namespaces      │
│ • BYOK Key Vault  │   │ • Studio / RAG    │   │ • Paystack Wallet │   │ • Payroll & Tax   │   │ • Delivery Rates  │   │ • Relational FK   │
│ • RBAC Roles      │   │ • Telegram Sync   │   │ • Chat & Inquiries│   │ • HR Objectives   │   │ • SLA Monitoring  │   │   Integrity       │
└───────────────────┘   └───────────────────┘   └───────────────────┘   └───────────────────┘   └───────────────────┘   └───────────────────┘
```

---

## 🔑 5. Seeded Demo Accounts & Credentials

| Role | Email | Password | Primary Environment |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@ofia.ng` | `password123` | `ofia_admin` (`admin.ofia.ng`) |
| **Tenant Admin** | `admin@edusuite.ng` | `password123` | `ofia_business` (`edusuite.ofia.ng/erp/admin`) |
| **Financial Accountant** | `accountant@edusuite.ng` | `password123` | `ofia_business` (`edusuite.ofia.ng/erp/accountant`) |
| **HR Manager** | `hr@edusuite.ng` | `password123` | `ofia_business` (`edusuite.ofia.ng/erp/hr`) |
| **Managing Director** | `md@edusuite.ng` | `password123` | `ofia_business` (`edusuite.ofia.ng/erp/md`) |
| **Field Technician** | `tech@edusuite.ng` | `password123` | `ofia_business` (`edusuite.ofia.ng/erp/employee`) |
| **Marketplace Buyer / Client** | `client@ofia.ng` | `password123` | `ofia_business` (`ofia.ng`) |

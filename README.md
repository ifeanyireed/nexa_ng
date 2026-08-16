# Nexa NG Microservices Ecosystem & AI GTM Operating System

Nexa NG is an enterprise-grade platform comprising a hyper-local verified services marketplace and an autonomous 15-agent AI Go-To-Market operating system, built on a unified MySQL database (`u721451974_nexa_db`).

---

## 🏛️ System Architecture

```
                                  SHARED DATABASE: u721451974_nexa_db
                     ┌───────────────────────────┼───────────────────────────┐
                     │                           │                           │
                     ▼                           ▼                           ▼
        ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
        │   marketplace_service   │ │user_subscription_service││     ai_gtm_service      │
        │       (Port 8085)       │ │       (Port 8081)       │ │       (Port 8082)       │
        │ - Services & Discovery  │ │ - Identity & JWT Auth   │ │ - 15 Autonomous Agents  │
        │ - Bookings & Calendars  │ │ - Multi-Tenant Orgs     │ │ - Model Gateway         │
        │ - Orders & Deliveries   │ │ - Centralized Quotas    │ │ - GTM Strategy Canvas   │
        │ - Live WebSockets Chat  │ │ - Paystack Billing      │ │ - Lead Intelligence     │
        └─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
                     ▲                           ▲                           ▲
                     │                           │                           │
                     └─────────────┬─────────────┴─────────────┬─────────────┘
                                   │                           │
                     ┌─────────────┴───────────┐ ┌─────────────┴───────────┐
                     │         web_app         │ │    gtm_agent/frontend   │
                     │  (Port 3001 - Next.js)  │ │  (Port 3000 - Next.js)  │
                     │ - Consumer Discovery    │ │ - AI GTM Cockpit        │
                     │ - Booking Flow          │ │ - Super Admin Console   │
                     └─────────────────────────┘ └─────────────────────────┘
```

---

## 📦 Standalone Backend Microservices

### 1. [`user_subscription_service`](file:///Users/user/Downloads/nexa_ng/user_subscription_service) (`Port 8081`)
* **Core Domains**: User identity, JWT authentication, Multi-tenant Organization Workspaces, RBAC (`SUPER_ADMIN`, `TENANT_OWNER`, `GROWTH_LEAD`, `SALES_REP`, `VIEWER`), and Paystack webhook processing.
* **Centralized Limit Management (`SubscriptionHelper`)**: Single source of truth for plan entitlements (Free Trial, Starter, Growth, Scale, Enterprise) enforced dynamically in code.

```bash
cd user_subscription_service
go run main.go
```

### 2. [`ai_gtm_service`](file:///Users/user/Downloads/nexa_ng/ai_gtm_service) (`Port 8082`)
* **Core Domains**: 15 Autonomous AI Workforce Agents (CRO, Lead Hunter, GTM Strategist, Copywriter, WhatsApp Manager, etc.), Model Gateway (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Flash, Groq), GTM Strategy Canvas, Lead Enrichment, and Executive Voice Assistant.

```bash
cd ai_gtm_service
go run main.go
```

### 3. [`marketplace_service`](file:///Users/user/Downloads/nexa_ng/marketplace_service) (`Port 8085`)
* **Core Domains**: Local professional discovery, niche categories, verified Pro onboarding, customer booking schedules, digital products & orders, delivery tracking, and live messaging.

```bash
cd marketplace_service
go run main.go
```

---

## 💻 Frontend Applications

### 1. [`gtm_agent/frontend`](file:///Users/user/Downloads/nexa_ng/gtm_agent/frontend) (`Port 3000`)
* **Executive Suite**: Daily Briefing, Strategy Canvas, Multi-Channel Campaign Builder, Lead Scoring Radar, Approvals Center, and Voice Assistant HUD.
* **Super Admin Console** (`/admin`): Multi-tenant workspace management, user directory, canary feature flags, AI swarm health monitor, and observability cost analytics.

```bash
cd gtm_agent/frontend
npm run dev
```

### 2. [`web_app`](file:///Users/user/Downloads/nexa_ng/web_app) (`Port 3001`)
* **Marketplace Discovery**: Hyper-local search by state/LGA, Pro profiles, service booking, and digital product checkout.

```bash
cd web_app
npm run dev
```

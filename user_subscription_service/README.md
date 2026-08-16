# User & Subscription Microservice (`user_subscription_service`)

Standalone backend service for identity, multi-tenant organizations, and subscription limit management.

* **Port:** `8081`
* **Database:** `u721451974_nexa_db` (MySQL)

---

## 🌟 Key Features

* **Centralized Limit Management (`SubscriptionHelper`)**: Single-source-of-truth quota definitions dynamically calculated in code for **Free Trial**, **Starter**, **Growth**, **Scale**, and **Enterprise** tiers.
* **Authentication & RBAC**: JWT token issuance with support for `SUPER_ADMIN`, `TENANT_OWNER`, `GROWTH_LEAD`, `SALES_REP`, and `VIEWER`.
* **Multi-Tenant Workspaces**: Workspace member invitations, seat management, and tenant isolation.
* **Paystack & Stripe Webhooks**: Automated subscription renewal handling and transaction tracking.

---

## 🚀 Running Standalone

```bash
cd user_subscription_service
go mod tidy
go run main.go
```

Health check: [http://localhost:8081/health](http://localhost:8081/health)

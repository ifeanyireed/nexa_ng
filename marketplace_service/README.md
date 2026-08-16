# Marketplace Microservice (`marketplace_service`)

Dedicated backend microservice for the Nexa NG Services & Digital Product Discovery and Booking marketplace.

* **Port:** `8085` (or configured via `PORT`)
* **Database:** `u721451974_nexa_db` (MySQL)
* **Auth Delegation:** Verifies JWT access tokens issued by [`user_subscription_service`](file:///Users/user/Downloads/nexa_ng/user_subscription_service) (`:8081`).

---

## 🌟 Key Responsibilities

* **Discovery & Search**: Professional service listings, niche categorization, and verified Pro profiles.
* **Bookings & Sessions**: End-to-end booking workflow, availability schedules, and calendar reservations.
* **Orders & Deliveries**: Digital product purchase, file downloads, and fulfillment workflows.
* **Real-Time Communication**: WebSocket-powered live chat and in-app notifications.
* **Pro Tools**: Pro onboarding, portfolio articles, digital products, and analytics.

---

## 🚀 Running Standalone

```bash
cd marketplace_service
go mod tidy
go run main.go
```

Health check: [http://localhost:8085/health](http://localhost:8085/health)

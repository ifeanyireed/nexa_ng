# AI GTM Microservice (`ai_gtm_service`)

Standalone backend service for the 15-agent autonomous GTM workforce, Model Gateway, and execution pipelines.

* **Port:** `8082`
* **Database:** `u721451974_nexa_db` (MySQL)

---

## 🌟 Key Features

* **15 Autonomous AI Employees**: State machine and execution tracking for CRO, Lead Hunter, GTM Strategist, Copywriter, WhatsApp Manager, etc.
* **Model Gateway**: Smart fallback routing across Anthropic Claude 3.5 Sonnet, OpenAI GPT-4o, Google Gemini 1.5 Flash, and Groq Llama 3 with real-time token tracking and trace logging.
* **Real-Time Voice WebSocket (`/ws/voice`)**: Bidirectional audio streaming for executive voice commands.
* **GTM Strategy & Campaigns**: Visual execution chain generator and multi-channel campaign lifecycles.
* **Lead Extraction & ICP Scoring**: Automated prospect discovery feed with buying signals detection.
* **Approval Center**: Human-in-the-loop authorization engine for emails, WhatsApp dialogs, and ad spend increases.

---

## 🚀 Running Standalone

```bash
cd ai_gtm_service
go mod tidy
go run main.go
```

Health check: [http://localhost:8082/health](http://localhost:8082/health)

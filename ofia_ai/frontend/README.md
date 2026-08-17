# AI GTM Engine — Frontend Suite

The frontend for the **AI GTM Engine** (`gtm_agent`), inheriting the bespoke liquid-glassmorphic, typography-driven UI design system from [`web_app`](../../web_app).

---

## 🌟 Key Features & Screen Architecture

* **Executive Command Home (`/`)**: Daily morning briefing from Sterling Vance (CRO) with simulated audio TTS streaming, Yesterday vs Today metrics, and live AI workforce desks.
* **AI Organization Directory (`/team`)**: 15 autonomous AI specialists (CRO, Market Researcher, Lead Hunter, GTM Strategist, Copywriter, WhatsApp Manager, etc.) with real-time task progress and interactive chat workstations.
* **Interactive Agent Workstation Drawer (`AgentDrawer`)**: Click any agent across the app to review real-time reasoning, inspect deliverables, and chat directly.
* **Executive Voice Assistant HUD (`VoiceAssistantHUD`)**: Floating audio visualizer and voice command hub (*"What's happening today?"*, *"Ask Olivia for 500 more leads"*).
* **Visual GTM Strategy Canvas (`/strategy`)**: Visual 6-node revenue execution chain connecting Target ICP $\rightarrow$ Persona $\rightarrow$ Pain Point $\rightarrow$ Value Hook $\rightarrow$ Channel Mix $\rightarrow$ Core Offer.
* **Multi-Channel Campaign Hub (`/campaigns` & `/campaigns/new`)**: Campaign lifecycle manager across Email, WhatsApp Business, LinkedIn, and Meta Ads.
* **Lead Intelligence & CRM (`/leads`)**: Prospect extraction feed with ICP Fit Score (`0-100%`) and Buying Signals Radar.
* **Executive Approval Center (`/approvals`)**: High-fidelity visual previews of outgoing emails, WhatsApp Business Cloud templates, and ad spend increases with one-click authorization.
* **10-Step Onboarding Wizard (`/onboarding`)**: Conversational setup with automated AI market scan and confetti launch.
* **Content & Creative Studio (`/studio`)**: Multi-variant copywriting workbench.
* **Publishing Calendar (`/calendar`)**: Cross-channel flight and drop schedules.
* **Revenue & Engine Analytics (`/analytics`)**: Multi-touch attribution matrix, CAC, and ROI.
* **Memory Vault (`/knowledge`)**: Website crawler index and document vector memory.
* **Channel Integrations (`/integrations`)**: Email SMTP, WhatsApp Business Cloud WABA, LinkedIn, Meta Ads, and Telegram bots.
* **Settings (`/settings`)**: Autonomous safety thresholds and AI Model Gateway routing.

---

## 🛠️ Running Locally

```bash
cd gtm_agent/frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

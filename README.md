# Nexa NG (Next-Generation Local Service Marketplace)

Nexa is a hyper-local service marketplace tailored for the Nigerian market, connecting users with verified local professionals (Pros) across multiple niches (fashion, handyman, home maintenance, events, education, medical, wellness, etc.) in major cities like Lagos and Abuja.

This repository contains both the **Go Backend API** and the **Next.js Frontend (Static Export)**.

---

## Repository Structure

```
├── backend/                  # Go Router & API Services
│   ├── internal/             # Core backend handlers, middleware, and DB interface
│   ├── prisma/               # Database schema definition (Prisma ORM)
│   ├── scripts/              # Seed scripts for seeding pros, products, and articles
│   ├── main.go               # Server entrypoint
│   └── schema.sql            # Direct SQL schema definitions
│
├── frontend/                 # Next.js App Router Frontend
│   ├── src/                  # Source files (components, page routes, library helpers)
│   │   ├── app/              # Next.js pages and dynamic routes
│   │   ├── components/       # Premium UI components (Nexa components, glassmorphism)
│   │   └── lib/              # Client-side helpers, API configuration, static data
│   ├── tailwind.config.ts    # Tailwind styling tokens
│   └── next.config.mjs       # Static export configurations
│
└── README.md                 # Project documentation
```

---

## Features & Highlights

- **Static Frontend Architecture**: Next.js configured with `output: "export"` for high-performance static hosting (CDN/Nginx) with dynamic runtime API fetches.
- **Local SEO & Routing**: Dynamic profile paths structured as `/[service]/[state]/[lga]/[business]` (e.g. `/fashion/lagos/ikeja/adebayo-tailoring-services-business-cuid`) and articles at `/[niche]/articles/[title-article-id]` for optimal search indexation.
- **Premium Glassmorphic Design**: Customized, responsive design using cohesive color palettes matching different niches, modern typography (Inter/Outfit), and subtle micro-animations (Framer Motion).
- **Resilient Fallbacks**: Pre-rendered paths automatically query the Go API during compilation to collect live data, falling back gracefully to static templates if the API is offline.

---

## Backend Setup (Go & MySQL)

### Prerequisites
- Go (1.21+)
- MySQL or MariaDB running locally or remotely

### 1. Install Backend Dependencies
```bash
cd backend
go mod download
```

### 2. Configure Environment variables
Create a `.env` or `.env.development` file inside the `backend/` directory:
```env
PORT=8085
DATABASE_URL="mysql://username:password@localhost:3306/nexa_db"
ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
JWT_SECRET="your-jwt-secure-key"
```

### 3. Generate Prisma DB client
```bash
npx prisma generate
```

### 4. Seed the Database
Seed the database with professional profiles, custom cover images, dynamic cities (Lagos/Abuja split), local government areas (LGAs), and custom expert articles:
```bash
go run scripts/seed.go
```

### 5. Run the Backend Server
```bash
go run main.go
```
The server will boot up on the configured port (default is `8085`).

---

## Frontend Setup (Next.js)

### Prerequisites
- Node.js (v18+)
- npm or yarn

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API Endpoint
Create a `.env.local` file inside the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8085/api
```

### 3. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` to view the web application.

---

## Building and Exporting Static Files

To build and compile all pages into fully static assets:
```bash
cd frontend
npm run build
```
This output is saved to `frontend/out/` containing compiled static `.html` pages, `.css` stylesheets, and browser `.js` bundles ready to be hosted directly on Nginx.

---

## Deployment (Droplet & Nginx)

For self-hosting on a DigitalOcean Droplet:

1. Serve the `frontend/out` directory statically using Nginx.
2. Configure Nginx to reverse-proxy `/api` endpoints directly to the Go server on port `8085`.
3. Set up SSL certificates via Certbot for `nexa.reedbreed.cc`.

Refer to the generated [Deployment Guide](file:///Users/user/.gemini/antigravity-cli/brain/f41f53dc-1e62-43fa-8ff8-2ada6ca408eb/deployment_guide.md) for step-by-step commands and full configuration scripts.

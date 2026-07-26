<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="client/public/logo/brandLogo_white.png">
    <img alt="ContractChill" src="client/public/logo/brandLogo_black.png" width="320">
  </picture>
</p>

<p align="center">
  <strong>AI-Powered Legal Document Analyzer</strong><br>
  Instantly review, identify risks, and understand complex contracts with AI-driven analysis.<br>
  Built for freelancers, founders, and anyone who signs agreements but isn't a lawyer.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-1B1B18?style=flat-square&logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-1B1B18?style=flat-square&logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-1B1B18?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-1B1B18?style=flat-square&logo=express&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-1B1B18?style=flat-square&logo=firebase&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini_AI-1B1B18?style=flat-square&logo=googlegemini&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-1B1B18?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Railway" src="https://img.shields.io/badge/Railway-1B1B18?style=flat-square&logo=railway&logoColor=white" />
</p>

---

## Overview

ContractChill transforms complex legal documents into clear, actionable insights. Upload a contract (PDF, DOCX, or TXT), and the AI delivers a structured breakdown with risk flags, plain-language summaries, and negotiation scripts — all tailored to your preferred persona.

### Key Features

- **Multi-Persona AI Analysis** — Choose from four communication styles: *Chill Friend* (casual), *Angry Lawyer* (strict), *Corporate Mentor* (strategic), or *Freelancer Senior* (practical). Personas auto-detect English or Indonesian.
- **Red Flag Detection** — Clauses flagged as High, Medium, or Safe risk with plain-English explanations.
- **Clause Summaries & Jargon Definitions** — Every clause broken down in clear language. Legal terms explained in context.
- **Negotiation Scripts** — Generate email or chat drafts to negotiate specific clauses, in the persona's tone.
- **AI Chat** — Follow-up Q&A about any analyzed contract.
- **Contract Generator** — Draft full contracts from scratch based on project details.
- **Side-by-Side Viewer** — Original contract and AI analysis displayed simultaneously.
- **Analysis History** — All past analyses saved in Firestore, searchable and filterable by persona.
- **Command Palette** — `⌘K` quick navigation to any page.
- **Analytics Dashboard** — Visual insights into your contract analysis history.
- **Dark / Light / System Theme** — Persistent preference with automatic system detection.
- **PWA Support** — Installable as a standalone app with offline fallback.
- **Bilingual** — Full English and Indonesian language support.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Styling | Tailwind CSS 4, shadcn/ui, beUI |
| Animation | Framer Motion 12 |
| Backend | Node.js, Express 5, TypeScript 6 |
| AI Engine | Google Gemini 2.5 Flash |
| Auth | Firebase Authentication (email/password + Google) |
| Database | Firestore (NoSQL) |
| PDF | react-pdf-viewer, pdf-parse, jspdf |
| Icons | lucide-react |
| Notifications | sonner |
| HTTP | axios (client), cors + helmet (server) |
| Container | Docker (multi-stage build) |

---

## Architecture

```
contract-chill/
├── client/                  # React SPA
│   ├── src/
│   │   ├── components/      # UI components (motion + base)
│   │   ├── pages/           # Route-level views
│   │   ├── contexts/        # Auth, Theme, Sidebar
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client with Firebase auth interceptor
│   │   └── lib/             # Firebase init, utilities
│   └── vite.config.ts
├── server/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Gemini AI integration with persona prompts
│   │   ├── middleware/       # Firebase token verification
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # AppError, asyncHandler, file helpers
│   └── index.ts
├── shared/                  # Shared types between client and server
├── Dockerfile               # Multi-stage production build
└── .env.example             # Environment variable reference
```

**Development:** Vite dev server (`:5173`) proxies API calls to Express (`:5000`).

**Production:** Express serves the built client assets from `client/dist/`. All API routes are prefixed with `/api`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase project (Auth + Firestore enabled)
- Google Gemini API key

### Setup

```bash
git clone https://github.com/your-org/contract-chill.git
cd contract-chill

# Install workspace dependencies
npm install

# Copy environment variables and fill in your values
cp .env.example client/.env
cp .env.example server/.env
```

Refer to [`.env.example`](.env.example) for all required variables.

### Run Locally

```bash
# Starts both client (:5173) and server (:5000) concurrently
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Docker

```bash
docker build -t contract-chill .
docker run -p 8080:8080 --env-file .env contract-chill
```

---

## Deployment

Deployed on [Railway](https://railway.app) via the included `Dockerfile`. Railway auto-deploys from GitHub on push to the default branch.

Environment variables required in production:

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK service account JSON |
| `VITE_FIREBASE_*` | Firebase Web SDK config values |
| `PORT` | Server port (Railway sets this automatically) |
| `NODE_ENV` | Set to `production` |

---

## Design

- **Font:** Geist Variable (sans) + Geist Mono (code)
- **Palette:** Warm monochrome — off-white backgrounds, near-black text, subtle warm-gray borders
- **Components:** beUI motion components + shadcn/ui primitives
- **Animations:** Framer Motion — page transitions, stagger reveals, micro-interactions
- **Theme:** Light, Dark, and System modes persisted in localStorage

---

## License

All Rights Reserved.

Copyright (c) 2026 ContractChill. This source code is provided for viewing and reference purposes only. See the [LICENSE](./LICENSE) file for details.

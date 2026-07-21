# ContractChill

**AI-Powered Legal Document Analyzer** — Instantly review, identify risks, and understand complex contracts with AI-driven analysis. Built for freelancers, founders, and anyone who signs agreements but isn't a lawyer.

<p>
  <img alt="React" src="https://img.shields.io/badge/React-19-1B1B18?style=flat-square&logo=react&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-1B1B18?style=flat-square&logo=vite&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-1B1B18?style=flat-square&logo=typescript&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-5-1B1B18?style=flat-square&logo=express&logoColor=white" />
  <img alt="Firebase" src="https://img.shields.io/badge/Firebase-1B1B18?style=flat-square&logo=firebase&logoColor=white" />
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini_AI-1B1B18?style=flat-square&logo=googlegemini&logoColor=white" />
  <img alt="Tailwind" src="https://img.shields.io/badge/Tailwind-4-1B1B18?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img alt="Framer Motion" src="https://img.shields.io/badge/Framer_Motion-12-1B1B18?style=flat-square&logo=framer&logoColor=white" />
  <img alt="Deployed on Railway" src="https://img.shields.io/badge/Railway-1B1B18?style=flat-square&logo=railway&logoColor=white" />
</p>

---

## Features

- **AI-Powered Analysis** — Paste a contract clause or upload a PDF/DOCX/TXT file. Gemini AI returns a structured breakdown in seconds.
- **4 Personas** — Choose how the AI communicates: *Chill Friend* (casual), *Angry Lawyer* (strict), *Corporate Mentor* (strategic), *Freelancer Senior* (practical). Personas auto-detect English or Indonesian.
- **Red Flag Detection** — Clauses flagged as High, Medium, or Safe risk with plain-English explanations.
- **Clause Summaries** — Every clause broken down in clear language.
- **Jargon Definitions** — Legal terms explained in context.
- **Negotiation Scripts** — Generate email or chat drafts to negotiate specific clauses, in the persona's tone.
- **AI Chat** — Follow-up Q&A about any analyzed contract.
- **Contract Generator** — Draft full contracts from scratch based on project details.
- **Side-by-Side Viewer** — Original contract and AI analysis displayed simultaneously.
- **Analysis History** — All past analyses saved in Firestore, searchable and filterable by persona.
- **Dark / Light / System Theme** — Persistent preference with system detection.
- **Command Palette** — `⌘K` quick navigation to any page.

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
| Container | Docker (multi-stage) |

---

## Architecture

```
contract-chill/
├── client/                  # React SPA
│   ├── src/
│   │   ├── components/      # beUI motion + shadcn/ui components
│   │   ├── pages/           # Landing, Dashboard, Analyzer, Generator, History, Settings
│   │   ├── contexts/        # AuthContext (Firebase), ThemeContext
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client (axios + Firebase auth interceptor)
│   │   └── lib/             # Firebase client init, easing config
│   └── vite.config.ts
├── server/                  # Express API
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Gemini AI integration with persona prompts
│   │   ├── middleware/       # Firebase token verification
│   │   ├── types/           # Shared TypeScript types
│   │   └── utils/           # AppError, asyncHandler, file helpers
│   └── index.ts             # Express app setup
├── Dockerfile               # Multi-stage build
└── .env.example
```

**Development:** Vite dev server (`:5173`) proxies API calls to Express (`:5000`).

**Production:** Express serves the built client assets from `client/dist/`. All API routes are prefixed with `/api`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- Firebase project (Auth + Firestore enabled)
- Google Gemini API key ([get one here](https://aistudio.google.com/))

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/contract-chill.git
cd contract-chill

# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..

# Copy environment variables and fill in your values
cp .env.example client/.env
cp .env.example server/.env
```

Refer to [`.env.example`](.env.example) for all required variables.

### Run locally

```bash
# From root — starts both client (:5173) and server (:5000)
# (or use two terminals: cd client && npm run dev + cd server && npm run dev)
```

Open [http://localhost:5173](http://localhost:5173).

---

## Docker

```bash
docker build -t contract-chill .
docker run -p 8080:8080 --env-file .env contract-chill
```

Multi-stage build stages:

1. **client-builder** — builds the React SPA
2. **server-builder** — compiles TypeScript server
3. **runner** — production image with `node:20-alpine`, serves Express + static client

---

## Deployment

Deployed on [Railway](https://railway.app) via the included `Dockerfile`.

1. Connect your GitHub repository to Railway
2. Set all environment variables from `.env.example` in the Railway dashboard
3. Railway auto-detects the `Dockerfile` and deploys on push to main

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
- **Components:** beUI motion components + shadcn/ui base components
- **Animations:** Framer Motion — page transitions, stagger reveals, micro-interactions
- **Theme:** Light, Dark, and System modes persisted in localStorage

---

## License

MIT

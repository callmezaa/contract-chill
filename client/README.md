# ContractChill — Client

> React SPA for AI-powered legal document analysis.

## Stack

- **Framework:** React 19 + TypeScript 6 + Vite 8
- **Styling:** Tailwind CSS 4 + shadcn/ui + beUI
- **Animation:** Framer Motion 12
- **Routing:** React Router 7
- **Data:** TanStack React Query 5
- **Auth:** Firebase Authentication (email/password, Google)
- **PDF:** react-pdf-viewer, pdfjs-dist
- **Icons:** lucide-react
- **Notifications:** sonner

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (`:5173`) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Environment

Copy from the root `.env.example` to `client/.env`. All client variables are prefixed with `VITE_`.

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | API endpoint (dev: `http://localhost:5000/api`) |
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID |

## Project Structure

```
src/
├── components/
│   ├── motion/          # beUI animated components (Loader, MorphingModal, Dock, etc.)
│   └── ui/              # shadcn/ui base components (Button, Card, Badge, etc.)
├── pages/               # Route-level views
│   ├── LandingPage.tsx
│   ├── Dashboard.tsx
│   ├── Analyzer.tsx
│   ├── Generator.tsx
│   ├── History.tsx
│   └── Settings.tsx
├── contexts/            # AuthContext, ThemeContext
├── hooks/               # Custom hooks (useDocumentTitle, etc.)
├── services/            # API client with Firebase auth interceptor
├── types/               # TypeScript type definitions
├── lib/                 # Firebase init, easing config (ease.ts)
├── layouts/             # App layout with sidebar
├── App.tsx              # Router + providers
└── index.css            # Tailwind entry + design tokens
```

## Key Links

- [Design tokens & theme](src/index.css)
- [API client](src/services/api.ts)
- [Component library](src/components/)
- [Easing & spring config](src/lib/ease.ts)

## Component Philosophy

The UI is built on two layers:

1. **beUI** (`src/components/motion/`) — animated, opinionated components with built-in Framer Motion transitions (Loader, MorphingModal, Dock, Command Palette, Bouncy Accordion, etc.)
2. **shadcn/ui** (`src/components/ui/`) — base primitives (Button, Card, Badge, Accordion, Switch, Input) styled with Tailwind CSS variables

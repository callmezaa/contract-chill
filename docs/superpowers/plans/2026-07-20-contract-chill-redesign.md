# Contract Chill UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete redesign of Contract Chill from blue/white + glow to warm monochrome Apple-style editorial design with shadcn + beUI components.

**Architecture:** Monorepo with Vite+React frontend and Express backend. Design tokens live in `index.css` via Tailwind v4 `@theme`. shadcn provides base UI primitives, beUI provides motion components. Dark mode activated with system preference detection. beUI Dock replaces the sidebar.

**Tech Stack:** React 19, Vite 8, Tailwind v4, shadcn/ui, beUI (motion components), Framer Motion 12, Lucide Icons, Geist Sans/Mono fonts, Sonner (toasts)

**Package Manager:** npm (package-lock.json at `client/`)

## Global Constraints

- No blue (#0071e3) anywhere — warm monochrome palette only
- No glow effects, gradients, glassmorphism, or neon
- No `rounded-full` on cards or buttons (tags/badges only)
- No `scale(0)` entry animations — start from `scale(0.95)` + `opacity(0)`
- No `ease-in` on UI animations — use `ease-out` or spring
- No `transition: all` — specify exact properties
- No `space-x-*` / `space-y-*` — use `gap-*`
- No manual z-index on overlay components
- No emojis in code or content
- All pressable elements must have `scale(0.97)` on `:active`
- Animate only `transform` and `opacity`
- `prefers-reduced-motion` must be respected
- `@media (hover: hover) and (pointer: fine)` gates hover effects
- All colors use CSS semantic tokens (`--text`, `--surface`, etc.) — never raw hex inline
- shadcn styling rules: `cn()` for conditional classes, `size-*` for equal dimensions, semantic colors only

---

### Task 1: Fix Geist Font Loading

**Files:**
- Modify: `client/index.html`
- Create: `client/public/fonts/.gitkeep`
- Modify: `client/src/index.css`

**Interfaces:**
- Consumes: — (foundation task)
- Produces: `@font-face` CSS rules that define `--font-geist-sans` and `--font-geist-mono` variables

- [ ] **Step 1: Copy Geist font files from node_modules to public**

```bash
mkdir -p public/fonts
cp node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2 public/fonts/
cp node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2 public/fonts/
```

- [ ] **Step 2: Remove old Google Fonts links from index.html**

Replace the Inter + Outfit font links in `index.html:30-32` with just the preconnect for no external fonts needed. Remove lines 29-32 entirely — Geist is self-hosted now.

- [ ] **Step 3: Add @font-face rules to index.css**

Add at the top of `client/src/index.css` (before `@import "tailwindcss"`):

```css
@font-face {
  font-family: 'Geist';
  src: url('/fonts/Geist-Variable.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('/fonts/GeistMono-Variable.woff2') format('woff2');
  font-display: swap;
  font-weight: 100 900;
}
```

- [ ] **Step 4: Update meta theme-color**

In `index.html:11`, change `content="#3b82f6"` to `content="#FBFBFA"`.

- [ ] **Step 5: Verify fonts load**

Run `npm run dev`, open DevTools → Network tab → filter `woff2` — both font files should load.

---

### Task 2: Rewrite index.css with Warm Monochrome Palette

**Files:**
- Modify: `client/src/index.css` (full rewrite)

**Interfaces:**
- Consumes: Geist font variables (Task 1)
- Produces: CSS custom properties for entire design system

- [ ] **Step 1: Replace `@theme` block with new tokens**

Replace the current `@theme {}` block (lines 4-22):

```css
@theme {
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
  --font-display: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;

  --color-background: var(--background);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-surface-elevated: var(--surface-elevated);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-text-muted: var(--text-muted);
  --color-text-subtle: var(--text-subtle);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-danger: var(--danger);

  --radius-card: 12px;
  --radius-sm: 8px;
}
```

- [ ] **Step 2: Replace `:root` block with warm monochrome light palette**

Replace the current `:root {}` block (lines 24-41):

```css
:root {
  --font-geist-sans: 'Geist', ui-sans-serif, system-ui, sans-serif;
  --font-geist-mono: 'Geist Mono', ui-monospace, monospace;

  --background: #FBFBFA;
  --surface: #FFFFFF;
  --surface-2: #F5F4F2;
  --surface-elevated: #FFFFFF;
  --border: #E5E5E2;
  --text: #1B1B18;
  --text-muted: #6E6D68;
  --text-subtle: #A1A09A;
  --success: #248A3D;
  --warning: #B26A00;
  --danger: #D70015;
}
```

- [ ] **Step 3: Replace `.dark` block with warm monochrome dark palette**

Replace the `.dark, [data-theme='dark']` block (lines 43-53):

```css
.dark, [data-theme='dark'] {
  --background: #131312;
  --surface: #1C1C1A;
  --surface-2: #262624;
  --surface-elevated: #2A2A28;
  --border: #333330;
  --text: #F0EFED;
  --text-muted: #A1A09A;
  --text-subtle: #706F68;
}
```

- [ ] **Step 4: Rewrite `@layer base`**

Replace the current `@layer base {}` (lines 55-87):

```css
@layer base {
  html {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
  }

  body {
    @apply bg-background text-text antialiased selection:bg-text/10;
    font-family: var(--font-geist-sans);
    letter-spacing: -0.011em;
  }

  button, a, [role='button'] {
    -webkit-tap-highlight-color: transparent;
  }

  button:active, a:active, [role='button']:active {
    transform: scale(0.97);
  }

  :focus-visible {
    outline: 2px solid var(--text-muted);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      scroll-behavior: auto !important;
      transition-duration: 0.01ms !important;
    }
  }
}
```

- [ ] **Step 5: Rewrite `@layer components`**

Replace the current `@layer components {}` (lines 89-123) — remove `.btn-primary`, `.btn-outline`, `.card`, `.input`, `.nav-link`, `.nav-link-active`. Keep only `.custom-scrollbar`:

```css
@layer components {
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 9999px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--text-subtle);
  }
}
```

- [ ] **Step 6: Remove legacy patterns**

Remove `bg-grid-pattern`, `animate-bounce-slow`, `animate-spin-slow` and their keyframes (lines 146-179).

Remove PDF export classes (lines 125-143) — these should be handled differently.

---

### Task 3: Activate Dark Mode with System Preference

**Files:**
- Modify: `client/src/context/ThemeContext.tsx`

**Interfaces:**
- Consumes: CSS dark class definitions (Task 2)
- Produces: Working `useTheme()` hook with `theme`, `setTheme`, `toggleTheme` that controls dark/light/system

- [ ] **Step 1: Rewrite ThemeContext.tsx**

```tsx
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.setAttribute('data-theme', resolved);
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    return stored ?? 'system';
  });

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'light';
      return getSystemTheme() === 'dark' ? 'light' : 'dark';
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
```

- [ ] **Step 2: Verify dark mode works**

Run `npm run dev`. Open the app — it should respect system preference. Add a temporary toggle button to test switching. (Will be replaced with beUI Theme Toggle later.)

---

### Task 4: Initialize shadcn CLI & Install Base Components

**Files:**
- Create: `client/components.json`
- Create: `client/src/components/ui/button.tsx` (update existing)
- Create: `client/src/components/ui/card.tsx` (update existing)
- Create: `client/src/components/ui/dialog.tsx`
- Create: `client/src/components/ui/dropdown-menu.tsx`
- Create: `client/src/components/ui/select.tsx`
- Create: `client/src/components/ui/tabs.tsx`
- Create: `client/src/components/ui/tooltip.tsx`
- Create: `client/src/components/ui/popover.tsx`
- Create: `client/src/components/ui/skeleton.tsx`
- Create: `client/src/components/ui/separator.tsx`
- Create: `client/src/components/ui/badge.tsx`
- Create: `client/src/components/ui/avatar.tsx`
- Create: `client/src/components/ui/table.tsx`
- Create: `client/src/components/ui/sheet.tsx`

**Interfaces:**
- Consumes: Tailwind v4 theme (Task 2)
- Produces: Reusable shadcn UI primitives

- [ ] **Step 1: Install shadcn CLI and init**

```bash
npx shadcn@latest init
```

When prompted:
- Style: pick the default option
- Base color: pick the neutral/warm option
- CSS file path: `src/index.css`
- CSS variables: yes
- Tailwind prefix: (empty)
- React hooks: yes
- Utils: `src/lib/utils`
- Components: `src/components/ui`
- Icon library: lucide-react
- Path alias: `@/`

- [ ] **Step 2: Install all needed shadcn components in one command**

```bash
npx shadcn@latest add button card dialog dropdown-menu select tabs tooltip popover skeleton separator badge avatar table sheet
```

- [ ] **Step 3: Update existing button.tsx and card.tsx with new imports**

Read the generated files. The old manually-created button.tsx and card.tsx should be overwritten by the CLI.

- [ ] **Step 4: Verify components compile**

Run `npm run dev` and check for TypeScript errors.

---

### Task 5: Install beUI Components

**Files:**
- Create: various files under `client/src/components/ui/beui-*.tsx` (or wherever beUI installs)

**Interfaces:**
- Consumes: shadcn base (Task 4)
- Produces: beUI motion components

- [ ] **Step 1: Install core beUI components**

```bash
npx shadcn@latest add @beui/button @beui/dock @beui/tabs @beui/switch @beui/input @beui/select @beui/tooltip @beui/number @beui/text-animation @beui/bouncy-accordion @beui/morphing-modal @beui/theme-toggle @beui/command-palette @beui/shader-background @beui/loader @beui/action-swap
```

- [ ] **Step 2: Review and fix imports**

Read each beUI component file. Check that imports use `@/` alias correctly. Fix any hardcoded paths.

- [ ] **Step 3: Verify components compile**

Run `npm run dev` — fix any import/type errors.

---

### Task 6: Redesign Layout with beUI Dock Sidebar

**Files:**
- Modify: `client/src/layouts/Layout.tsx`
- Modify: `client/src/components/Sidebar.tsx` (if exists separately, otherwise Layout.tsx)
- Modify: `client/src/App.tsx` (add global providers)

**Interfaces:**
- Consumes: shadcn Avatar, Tooltip (Task 4), beUI Dock (Task 5), useTheme hook (Task 3)
- Produces: New app shell with compact icon dock, dark mode toggle, command palette trigger

- [ ] **Step 1: Write the new Layout with beUI Dock**

Read the current `Layout.tsx` to understand the routing structure (which uses `<Outlet />`). Replace the sidebar with beUI Dock:

```tsx
'use client';

import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FilePenLine,
  History,
  Settings,
  LogOut,
} from 'lucide-react';
import { Dock, DockItem, DockLabel } from '@/components/ui/beui-dock';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/beui-theme-toggle';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generator', icon: FilePenLine, label: 'Generator' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-background">
      <Dock className="w-16 flex flex-col items-center py-4 gap-2 border-r border-border bg-surface">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Tooltip key={to}>
            <TooltipTrigger asChild>
              <NavLink to={to} className={({ isActive }) => `p-3 rounded-lg transition-colors ${isActive ? 'bg-surface-2 text-text' : 'text-text-muted hover:text-text hover:bg-surface-2'}`}>
                <Icon className="size-5" />
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              {label}
            </TooltipContent>
          </Tooltip>
        ))}

        <div className="mt-auto flex flex-col items-center gap-2">
          <ThemeToggle />
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={logout} className="p-3 rounded-lg text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
                <LogOut className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Sign out</TooltipContent>
          </Tooltip>
          <Avatar className="size-8">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="text-xs bg-surface-2 text-text-muted">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </Dock>

      <main className="flex-1 overflow-y-auto px-8 py-10">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Add global Command Palette to App.tsx**

In `client/src/App.tsx`, import and render the beUI Command Palette as a global component:

```tsx
import { CommandPalette } from '@/components/ui/beui-command-palette';

// Inside return, after Toaster:
<CommandPalette
  items={[
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'generator', label: 'Generator', icon: FilePenLine, href: '/generator' },
    { id: 'history', label: 'History', icon: History, href: '/history' },
    { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
  ]}
/>
```

- [ ] **Step 3: Verify**

Run `npm run dev`. Check that the sidebar renders correctly with icons, tooltips work, theme toggle functions, routing works via NavLink.

---

### Task 7: Update Page Transitions

**Files:**
- Modify: `client/src/components/PageTransition.tsx`
- Modify: `client/src/components/AnimatedRoutes.tsx`

**Interfaces:**
- Consumes: Framer Motion (already installed)
- Produces: Smooth page transitions: fade + translateY(8px), 250ms, ease-out

- [ ] **Step 1: Update PageTransition.tsx**

```tsx
'use client';

import { motion } from 'framer-motion';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Update AnimatedRoutes.tsx**

Ensure `AnimatePresence` wraps the route switch with `mode="wait"`. No other changes needed — transitions are handled by PageTransition wrapping each page.

---

### Task 8: Redesign LandingPage

**Files:**
- Modify: `client/src/pages/LandingPage.tsx`
- Modify: `client/src/components/ChillAura.tsx` (verify it works with new theme)

**Interfaces:**
- Consumes: beUI Button, TextAnimation (Task 5), ChillAura (keep existing)
- Produces: New landing page with ChillAura hero + bento features

- [ ] **Step 1: Write new LandingPage**

```tsx
'use client';

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/beui-button';
import { TextAnimation } from '@/components/ui/beui-text-animation';
import { ChillAura } from '@/components/ChillAura';
import { FileText, Shield, Zap, Globe } from 'lucide-react';

const features = [
  { icon: FileText, title: 'Instant Analysis', desc: 'Upload any contract and get a plain-English breakdown in seconds.' },
  { icon: Shield, title: 'Risk Detection', desc: 'AI identifies red flags, unfair clauses, and hidden liabilities.' },
  { icon: Zap, title: 'Smart Suggestions', desc: 'Get negotiation scripts tailored to each concerning clause.' },
  { icon: Globe, title: 'Plain English', desc: 'Legal jargon translated into language you actually understand.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <ChillAura />
        </div>
        <div className="relative z-10 max-w-3xl">
          <TextAnimation
            text="Know what you're signing."
            as="h1"
            className="text-5xl font-bold tracking-tight text-text"
          />
          <p className="mt-6 text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
            AI-powered contract analysis that catches what lawyers miss.
            Upload, review, and understand any document before you sign.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="border border-border rounded-xl p-6 bg-surface">
              <div className="size-10 rounded-lg bg-surface-2 flex items-center justify-center mb-4">
                <Icon className="size-5 text-text" />
              </div>
              <h3 className="text-base font-medium text-text">{title}</h3>
              <p className="mt-2 text-sm text-text-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify ChillAura renders with new palette**

Check that the 3D scene uses the new background color or is transparent enough to work on `#FBFBFA` / `#131312`.

---

### Task 9: Redesign Dashboard

**Files:**
- Modify: `client/src/pages/Dashboard.tsx`

**Interfaces:**
- Consumes: shadcn Card, Badge, Table, Avatar (Task 4), beUI Number (Task 5)
- Produces: Bento grid dashboard with stats + recent analyses

- [ ] **Step 1: Write new Dashboard**

Bento grid layout:
- Top row: 3 stat cards (total analyses, risks found, contracts generated) — use beUI Number for count-up animation
- Bottom row: recent analyses table (shadcn Table) + quick action cards

Key structural code for stat cards:
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div className="border border-border rounded-xl p-6 bg-surface">
    <p className="text-sm text-text-muted">Total Analyses</p>
    <Number value={stats.totalAnalyses} className="text-3xl font-semibold text-text mt-1" />
  </div>
  ...
</div>
```

- [ ] **Step 2: Ensure all API calls and data fetching still work**

The dashboard uses TanStack Query — verify the data flow is unchanged.

---

### Task 10: Redesign Analyzer Page

**Files:**
- Modify: `client/src/pages/Analyzer.tsx`
- Modify: `client/src/components/RiskScoreMeter.tsx` (restyle)
- Modify: `client/src/components/KeyClauses.tsx` (replace accordion with beUI BouncyAccordion)
- Modify: `client/src/components/AnalysisChat.tsx` (restyle)

**Interfaces:**
- Consumes: beUI Tabs, beUI BouncyAccordion, beUI Number (Task 5)
- Produces: Analyzer page with risk score, clause accordions, chat widget — all in new style

- [ ] **Step 1: Restyle RiskScoreMeter**

Update SVG colors: remove blue, use `--text`, `--text-muted`, `--surface-2`.

- [ ] **Step 2: Restyle KeyClauses**

Replace existing accordion with beUI BouncyAccordion:

```tsx
import { BouncyAccordion, BouncyAccordionItem } from '@/components/ui/beui-bouncy-accordion';
```

- [ ] **Step 3: Restyle AnalysisChat**

Remove any glow/blue styling. Use `--surface`, `--border`, `--text` tokens.

---

### Task 11: Redesign Generator Page

**Files:**
- Modify: `client/src/pages/Generator.tsx`

**Interfaces:**
- Consumes: beUI Input, beUI Select, beUI Button (Task 5)
- Produces: Clean form for contract generation

- [ ] **Step 1: Refactor Generator**

Replace old inputs with beUI Input components. Replace old selects with beUI Select. Use beUI Button with spring press.

---

### Task 12: Redesign History Page

**Files:**
- Modify: `client/src/pages/History.tsx`

**Interfaces:**
- Consumes: shadcn Table (Task 4), beUI Button, beUI Input (Task 5)
- Produces: Clean data table with search/filter

- [ ] **Step 1: Refactor History**

Use shadcn Table for the data display. Add a search bar using beUI Input. Replace action buttons with beUI Buttons.

---

### Task 13: Redesign Settings Page

**Files:**
- Modify: `client/src/pages/Settings.tsx`

**Interfaces:**
- Consumes: beUI Switch, beUI Tabs, beUI ThemeToggle, shadcn Card, shadcn Select (Tasks 4, 5)
- Produces: Clean settings form with dark mode toggle, profile settings, notification preferences

- [ ] **Step 1: Refactor Settings**

Use shadcn Card for settings sections. beUI Switch for toggles. beUI ThemeToggle for theme switcher (integrate with ThemeContext).

---

### Task 14: Redesign Auth Pages (Login + Register)

**Files:**
- Modify: `client/src/pages/LoginPage.tsx`
- Modify: `client/src/pages/RegisterPage.tsx`

**Interfaces:**
- Consumes: beUI Input, beUI Button, shadcn Card (Tasks 4, 5)
- Produces: Clean Apple-style auth forms

- [ ] **Step 1: Refactor LoginPage**

```tsx
<div className="min-h-screen flex items-center justify-center bg-background px-4">
  <div className="w-full max-w-sm border border-border rounded-xl p-8 bg-surface">
    <h1 className="text-2xl font-semibold text-text text-center mb-2">Welcome back</h1>
    <p className="text-sm text-text-muted text-center mb-8">Sign in to your account</p>
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Email" type="email" />
      <Input label="Password" type="password" />
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
    <p className="mt-6 text-sm text-center text-text-muted">
      No account? <Link to="/register" className="text-text underline underline-offset-2">Create one</Link>
    </p>
  </div>
</div>
```

- [ ] **Step 2: Same pattern for RegisterPage**

---

### Task 15: Redesign NotFoundPage

**Files:**
- Modify: `client/src/pages/NotFoundPage.tsx`

**Interfaces:**
- Consumes: beUI NotFound or Button (Task 5)
- Produces: Clean 404 page

- [ ] **Step 1: Basic 404**

```tsx
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <h1 className="text-6xl font-bold text-text">404</h1>
      <p className="mt-4 text-text-muted">This page doesn't exist.</p>
      <Link to="/dashboard" className="mt-8">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}
```

---

### Task 16: Replace Custom Components with beUI

**Files:**
- Modify: `client/src/components/AnimatedCounter.tsx` — replace usage with beUI Number
- Modify: `client/src/pages/Analyzer.tsx` — use beUI Number for risk score
- Delete: `client/src/components/GlassyBackground.tsx`
- Delete: `client/src/components/MagneticButton.tsx`

**Interfaces:**
- Consumes: beUI components (Task 5)
- Produces: Cleaner codebase, no duplicate animation logic

- [ ] **Step 1: Replace AnimatedCounter**

Search for all imports/uses of `AnimatedCounter`. Replace with `import { Number } from '@/components/ui/beui-number'`.

- [ ] **Step 2: Delete GlassyBackground**

Remove all imports of `GlassyBackground` from pages and App.tsx. Delete the file.

- [ ] **Step 3: Delete MagneticButton**

Remove all imports. Delete the file.

---

### Task 17: Clean Up Legacy Files

**Files:**
- Delete: `client/src/components/OnboardingTour.tsx` (if exists)
- Modify: `client/src/App.css` (clear or delete)
- Delete: any unused assets

- [ ] **Step 1: Remove unused CSS and files**

Check if `App.css` has anything still in use. If not, empty it or delete and remove its import from `App.tsx`.

- [ ] **Step 2: Verify nothing is broken**

Run `npm run build`. Fix any TypeScript errors from removed components.

---

### Task 18: Final Micro-animation Pass

**Files:**
- Modify: any remaining components that need animation polish

**Interfaces:**
- Consumes: all previous tasks
- Produces: Polished, cohesive feel

- [ ] **Step 1: Audit for missing press states**

Check every button and clickable card for `:active { transform: scale(0.97) }`. Add where missing.

- [ ] **Step 2: Audit for stagger animations**

Check bento grids and lists for stagger reveal delays (e.g., `transition-delay: calc(var(--index) * 60ms)`).

- [ ] **Step 3: Audit reduced motion**

Verify `prefers-reduced-motion: reduce` removes all transform-based animations but keeps opacity fades.

- [ ] **Step 4: Test dark mode toggle**

Verify the theme toggle switches light/dark smoothly. Check all pages in both modes.

- [ ] **Step 5: Final build check**

```bash
npm run build
```

Fix any final errors.

---

### Task 19: Remove Old DESIGN.MD

- [ ] **Step 1: Archive old design doc**

The old `DESIGN.MD` at project root should be archived or removed since the new spec replaces it.

```bash
git rm DESIGN.MD
```

Or rename to `DESIGN.MD.old`.

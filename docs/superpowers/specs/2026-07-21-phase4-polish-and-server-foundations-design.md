# Phase 4 Polish + Server Foundations

**Date:** 2026-07-21
**Status:** Design Spec
**Supersedes:** Phase 4 items in `.agents/specs/2026-07-20-contract-chill-redesign.md`

---

## 1. Server Types & Utils

### 1.1 `server/src/types/auth.ts`

Move `AuthenticatedRequest` out of `auth.middleware.ts` and centralize auth-related types.

```typescript
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { uid: string; email?: string };
}

export interface DecodedToken {
  uid: string;
  email?: string;
  iat: number;
  exp: number;
}
```

### 1.2 `server/src/types/analysis.ts`

Move type definitions out of `gemini.service.ts` and `analysis.controller.ts` to a shared location. Mirror client-side types but server-owning.

```typescript
export type RiskLevel = 'High' | 'Medium' | 'Safe';
export type Persona = 'Angry Lawyer' | 'Chill Friend' | 'Corporate Mentor' | 'Freelancer Senior';

export interface RedFlag {
  clause: string;
  risk: RiskLevel;
  explanation: string;
  suggestedScript?: string;
}

export interface AnalysisResult {
  summary: string;
  redFlags: RedFlag[];
  negotiationSuggestions: string[];
  clauses: { title: string; explanation: string }[];
  jargons?: { term: string; definition: string }[];
  personaExplanation: string;
}
```

### 1.3 `server/src/types/api.ts`

Standard API response wrappers for consistent error/data shape.

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}
```

### 1.4 `server/src/utils/app-error.ts`

Custom error class carrying HTTP status code and optional machine-readable error code.

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### 1.5 `server/src/utils/async-handler.ts`

Higher-order function that wraps async Express route handlers, eliminating try-catch boilerplate in every controller method. Errors are forwarded to Express error middleware.

```typescript
import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncHandler) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

### 1.6 `server/src/utils/file-helpers.ts`

Utility functions for file upload operations (save, delete, ensure directory). Centralizes logic currently duplicated across `analysis.controller.ts` and `analysis.routes.ts`.

```typescript
export const ensureUploadDir = (dir: string): void => { ... };
export const saveFile = (buffer: Buffer, originalName: string, uploadsDir: string): { fileName: string; filePath: string } => { ... };
export const deleteFile = (filePath: string): void => { ... };
```

### 1.7 `server/src/types/index.ts`

Barrel re-export file.

```typescript
export * from './auth';
export * from './analysis';
export * from './api';
```

### 1.8 Migration Impact

| File | Change |
|------|--------|
| `auth.middleware.ts` | Remove inline `AuthenticatedRequest` interface, import from `@/types/auth` |
| `gemini.service.ts` | Remove `Persona` type, import from `@/types/analysis` |
| `analysis.controller.ts` | Refactor try-catch blocks to use `asyncHandler` + `AppError` |
| `analysis.routes.ts` | No changes needed |

---

## 2. Design Polish (Phase 4)

### 2.1 beUI Component Replacements

Per the existing design spec, the following component swaps complete the migration from handmade/custom components to beUI:

#### Item 19: NegotiationScriptModal → MorphingModal
- **Current:** Custom modal with manual backdrop, scroll, and transition
- **Target:** Replace with beUI `MorphingModal` component
- **Changes:** `NegotiationScriptModal.tsx` — wrap in morphing-modal pattern. Keep internal content structure (tone selector, script display, share hub) but replace outer shell (backdrop + container + enter/exit) with `MorphingModal` primitives.

#### Item 20: Loading States → beUI Loader
- **Current:** Manual skeleton HTML + CSS `animate-pulse` classes across Dashboard, Analyzer, Generator, History
- **Target:** Replace with beUI `Loader` component
- **Changes:** Search for `animate-pulse` usage in page components. Create a shared `LoadingSkeleton` component wrapping beUI Loader, then replace inline skeletons.

#### Item 21: Remove Legacy Components
- `MagneticButton` — still used in `LandingPage.tsx` lines ~124-127 and ~267-274. Replace with beUI `Button`.
- `GlassyBackground` — already removed (confirmed not present in codebase).
- Any remaining inline `#0071e3`, `#1d1d1f`, `#6e6e73` color literals — search and replace with CSS variable tokens.

#### Item 22: Purge Old CSS Utility Classes
- Search for `.btn-primary`, `.btn-outline`, `.card`, `.input`, `.nav-link`, `.nav-link-active` in all `.tsx` files.
- Replace with shadcn/beUI component equivalents.
- Remove their definitions from `index.css` if any remain.

#### Item 23: Micro-Animation Pass

Target all interactive elements for consistent motion behavior:

**Timing & Easing Table:**
| Element | Enter | Exit | Interactive |
|---------|-------|------|-------------|
| Cards | fade-up 300ms, `--ease-out` | — | hover: translateY(-2px) 200ms |
| Buttons | — | — | `:active` scale(0.97), hover: opacity 150ms |
| Modals | spring stiffness 300 damping 20 | opacity 150ms | — |
| Lists (History) | stagger 60ms, fade-up 200ms | — | hover: translateX(4px) 150ms |
| Tooltips | opacity 150ms | opacity 100ms | — |
| Page transition | 250ms crossfade | 250ms crossfade | — |
| Chat messages | fade-up 200ms, stagger 80ms | — | — |

**Easing curves (consolidate in `client/src/lib/ease.ts`):**
```
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

**Entry animations:** Components that mount statically (Settings sections, History list groups, Generator preview area) should receive fade-up + spring on mount.

**AnalysisChat:** Each AI message bubble transitions from `opacity: 0, y: 12` → `opacity: 1, y: 0` in 200ms with 80ms stagger per message.

### 2.2 Scope Boundary

The following are explicitly OUT of scope for this polish pass:
- No changes to routing or page architecture (`AnimatedRoutes`, `Layout`)
- No changes to color palette or CSS variables (already warm monochrome per spec)
- No changes to API logic, controllers, or data flow
- No changes to Firebase configuration or auth flow
- No changes to ThemeContext or `index.css` design token structure

---

## 3. Files Changed (Complete List)

### New Files
| File | Purpose |
|------|---------|
| `server/src/types/auth.ts` | Auth type definitions |
| `server/src/types/analysis.ts` | Analysis type definitions |
| `server/src/types/api.ts` | API response types |
| `server/src/types/index.ts` | Barrel re-exports |
| `server/src/utils/app-error.ts` | Custom error class |
| `server/src/utils/async-handler.ts` | Async route wrapper |
| `server/src/utils/file-helpers.ts` | File upload utilities |

### Modified Files
| File | Change |
|------|--------|
| `server/src/middleware/auth.middleware.ts` | Import `AuthenticatedRequest` from types |
| `server/src/services/gemini.service.ts` | Import `Persona` from types |
| `server/src/controllers/analysis.controller.ts` | Use `asyncHandler` + `AppError`, import types |
| `client/src/components/NegotiationScriptModal.tsx` | Replace shell with MorphingModal |
| `client/src/components/motion/button/magnetic.tsx` | Remove if unused elsewhere, or keep for LandingPage |
| `client/src/pages/LandingPage.tsx` | Replace MagneticButton → Button |
| `client/src/pages/Dashboard.tsx` | Replace skeleton with Loader |
| `client/src/pages/Analyzer.tsx` | Replace skeleton with Loader |
| `client/src/pages/Generator.tsx` | Replace skeleton with Loader |
| `client/src/pages/History.tsx` | Replace skeleton with Loader |
| `client/src/components/AnalysisChat.tsx` | Add stagger entry animation |

---

## 4. Verification Criteria

1. `npm run build` succeeds in both `client/` and `server/`
2. No old CSS utility classes remain in any `.tsx` file
3. No hardcoded blue/color hex values (except design token definitions)
4. All interactive elements have consistent `:active` scale(0.97) and hover transitions
5. Loading states use beUI Loader consistently across all pages
6. NegotiationScriptModal transitions through MorphingModal pattern
7. Controller files no longer have raw try-catch blocks (using asyncHandler)
8. File upload duplication eliminated through `file-helpers.ts`

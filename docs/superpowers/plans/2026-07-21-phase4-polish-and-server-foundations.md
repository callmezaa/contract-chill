# Phase 4 Polish + Server Foundations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 4 design polish (Apple-style UI micro-interactions) and establish server type/util foundations.

**Architecture:** Two independent workstreams — server (types + utils + controller refactor) and client (component swaps + animation polish). No shared files between workstreams, enabling parallel execution.

**Tech Stack:** Express 5 + TypeScript (server), React 19 + Vite + Framer Motion + beUI/shadcn (client)

## Global Constraints

- Server uses relative imports (no path aliases in tsconfig)
- Use existing `ease.ts` spring/easing tokens; do not add new ones
- No new dependencies
- `npm run build` must pass after every task in both `client/` and `server/`
- Follow existing component patterns (beUI + shadcn, CSS variable tokens)
- No emojis, no blue primary, no gradients, no glow effects

---

## File Structure

### New Files (Server)
| File | Responsibility |
|------|---------------|
| `server/src/types/auth.ts` | `AuthenticatedRequest`, `DecodedToken` |
| `server/src/types/analysis.ts` | `Persona`, `RiskLevel`, `RedFlag`, `AnalysisResult` |
| `server/src/types/api.ts` | `ApiResponse<T>`, `PaginatedResponse<T>` |
| `server/src/types/index.ts` | Barrel re-exports |
| `server/src/utils/app-error.ts` | `AppError` class (statusCode + message + code) |
| `server/src/utils/async-handler.ts` | `asyncHandler` wrapper for Express route handlers |
| `server/src/utils/file-helpers.ts` | `ensureUploadDir`, `saveFile`, `deleteFile` |

### Modified Files (Server)
| File | Change |
|------|--------|
| `server/src/middleware/auth.middleware.ts` | Remove inline `AuthenticatedRequest`, import from types |
| `server/src/services/gemini.service.ts` | Remove inline `Persona`, import from types; update exports |
| `server/src/controllers/analysis.controller.ts` | Import types, use `asyncHandler` + `AppError`, remove try-catch boilerplate |
| `server/src/routes/analysis.routes.ts` | Wrap handlers with `asyncHandler` |
| `server/src/index.ts` | Add error-handling middleware |

### Modified Files (Client)
| File | Change |
|------|--------|
| `client/src/components/NegotiationScriptModal.tsx` | Replace outer shell with `MorphingModal` |
| `client/src/pages/LandingPage.tsx` | Replace `MagneticButton` with `Button` |
| `client/src/pages/Dashboard.tsx` | Replace inline skeleton with shared `Loader` |
| `client/src/pages/Analyzer.tsx` | Replace inline skeleton with shared `Loader` |
| `client/src/pages/Generator.tsx` | Replace inline skeleton with shared `Loader` |
| `client/src/pages/History.tsx` | Replace inline skeleton with shared `Loader` |
| `client/src/components/AnalysisChat.tsx` | Add stagger entry animation to messages |
| Various components | Micro-interaction pass (hover/press consistency) |

---

## Task 1: Server Types Layer

**Files:**
- Create: `server/src/types/auth.ts`
- Create: `server/src/types/analysis.ts`
- Create: `server/src/types/api.ts`
- Create: `server/src/types/index.ts`
- Modify: `server/src/middleware/auth.middleware.ts:1-9`
- Modify: `server/src/services/gemini.service.ts:1-10`

**Interfaces:**
- Produces: `AuthenticatedRequest`, `Persona`, `RiskLevel`, `RedFlag`, `AnalysisResult`, `ApiResponse<T>`, `PaginatedResponse<T>`

- [ ] **Step 1: Create `server/src/types/auth.ts`**

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

- [ ] **Step 2: Create `server/src/types/analysis.ts`**

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

- [ ] **Step 3: Create `server/src/types/api.ts`**

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

- [ ] **Step 4: Create `server/src/types/index.ts`**

```typescript
export * from './auth';
export * from './analysis';
export * from './api';
```

- [ ] **Step 5: Update `server/src/middleware/auth.middleware.ts`**

Replace the inline `AuthenticatedRequest` interface with an import:
```typescript
import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import type { AuthenticatedRequest } from '../types/auth';

export { AuthenticatedRequest };
```

- [ ] **Step 6: Update `server/src/services/gemini.service.ts`**

Replace the inline `Persona` type with an import:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import type { Persona } from '../types/analysis';

dotenv.config();

export { Persona };
```

Remove the 6-line `export type Persona = ...` declaration (lines 9-10 in current file).

- [ ] **Step 7: Verify build**

```bash
cd server && npx tsc --noEmit
```
Expected: exit code 0, no type errors.

- [ ] **Step 8: Commit**

```bash
git add server/src/types/ server/src/middleware/auth.middleware.ts server/src/services/gemini.service.ts
git commit -m "feat(server): add shared types layer and migrate inline types"
```

---

## Task 2: Server Utils Layer

**Files:**
- Create: `server/src/utils/app-error.ts`
- Create: `server/src/utils/async-handler.ts`
- Create: `server/src/utils/file-helpers.ts`

**Interfaces:**
- Produces: `AppError`, `asyncHandler`, `ensureUploadDir`, `saveFile`, `deleteFile`

- [ ] **Step 1: Create `server/src/utils/app-error.ts`**

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

- [ ] **Step 2: Create `server/src/utils/async-handler.ts`**

```typescript
import { Request, Response, NextFunction } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export const asyncHandler = (fn: AsyncFn) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

- [ ] **Step 3: Create `server/src/utils/file-helpers.ts`**

```typescript
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function ensureUploadDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function saveFile(
  buffer: Buffer,
  originalName: string,
  uploadsDir: string
): { fileName: string; filePath: string } {
  ensureUploadDir(uploadsDir);
  const ext = path.extname(originalName) || '.bin';
  const fileName = `${crypto.randomUUID()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return { fileName, filePath };
}

export function deleteFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Silently ignore — file may already be gone
  }
}
```

- [ ] **Step 4: Verify build**

```bash
cd server && npx tsc --noEmit
```
Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add server/src/utils/
git commit -m "feat(server): add utility layer (AppError, asyncHandler, file helpers)"
```

---

## Task 3: Server Controller Refactor + Error Middleware

**Files:**
- Modify: `server/src/controllers/analysis.controller.ts` (full rewrite of methods)
- Modify: `server/src/routes/analysis.routes.ts:66-74`
- Modify: `server/src/index.ts` (add error middleware after route registration)

**Interfaces:**
- Consumes: `AppError` from `../utils/app-error`, `asyncHandler` from `../utils/async-handler`, `saveFile` from `../utils/file-helpers`, `Persona`/`AnalysisResult` from `../types/analysis`

- [ ] **Step 1: Rewrite `server/src/controllers/analysis.controller.ts`**

Replace all methods to use `asyncHandler` signature (req, res) without try-catch, using AppError for error cases:

```typescript
import { Request, Response } from 'express';
import { GeminiService } from '../services/gemini.service';
import type { Persona } from '../types/analysis';
import { AppError } from '../utils/app-error';
import { saveFile } from '../utils/file-helpers';
import axios from 'axios';
import path from 'path';
const pdf = require('pdf-parse');

export class AnalysisController {
  static async analyze(req: Request, res: Response) {
    const file = req.file;
    const persona = (req.body.persona as Persona) || 'Chill Friend';

    if (!file) {
      throw new AppError(400, 'No file uploaded');
    }

    let text = '';
    try {
      if (file.mimetype === 'application/pdf') {
        const data = await pdf(file.buffer);
        text = data.text;
      } else {
        text = file.buffer.toString('utf-8');
      }
    } catch (err) {
      console.error('PDF Parse Error:', err);
      throw new AppError(400, 'Gagal membaca dokumen. Pastikan PDF Anda tidak dikunci dengan password (terenkripsi) atau rusak.');
    }

    if (!text || text.trim().length < 50) {
      throw new AppError(400, 'Teks dokumen terlalu sedikit atau tidak terbaca (misalnya PDF berisi gambar hasil scan). Harap unggah dokumen yang teksnya bisa disalin.');
    }

    const uploadsDir = path.join(__dirname, '../../uploads');
    const { fileName } = saveFile(file.buffer, file.originalname, uploadsDir);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${fileName}`;

    console.log(`Starting analysis for persona: ${persona}. Text length: ${text.length} chars.`);
    const analysis = await GeminiService.analyzeContract(text, persona);

    res.json({ ...analysis, fileUrl });
  }

  static async chat(req: Request, res: Response) {
    const { question, previousAnalysis, persona, fileUrl } = req.body;
    let contractText = req.body.contractText;

    if (!question) {
      throw new AppError(400, 'Question is required');
    }

    if (!contractText && fileUrl) {
      console.log('Fetching contract text from URL for chat...');
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const data = await pdf(Buffer.from(response.data));
      contractText = data.text;
    }

    if (!contractText) {
      throw new AppError(400, 'Contract context is missing');
    }

    const response = await GeminiService.chatWithAI(
      contractText,
      JSON.stringify(previousAnalysis),
      question,
      persona as Persona
    );

    res.json({ response });
  }

  static async generateScript(req: Request, res: Response) {
    const { clause, explanation, persona, tone } = req.body;

    if (!clause || !explanation) {
      throw new AppError(400, 'Clause and explanation are required');
    }

    const script = await GeminiService.generateNegotiationScript(
      clause,
      explanation,
      (persona as Persona) || 'Chill Friend',
      tone
    );

    res.json({ script });
  }

  static async generateContract(req: Request, res: Response) {
    const { clientName, myName, projectValue, contractType, specialConditions } = req.body;

    if (!clientName || !myName || !projectValue || !contractType) {
      throw new AppError(400, 'Missing required fields for contract generation');
    }

    const draft = await GeminiService.generateContractDraft(req.body);
    res.json({ draft });
  }
}
```

- [ ] **Step 2: Update `server/src/routes/analysis.routes.ts`**

Wrap all controller references with `asyncHandler`:

```typescript
import { asyncHandler } from '../utils/async-handler';

// Changes to existing route definitions:
router.post('/analyze', requireAuth, analyzeLimiter, upload.single('contract'), (req, res, next) => {
  console.log('API /analyze hit!');
  next();
}, asyncHandler(AnalysisController.analyze));

router.post('/chat', requireAuth, actionLimiter, asyncHandler(AnalysisController.chat));
router.post('/generate-script', requireAuth, actionLimiter, asyncHandler(AnalysisController.generateScript));
router.post('/generate-contract', requireAuth, actionLimiter, asyncHandler(AnalysisController.generateContract));
```

Import at top of file:
```typescript
import { asyncHandler } from '../utils/async-handler';
```

- [ ] **Step 3: Add error middleware to `server/src/index.ts`**

Insert after route registration, before `app.listen`:

```typescript
import { AppError } from './utils/app-error';

// Error-handling middleware (must be 4 parameters)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});
```

Update imports in `index.ts` to include `NextFunction`:
```typescript
import express, { Request, Response, NextFunction } from 'express';
```

- [ ] **Step 4: Verify build**

```bash
cd server && npx tsc --noEmit
```
Expected: exit code 0.

- [ ] **Step 5: Commit**

```bash
git add server/src/controllers/analysis.controller.ts server/src/routes/analysis.routes.ts server/src/index.ts
git commit -m "refactor(server): use asyncHandler and AppError in controller and routes"
```

---

## Task 4: Replace NegotiationScriptModal with MorphingModal

**Files:**
- Modify: `client/src/components/NegotiationScriptModal.tsx` (replace outer shell)

- [ ] **Step 1: Replace `NegotiationScriptModal.tsx`**

Replace the entire file. The inner content (tone selector, script display, share hub, info note, footer buttons) stays the same — only the outer shell (backdrop + container + transition) swaps to `MorphingModal`.

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, MessageSquare, Send, MessageCircle, Mail, Shield, Zap, type LucideIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, RefreshCw } from 'lucide-react';
import type { Persona } from '../types/analysis';
import { generateNegotiationScript } from '../services/api';
import { MorphingModal } from '@/components/motion/morphing-modal';

interface NegotiationScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: string;
  clause: string;
  explanation: string;
  persona: Persona;
}

export const NegotiationScriptModal = ({ isOpen, onClose, script, clause, explanation, persona }: NegotiationScriptModalProps) => {
  const [copied, setCopied] = useState(false);
  const [currentScript, setCurrentScript] = useState(script);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'Friendly' | 'Assertive' | 'Tough'>('Assertive');

  useEffect(() => {
    setCurrentScript(script);
    setSelectedTone('Assertive');
  }, [script, isOpen]);

  const handleGenerate = async (toneToUse?: 'Friendly' | 'Assertive' | 'Tough') => {
    const activeTone = toneToUse || selectedTone;
    if (toneToUse) setSelectedTone(toneToUse);
    try {
      setIsGenerating(true);
      const scriptText = await generateNegotiationScript(clause, explanation, persona, activeTone);
      setCurrentScript(scriptText);
      toast.success(`Naskah negosiasi (${activeTone}) berhasil diperbarui!`);
    } catch (error) {
      console.error('Generation Error:', error);
      toast.error('Gagal memperbarui naskah');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!currentScript) return;
    navigator.clipboard.writeText(currentScript);
    setCopied(true);
    toast.success('Script copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => { ... }; // unchanged
  const handleSendEmail = () => { ... }; // unchanged

  const toneOptions = [
    { id: 'Friendly' as const, label: 'Friendly', Icon: MessageCircle },
    { id: 'Assertive' as const, label: 'Assertive', Icon: Shield },
    { id: 'Tough' as const, label: 'Tough', Icon: Zap },
  ];

  return (
    <MorphingModal viewId={isOpen ? 'negotiation-script' : null} onClose={onClose} placement="center">
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-display font-semibold text-text">Negotiation script</h3>
              <p className="text-[9px] text-text-subtle font-medium">Ready-to-use template</p>
            </div>
          </div>
        </div>

        {/* Target Clause */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">Target Clause</label>
          <div className="p-3 rounded-xl bg-surface-2 border border-border italic text-[11px] text-text-muted leading-relaxed line-clamp-2">
            "{clause}"
          </div>
        </div>

        {/* Tone selector — unchanged */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">Negotiation Style</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-2 border border-border">
            {toneOptions.map((toneOpt) => {
              const isActive = selectedTone === toneOpt.id;
              const ToneIcon = toneOpt.Icon;
              return (
                <button
                  key={toneOpt.id}
                  onClick={() => !isGenerating && handleGenerate(toneOpt.id)}
                  disabled={isGenerating}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-background text-primary border border-border/80 shadow-sm scale-[1.02]'
                      : 'text-text-subtle hover:text-text hover:bg-background/40 border border-transparent'
                  }`}
                >
                  <ToneIcon className="w-3.5 h-3.5" />
                  <span>{toneOpt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Script content — unchanged */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">AI Suggested Script</label>
          <div className="relative group">
            <div className={`w-full bg-background border border-border rounded-xl p-4 text-xs text-text font-medium leading-relaxed min-h-[120px] whitespace-pre-wrap flex items-center justify-center ${isGenerating ? 'opacity-50' : ''}`}>
              {isGenerating ? (
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-[10px] font-bold animate-pulse">Gemini is writing...</p>
                </div>
              ) : currentScript ? (
                <div className="w-full text-left">{currentScript}</div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center py-2">
                  <Sparkles className="w-6 h-6 text-primary/30" />
                  <div>
                    <p className="text-[10px] text-text-muted font-bold">Old Analysis</p>
                    <p className="text-[9px] text-text-subtle">Generate script now</p>
                  </div>
                  <button onClick={() => handleGenerate()} className="btn-primary py-1.5 px-4 text-[9px] flex items-center gap-2">
                    <RefreshCw className="w-2.5 h-2.5" />
                    Generate Now
                  </button>
                </div>
              )}
            </div>
            {currentScript && !isGenerating && (
              <button onClick={handleCopy} className="absolute top-2 right-2 p-2 bg-surface border border-border rounded-lg shadow-sm hover:border-primary/50 hover:bg-white transition-all group/btn active:scale-90">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-text-subtle group-hover/btn:text-primary transition-colors" />}
              </button>
            )}
          </div>
        </div>

        {/* Share hub — unchanged */}
        {currentScript && !isGenerating && (
          <div className="flex flex-col gap-2 mb-4">
            <label className="text-[9px] font-bold text-text-subtle tracking-wider ml-1">Smart Share Hub</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleWhatsAppShare} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-green-600 dark:text-green-400 font-bold text-[10px] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" />
                Send to WhatsApp
              </button>
              <button onClick={handleSendEmail} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold text-[10px] transition-all hover:scale-[1.02] active:scale-98 cursor-pointer">
                <Mail className="w-3.5 h-3.5" />
                Send PDF to Email
              </button>
            </div>
          </div>
        )}

        {/* Info note — unchanged */}
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10 mb-4">
          <Send className="w-3 h-3 text-primary mt-0.5 shrink-0" />
          <p className="text-[9px] text-primary/80 font-medium leading-normal">
            AI scripts are best used as a starting point for professional communication.
          </p>
        </div>

        {/* Footer buttons — unchanged */}
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-[10px] font-bold text-text-muted hover:bg-surface transition-all">
            Close
          </button>
          <button onClick={handleCopy} disabled={!currentScript || isGenerating} className="btn-primary px-6 py-2 text-[10px] flex items-center gap-2">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy Script'}</span>
          </button>
        </div>
      </div>
    </MorphingModal>
  );
};
```

> Note: Keep `handleWhatsAppShare` and `handleSendEmail` verbatim from the current file (inner logic unchanged).

- [ ] **Step 2: Verify build**

```bash
cd client && npx tsc -b --noEmit
```
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/NegotiationScriptModal.tsx
git commit -m "refactor(client): replace NegotiationScriptModal shell with MorphingModal"
```

---

## Task 5: Remove MagneticButton — LandingPage

**Files:**
- Modify: `client/src/pages/LandingPage.tsx` — replace `MagneticButton` imports and usages

- [ ] **Step 1: Update imports in `LandingPage.tsx`**

Remove:
```typescript
import { MagneticButton } from '@/components/motion/button';
```

The `Button` import already exists:
```typescript
import { Button } from '@/components/motion/button';
```

- [ ] **Step 2: Replace `MagneticButton` usages**

Line ~124:
```typescript
// Before:
<MagneticButton strength={0.15} size="sm" onClick={() => navigate('/login')}>
  Get started <ArrowRight />
</MagneticButton>

// After:
<Button variant="primary" size="sm" onClick={() => navigate('/login')}>
  Get started <ArrowRight />
</Button>
```

Line ~267-268:
```typescript
// Before:
<MagneticButton strength={0.25} size="lg" onClick={() => navigate('/login')}>
  Start with a contract <ArrowRight />
</MagneticButton>

// After:
<Button variant="primary" size="lg" onClick={() => navigate('/login')}>
  Start with a contract <ArrowRight />
</Button>
```

Line ~270-274:
```typescript
// Before:
<MagneticButton strength={0.15} variant="outline" size="lg" onClick={() => {
  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
}}>
  See how it works
</MagneticButton>

// After:
<Button variant="outline" size="lg" onClick={() => {
  document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' });
}}>
  See how it works
</Button>
```

- [ ] **Step 3: Verify build**

```bash
cd client && npx tsc -b --noEmit
```
Expected: exit code 0.

- [ ] **Step 4: Check if `MagneticButton` is used elsewhere**

```bash
cd client && rg "MagneticButton" src/ --no-heading
```
If no other usages remain, delete `client/src/components/motion/button/magnetic.tsx`.

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/LandingPage.tsx client/src/components/motion/button/magnetic.tsx
git commit -m "refactor(client): replace MagneticButton with Button on LandingPage"
```

---

## Task 6: beUI Loader Integration

**Files:**
- Modify: `client/src/pages/Dashboard.tsx` — replace inline skeleton in upload zone
- Modify: `client/src/pages/Analyzer.tsx` — replace inline skeleton in loading state
- Modify: `client/src/pages/Generator.tsx` — replace inline skeleton
- Modify: `client/src/pages/History.tsx` — replace inline skeleton

- [ ] **Step 1: Create shared loading wrapper**

Create `client/src/components/LoadingFallback.tsx`:
```typescript
import { Loader } from '@/components/motion/loader';

export const LoadingFallback = ({ className }: { className?: string }) => (
  <div className={`min-h-[50vh] flex items-center justify-center ${className ?? ''}`}>
    <Loader variant="morph" />
  </div>
);
```

- [ ] **Step 2: Update `AnimatedRoutes.tsx`**

Replace the inline spinner in the Suspense fallback:
```typescript
// Before:
<Suspense fallback={
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
}>
  <Component />
</Suspense>

// After:
<Suspense fallback={<LoadingFallback />}>
  <Component />
</Suspense>
```

Add import at top:
```typescript
import { LoadingFallback } from '../components/LoadingFallback';
```

- [ ] **Step 3: Update `Dashboard.tsx`**

Find the idle loading skeleton in stat cards (lines ~199-201):
```typescript
// Before:
{history ? (
  <NumberTicker value={stat.value as number} />
) : (
  <span className="w-12 h-6 bg-surface-2 rounded animate-pulse inline-block" />
)}

// After:
{history ? (
  <NumberTicker value={stat.value as number} />
) : (
  <Loader variant="spinner" size={20} />
)}
```

Add import:
```typescript
import { Loader } from '@/components/motion/loader';
```

- [ ] **Step 4: Update `Analyzer.tsx`**

The entire skeleton block (lines ~490-577) is the loading state. Replace the outermost container's inner skeleton content with `Loader`:

Find the main skeleton return block (line ~490). Replace the skeleton content with a centered loader:

```typescript
if (isLoading) {
  return (
    <div className="min-h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] flex items-center justify-center bg-transparent">
      <Loader variant="morph" size={48} label="Analyzing contract..." />
    </div>
  );
}
```

Also remove the `select-none` class usage for the skeleton (no longer needed).

- [ ] **Step 5: Update `Generator.tsx`**

Find the `isGenerating` skeleton block (lines ~344-403). Replace the inner mock document skeleton with a centered Loader:

```typescript
{isGenerating ? (
  <motion.div
    key="loading"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex flex-col items-center justify-center gap-4"
  >
    <Loader variant="comet" size={64} />
    <span className="text-[12px] font-bold text-text-muted animate-pulse">AI Drafting Iron-Clad Clauses...</span>
  </motion.div>
) : ...}
```

Add import:
```typescript
import { Loader } from '@/components/motion/loader';
```

- [ ] **Step 6: Update `History.tsx`**

Replace the inline skeleton items (lines ~186-204) with `Loader`:

```typescript
{isLoading ? (
  <div className="flex items-center justify-center py-20">
    <Loader variant="bars" size={32} />
  </div>
) : ...}
```

Add import:
```typescript
import { Loader } from '@/components/motion/loader';
```

- [ ] **Step 7: Verify build**

```bash
cd client && npx tsc -b --noEmit
```
Expected: exit code 0.

- [ ] **Step 8: Commit**

```bash
git add client/src/components/LoadingFallback.tsx client/src/components/AnimatedRoutes.tsx client/src/pages/Dashboard.tsx client/src/pages/Analyzer.tsx client/src/pages/Generator.tsx client/src/pages/History.tsx
git commit -m "refactor(client): replace manual skeletons with beUI Loader component"
```

---

## Task 7: AnalysisChat Stagger + Micro-Animation Pass

**Files:**
- Modify: `client/src/components/AnalysisChat.tsx` — stagger entry for messages
- Modify: Various components — micro-interaction audit

- [ ] **Step 1: Add stagger animation to chat messages in `AnalysisChat.tsx`**

Wrap the message list in a motion container with stagger:

```typescript
import { motion, AnimatePresence } from 'framer-motion';
```

Replace the message rendering area (lines ~179-196) — wrap in motion.div with stagger:

```typescript
<motion.div className="space-y-4" variants={{ show: { transition: { staggerChildren: 0.08 } } }} initial="hidden" animate="show">
  {messages.map((m, i) => (
    <motion.div
      key={i}
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }
      }}
      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {/* existing avatar + message bubble — unchanged */}
    </motion.div>
  ))}
</motion.div>
```

The existing empty-state div stays as-is (not animated).

- [ ] **Step 2: Micro-interaction audit — hover/press consistency scan**

Check all interactive elements across the app for:
1. `:active` — CSS `transform: scale(0.97)` already applied globally in `index.css` via `button:active, a:active`
2. Hover transitions — search for elements missing `hover:` classes

```bash
cd client && rg -l "cursor-pointer\|cursor-pointer" src/pages/ src/components/ | head -20
```

For each found element, ensure it has at least: `transition-colors` or `transition-all duration-150` plus a `hover:` variant (e.g. `hover:bg-surface-2`, `hover:text-text`).

Specific items to check:
- **Dashboard** persona buttons (lines ~389-409) — already have `transition-[background-color,border-color,box-shadow,transform] duration-150` ✓
- **Dashboard** recent activity cards (lines ~495-541) — already have `transition-all duration-200` + `hover:-translate-y-0.5` ✓
- **History** filter buttons — ensure `transition-colors` on all pill buttons
- **Settings** toggle switches — already handled by beUI Switch
- **Generator** form inputs — ensure `transition-colors` on focus states (already have `focus:border-primary`)

- [ ] **Step 3: Verify build**

```bash
cd client && npx tsc -b --noEmit
```
Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
git add client/src/components/AnalysisChat.tsx
git commit -m "feat(client): add stagger entry animation to chat messages"
```

---

## Self-Review Checklist

- [ ] All spec requirements mapped to a task?
  - Server types: Task 1 ✓
  - Server utils: Task 2 ✓
  - Controller refactor: Task 3 ✓
  - MorphingModal: Task 4 ✓
  - MagneticButton removal: Task 5 ✓
  - beUI Loader: Task 6 ✓
  - Animation polish: Task 7 ✓
- [ ] Any placeholder patterns (TBD, "implement later", etc.)? — None
- [ ] Type consistency across all server tasks? — `Persona`, `AuthenticatedRequest`, `AppError` all consistent
- [ ] Client component references consistent? — `Loader`, `MorphingModal`, `Button` all match actual component APIs

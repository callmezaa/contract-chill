# Page Colors Fix Report

## Files Modified

### 1. `client/src/pages/Analyzer.tsx`
- Replaced 10 `isDark` conditional color blocks with CSS variable tokens
- `bg-white` → `bg-surface`, `border-slate-200`/`border-white/5`/`border-white/10` → `border-border`
- `text-slate-600` → `text-text-muted`
- Removed `shadow-sm` from conditional branches where redundant
- Kept `isDark` for risk card colors (red/amber semantic) and ring color — these aren't in the mapping
- `bg-white` in hidden pdf-only div → `bg-surface`

### 2. `client/src/pages/Dashboard.tsx`
- Replaced 6 `isDark` conditional color blocks with CSS variable tokens
- `bg-slate-50` → `bg-surface`, `border-slate-200` → `border-border`
- `text-slate-500` → `text-text-muted`
- Simplified identical `isDark` branches (levitating icon)
- **Removed `useTheme` import and `isDark` variable** — no longer needed

### 3. `client/src/pages/Generator.tsx`
- Replaced 9 `isDark` conditional color blocks with CSS variable tokens
- All form inputs: `bg-slate-50 border-slate-200` → `bg-surface-2 border-border`
- Preview panel: `bg-white border-slate-200` → `bg-surface border-border`
- Toolbar: `bg-slate-50 border-slate-200` → `bg-surface border-border`
- Draft content: `bg-white text-black border-slate-200` → `bg-surface text-text border-border`
- **Removed `useTheme` import and `isDark` variable** — no longer needed

### 4. `client/src/pages/LegalPage.tsx`
- `bg-white` → `bg-surface` (page background)
- **Removed `useTheme` import and `isDark` variable** — no longer needed

### 5. `client/src/pages/History.tsx`
- No changes needed — already using CSS variable tokens

### 6. `client/src/pages/Settings.tsx`
- No changes needed — already using CSS variable tokens

## Verification
- `npx vite build` passes successfully

## Remaining `isDark` Usage
- **Analyzer.tsx**: Still uses `isDark` for risk card colors (red/amber semantic) and ring color — not in the color mapping

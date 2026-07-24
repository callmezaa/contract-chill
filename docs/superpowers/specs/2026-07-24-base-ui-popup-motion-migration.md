# Base-UI Popup Motion Migration

**Status:** Approved design
**Date:** 2026-07-24
**Goal:** Replace CSS `animate-in`/`animate-out` utilities on 6 base-ui popup wrappers with `motion/react` animations via the `render` prop pattern

---

## Problem

6 base-ui wrapper components in `src/components/ui/` (Dialog, Popover, Sheet, DropdownMenu, Tooltip, Select) use Tailwind CSS animation utilities (`data-open:animate-in`, `data-closed:animate-out`, `animate-in`, `fade-in-0`, `zoom-in-95`, `slide-in-from-*`) for their entrance/exit animations. The rest of the codebase (`src/components/motion/`) uses `motion/react` (framer-motion) with spring physics. This inconsistency means:

- Popup animations use linear CSS timing instead of spring physics
- No JS-level animation control (no `useReducedMotion()`, no stagger, no `onAnimationComplete`)
- Easing/timing is fragmented across CSS classes rather than centralized in `lib/ease.ts`

## Solution

Create a shared `<PopupMotion>` utility component that wraps base-ui popup content with `motion/react` via base-ui's `render` prop, then use it in all 6 components.

base-ui v1.6.0 exposes `render` props on all interactive parts (Popup, Backdrop, Trigger, etc.) that let you substitute the rendered element — passing a `motion.div` instead of a plain `div`. For keep-mounted popups, the `render` prop's function form `(props, state) => <motion.div .../>` provides access to `state.open` for conditional animation.

---

## Components

### `<PopupMotion>` (new) — `src/components/ui/popup-motion.tsx`

A thin wrapper eliminating the repetitive boilerplate of `AnimatePresence` + `keepMounted` + `render` + `useReducedMotion()`.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | (required) | Controlled open state from the parent |
| `type` | `"scale" \| "slide" \| "fade"` | `"scale"` | Animation style |
| `side?` | `"top" \| "right" \| "bottom" \| "left"` | — | Required for `type="slide"` |
| `transition` | `"spring-panel" \| "ease-out"` | `"spring-panel"` | Select from `lib/ease.ts` tokens |
| `className?` | `string` | — | Passed through to the container div for AnimatePresence positioning |
| `children` | `ReactNode` | (required) | The popup content |

**Animation specs by type:**

| Type | Enter | Exit | Spring Config |
|------|-------|------|---------------|
| `scale` | `opacity 0→1, scale 0.95→1` | `opacity 0, scale 0.95` | `SPRING_PANEL` (stiffness 420, damping 40, mass 0.5) |
| `slide` | `opacity 0→1, translate offset→0` | `opacity 0, translate 0→offset` | `SPRING_PANEL` |
| `fade` | `opacity 0→1` | `opacity 0` | `EASE_OUT`, 200ms |

**Slide offsets per side:**
- `top`: `y: 40`
- `right`: `x: -40`
- `bottom`: `y: -40`
- `left`: `x: 40`

**`useReducedMotion()`:** When detected, all animations collapse to `opacity: 1` (skip scale/translate).

### Dialog changes (`src/components/ui/dialog.tsx`)

- **`DialogOverlay`**: Replace `data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0` with `render` prop → `<PopupMotion type="fade" open={open}>`. Controlled state via parent's `onOpenChange`.
- **`DialogContent` Popup**: Replace CSS animation classes with `render` prop → `<PopupMotion type="scale" open={open}>`.
- **Removed CSS classes**: `duration-100`, all `data-open:` / `data-closed:` animation utilities.

### Popover changes (`src/components/ui/popover.tsx`)

- **`PopoverContent` Popup**: Replace CSS animation + `slide-in-from-*` + `zoom-in-95` with `render` prop → `<PopupMotion type="scale" open={open}>`.
- Keep `origin-(--transform-origin)` behavior — pass `style={{ transformOrigin: 'var(--transform-origin)' }}` to `motion.div`.
- **Removed CSS**: `duration-100`, `data-open:animate-in`, `data-closed:animate-out`, `data-[side]:slide-in-from-*`.

### Sheet changes (`src/components/ui/sheet.tsx`)

- **`SheetOverlay`**: Replace CSS `transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0` with `render` prop → `<PopupMotion type="fade" open={open}>`.
- **`SheetContent` Popup**: Replace all `data-[side]:data-ending-style:translate-*` / `data-starting-style:translate-*` CSS with `render` prop → `<PopupMotion type="slide" side={side} open={open}>`.
- **Removed CSS classes**: `transition duration-200 ease-in-out`, `data-ending-style:opacity-0`, `data-starting-style:opacity-0`, all `data-[side]:data-ending-style:translate-*`.

### DropdownMenu changes (`src/components/ui/dropdown-menu.tsx`)

- Uses base-ui `Menu` which **keep-mounts** after first open — cannot use `AnimatePresence`.
- **`DropdownMenuContent` Popup**: Use `render` function form `(props, state) => <motion.div initial={false} animate={...} />` driven by `state.open`.
- **`DropdownMenuSubContent`**: Same pattern, wrapped via `DropdownMenuContent`.
- **Removed CSS**: `duration-100`, `data-open:animate-in`, `data-closed:animate-out`, `data-[side]:slide-in-from-*`.

### Tooltip changes (`src/components/ui/tooltip.tsx`)

- Tooltip base-ui uses a complex lifecycle (delayed open via `data-[state=delayed-open]`).
- **`TooltipContent` Popup**: Use `render` function form `(props, state) => <motion.div ... />` — animate on `state.open` changes.
- Use faster, lighter spring: `SPRING_PANEL` but with `duration: 0.15` for the quick tooltip feel.
- **Removed CSS**: `data-[state=delayed-open]:animate-in`, `data-open:animate-in`, `data-closed:animate-out`.

### Select changes (`src/components/ui/select.tsx`)

- Select has a hybrid lifecycle (unmounted first, keep-mounted after first interaction).
- **`SelectContent` Popup**: Use `render` function form `(props, state) => <motion.div ... />` to handle both phases.
- **Removed CSS**: `duration-100`, `data-open:animate-in`, `data-closed:animate-out`, `data-[side]:slide-in-from-*`, `data-align-trigger=true:animate-none`.

---

## Keep-Mounted Pattern

For components that stay in the DOM after first open (Menu/Select dropdowns, Tooltip):

```tsx
<Primitive.Popup
  render={(props, state) => (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      initial={false}
      animate={{
        opacity: state.open ? 1 : 0,
        scale: state.open ? 1 : 0.95,
      }}
      transition={SPRING_PANEL}
    />
  )}
/>
```

The flag `initial={false}` prevents re-animating on mount (since the element stays in the DOM).

## Entry/Exit (AnimatePresence) Pattern

For components that fully unmount (Dialog, Popover):

```tsx
const [open, setOpen] = React.useState(false);

<DialogPrimitive.Root open={open} onOpenChange={setOpen}>
  <DialogPrimitive.Portal keepMounted>
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Backdrop
          render={
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            />
          }
        />
      )}
    </AnimatePresence>
  </DialogPrimitive.Portal>
</DialogPrimitive.Root>
```

---

## Removed Dependencies

- `tw-animate-css` — still needed for: page-level `animate-in`/`animate-out` in `AnimatedRoutes.tsx`. The popup-specific uses are the only ones being removed.
- All `duration-*` and `data-open:`/`data-closed:` animation classes on the 6 migrated components become inert CSS (no longer control the animation).

---

## File Inventory

| File | Action |
|------|--------|
| `src/components/ui/popup-motion.tsx` | **CREATE** — utility wrapper |
| `src/components/ui/dialog.tsx` | MODIFY — Overlay + Popup render props |
| `src/components/ui/popover.tsx` | MODIFY — Popup render prop |
| `src/components/ui/sheet.tsx` | MODIFY — Overlay + Popup render props |
| `src/components/ui/dropdown-menu.tsx` | MODIFY — Content + SubContent render functions |
| `src/components/ui/tooltip.tsx` | MODIFY — Content render function |
| `src/components/ui/select.tsx` | MODIFY — Popup render function |
| `src/lib/ease.ts` | MODIFY — Add `SPRING_DRAWER` if needed |

---

## Testing

- Existing tests for `button`, `badge`, `card` in `ui/` — unchanged.
- No unit tests exist for dialog/popover/sheet/dropdown-menu/tooltip/select (these are thin style wrappers). The migration is visual-only — verified by:
  1. `npm run build -w client` (TypeScript + Vite)
  2. `npm run test:run -w client` (62 existing tests)
  3. Manual visual check of each popup type

---

## Animation Consistency

All popup animations now use the same physics from `lib/ease.ts`:

- `SPRING_PANEL` → Dialog, Popover, DropdownMenu, Select, Tooltip
- `EASE_OUT` (200ms) → Overlay fades (Dialog, Sheet)

This matches the motion language already established in `src/components/motion/`.
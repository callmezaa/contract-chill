# Base-UI Popup Motion Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace CSS `animate-in`/`animate-out` utilities on 6 base-ui popup wrappers with `motion/react` spring animations via the `render` prop pattern.

**Architecture:** All 6 components use the same pattern: base-ui `render` function `(props, state) => <motion.div animate={state.open ? ... : ...}/>` with spring configs from `lib/ease.ts`. Dialog/Sheet overlays keep CSS `animate-in` for simple fades.

**Tech Stack:** React 19, `@base-ui/react` v1.6.0, `motion/react` v12.42.2, TypeScript 6, Tailwind CSS v4.

## Global Constraints

- `motion/react` import path (NOT `framer-motion`)
- Spring configs from `lib/ease.ts`: `SPRING_PANEL` (stiffness 420, damping 40, mass 0.5) for content, `EASE_OUT` (`[0.16, 1, 0.3, 1]`) for overlays
- `data-slot` attributes preserved on all components
- `render` prop: function form `(props, state) => ReactElement` with TypeScript casting
- Existing tests must pass unchanged (75/75)

---

### Task 1: Migrate Dialog

**Files:**
- Modify: `client/src/components/ui/dialog.tsx`

**Files:**
- Modify: `client/src/components/ui/dialog.tsx`

- [ ] **Step 1: Add motion + SPRING_PANEL imports**

```tsx
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { SPRING_PANEL } from "@/lib/ease"
```

- [ ] **Step 2: Keep DialogOverlay CSS animation** (remove `duration-100` only)

```tsx
function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 3: Change DialogContent Popup** — replace CSS animations with `render` function

Remove from className: `duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`

New Popup with render function:

```tsx
<DialogPrimitive.Popup
  data-slot="dialog-content"
  className={cn(
    "fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none sm:max-w-sm",
    className
  )}
  render={(props, state) => (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: state.open ? 1 : 0, scale: state.open ? 1 : 0.95 }}
      transition={SPRING_PANEL}
    />
  )}
  {...props}
>
```

- [ ] **Step 4: Build + test**

Run: `npm run build -w client && npm run test:run -w client`
Expected: Build success, 62 tests pass

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ui/dialog.tsx
git commit -m "feat: migrate Dialog popup animation to motion spring"
```

---

### Task 2: Migrate Popover

**Files:**
- Modify: `client/src/components/ui/popover.tsx`

- [ ] **Step 1: Add imports**

```tsx
import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_PANEL } from "@/lib/ease"
```

- [ ] **Step 2: Change PopoverContent Popup**

Remove from className: `duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`

```tsx
<PopoverPrimitive.Popup
  data-slot="popover-content"
  className={cn(
    "z-50 flex w-72 origin-(--transform-origin) flex-col gap-2.5 rounded-lg bg-popover p-2.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden",
    className
  )}
  render={(props, state) => (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: state.open ? 1 : 0, scale: state.open ? 1 : 0.95 }}
      transition={SPRING_PANEL}
    />
  )}
  {...props}
/>
```

- [ ] **Step 3: Build + test**

Run: `npm run build -w client && npm run test:run -w client`
Expected: Success

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ui/popover.tsx
git commit -m "feat: migrate Popover popup animation to motion spring"
```

---

### Task 3: Migrate Sheet

**Files:**
- Modify: `client/src/components/ui/sheet.tsx`

- [ ] **Step 1: Add imports**

```tsx
"use client"
import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import { SPRING_PANEL } from "@/lib/ease"
```

- [ ] **Step 2: Change SheetOverlay** — replace CSS transition with standard animate-in

```tsx
function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/10 supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      {...props}
    )
  )
}
```

(Remove `transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0`)

- [ ] **Step 3: Change SheetContent Popup** — use render function with slide variants

Remove all: `transition duration-200 ease-in-out data-ending-style:opacity-0 data-starting-style:opacity-0 data-[side=bottom]:data-ending-style:translate-y-[2.5rem] data-[side=bottom]:data-starting-style:translate-y-[2.5rem] data-[side=left]:data-ending-style:translate-x-[-2.5rem] data-[side=left]:data-starting-style:translate-x-[-2.5rem] data-[side=right]:data-ending-style:translate-x-[2.5rem] data-[side=right]:data-starting-style:translate-x-[2.5rem] data-[side=top]:data-ending-style:translate-y-[-2.5rem] data-[side=top]:data-starting-style:translate-y-[-2.5rem]`

```tsx
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const slideOffsets: Record<string, Record<string, number>> = {
    top: { y: -80 },
    right: { x: 80 },
    bottom: { y: 80 },
    left: { x: -80 },
  };

  const hidden = slideOffsets[side];

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-popover bg-clip-padding text-sm text-popover-foreground shadow-lg data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        )}
        render={(props, state) => (
          <motion.div
            {...(props as React.ComponentProps<typeof motion.div>)}
            initial={{ opacity: 0, ...hidden }}
            animate={{
              opacity: state.open ? 1 : 0,
              x: state.open ? 0 : (hidden.x ?? 0),
              y: state.open ? 0 : (hidden.y ?? 0),
            }}
            transition={SPRING_PANEL}
          />
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close
            data-slot="sheet-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3"
                size="icon-sm"
              />
            }
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}
```

- [ ] **Step 4: Build + test**

Run: `npm run build -w client && npm run test:run -w client`
Expected: Success

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ui/sheet.tsx
git commit -m "feat: migrate Sheet popup animation to motion spring with per-side slide"
```

---

### Task 4: Migrate DropdownMenu

**Files:**
- Modify: `client/src/components/ui/dropdown-menu.tsx`

- [ ] **Step 1: Add imports**

```tsx
import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"
import { SPRING_PANEL } from "@/lib/ease"
```

- [ ] **Step 2: Change DropdownMenuContent Popup**

Remove from className: `duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:overflow-hidden data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`

```tsx
<MenuPrimitive.Popup
  data-slot="dropdown-menu-content"
  className={cn(
    "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
    className
  )}
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
  {...props}
/>
```

- [ ] **Step 3: Change DropdownMenuSubContent** — remove CSS animation classes

Remove from className: `duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`

(SubContent delegates to Content which has the render function, so just clean up className)

```tsx
<DropdownMenuContent
  data-slot="dropdown-menu-sub-content"
  className={cn(
    "w-auto min-w-[96px] rounded-lg bg-popover p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
    className
  )}
  align={align}
  alignOffset={alignOffset}
  side={side}
  sideOffset={sideOffset}
  {...props}
/>
```

- [ ] **Step 4: Build + test**

Run: `npm run build -w client && npm run test:run -w client`
Expected: Success

- [ ] **Step 5: Commit**

```bash
git add client/src/components/ui/dropdown-menu.tsx
git commit -m "feat: migrate DropdownMenu popup animation to motion spring"
```

---

### Task 5: Migrate Tooltip

**Files:**
- Modify: `client/src/components/ui/tooltip.tsx`

- [ ] **Step 1: Add imports**

```tsx
"use client"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { SPRING_PANEL } from "@/lib/ease"
```

- [ ] **Step 2: Change TooltipContent Popup**

Remove from className: `data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2`

```tsx
<TooltipPrimitive.Popup
  data-slot="tooltip-content"
  className={cn(
    "z-50 inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background has-data-[slot=kbd]:pr-1.5 **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm",
    className
  )}
  render={(props, state) => (
    <motion.div
      {...(props as React.ComponentProps<typeof motion.div>)}
      initial={false}
      animate={{
        opacity: state.open ? 1 : 0,
        scale: state.open ? 1 : 0.9,
      }}
      transition={{ ...SPRING_PANEL, duration: 0.15 }}
    />
  )}
  {...props}
>
```

- [ ] **Step 3: Build + test**

Run: `npm run build -w client && npm run test:run -w client`
Expected: Success

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ui/tooltip.tsx
git commit -m "feat: migrate Tooltip popup animation to motion spring"
```

---

### Task 6: Migrate Select

**Files:**
- Modify: `client/src/components/ui/select.tsx`

- [ ] **Step 1: Add imports**

```tsx
"use client"
import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"
import { SPRING_PANEL } from "@/lib/ease"
```

- [ ] **Step 2: Change SelectContent Popup**

Remove from className: `duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95`

```tsx
<SelectPrimitive.Popup
  data-slot="select-content"
  data-align-trigger={alignItemWithTrigger}
  className={cn(
    "relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
    className
  )}
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
  {...props}
>
```

- [ ] **Step 3: Build + test**

Run: `npm run build -w client && npm run test:run -w client`
Expected: Success

- [ ] **Step 4: Commit**

```bash
git add client/src/components/ui/select.tsx
git commit -m "feat: migrate Select popup animation to motion spring"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: shared → client (tsc -b + vite build) → server (tsc) — all success

- [ ] **Step 2: Full test suite**

Run: `npm run test:run`
Expected: 75 tests pass (62 client + 13 server)

- [ ] **Step 3: Visual check list**

- [ ] Dialog opens with scale + opacity spring
- [ ] Dialog overlay fades smoothly
- [ ] Popover opens with scale spring
- [ ] Sheet slides from each side with spring
- [ ] Sheet overlay fades smoothly
- [ ] DropdownMenu opens with scale spring
- [ ] DropdownMenu submenu opens correctly
- [ ] Tooltip appears with quick spring
- [ ] Select opens with scale spring
- [ ] All `duration-100`, `animate-in`, `animate-out` classes removed from 6 files

- [ ] **Step 4: Final commit**

```bash
git add client/src/components/ui/dialog.tsx client/src/components/ui/popover.tsx client/src/components/ui/sheet.tsx client/src/components/ui/dropdown-menu.tsx client/src/components/ui/tooltip.tsx client/src/components/ui/select.tsx
git commit -m "feat: migrate all base-ui popup components to motion spring animations"
```
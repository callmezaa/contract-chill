# Contract-Chill Design System

Version: 2.0
Design Philosophy: Apple Human Interface + Vercel + Linear

---

# 1. Vision

## Product Personality

Contract-Chill is an AI-powered legal assistant designed to simplify complex legal documents into clear, trustworthy, and actionable insights.

The interface should feel calm, premium, intelligent, and approachable.

Users should immediately trust the product before interacting with any AI feature.

Keywords

• Minimal
• Calm
• Premium
• Human
• Intelligent
• Fast
• Spacious
• Elegant

Never look like:

❌ Cyberpunk
❌ Futuristic neon
❌ Dashboard overload
❌ Glassmorphism everywhere
❌ Crypto UI
❌ Gaming interface

Instead:

Apple
Linear
Notion AI
Raycast
Arc Browser
Vercel Dashboard

---

# 2. Design Principles

## Clarity

Every element exists for a reason.

Remove unnecessary decoration.

Prefer whitespace over borders.

---

## Focus

Only one primary action per screen.

Every screen must answer:

"What should the user do next?"

---

## Calm

Animations never distract.

Motion communicates hierarchy.

Never show unnecessary loading.

---

## Precision

Spacing
Radius
Typography
Alignment

must always follow an 8pt system.

---

## Trust

Legal products require confidence.

Avoid playful UI.

Avoid exaggerated gradients.

Avoid colorful cards.

Everything should feel reliable.

---

# 3. Typography

Primary Font

Geist Sans

```css
--font-sans:
var(--font-geist-sans),
ui-sans-serif,
system-ui,
sans-serif;
Display Font
Same as body.
No decorative fonts.

Mono
--font-mono:
var(--font-geist-mono),
ui-monospace,
monospace;

Font Scale

Display XL

64px

Display Large

48px

Display

40px

Heading 1

32px

Heading 2

24px

Heading 3

20px

Title

18px

Body Large

16px

Body

15px

Caption

13px

Tiny

12px

Weights

400 Regular

500 Medium

600 Semibold

700 Bold

Avoid ExtraBold.

Line Height

130%
140%
150%

Letter Spacing

Default

No excessive tracking.

Only hero title:

-2%
```

# 4. Typography

Primary

#3B82F6

Primary Hover

#2563EB

Primary Active

#1D4ED8

Background

#FFFFFF

Secondary Background

#FAFAFA

Surface

#FFFFFF

Border

#E5E7EB

Divider

#F3F4F6

Text Primary

#111827

Text Secondary

#6B7280

Muted

#9CA3AF

Danger

#EF4444

Warning

#F59E0B

Success

#22C55E

Never use more than 2 accent colors.

``

# 5. Shadows

No dramatic shadows.

Cards

shadow-sm

Dialog

shadow-lg

Floating

shadow-xl

Opacity under 12%.

# 6. Border Radius

Buttons

12

Cards

16

Dialogs

20

Inputs

12

Floating Panel

20

# 7. Spacing

4

8

12

16

20

24

32

40

48

64

80

96

No arbitrary spacing.

# 8. Layout

Desktop

1440px max width

Content

1280px

Reading

720px

Dashboard

1320px

Grid

12 columns

Gap

24px

# 9. Components

Built using

✓ shadcn/ui

✓ BeUI

Never custom-build common components.

Button

Input

Dialog

Popover

Tooltip

Command

Drawer

Alert

Sheet

Dropdown

Navigation Menu

Context Menu

Scroll Area

Resizable

Table

Accordion

Tabs

Breadcrumb

Pagination

Skeleton

Toast

Avatar

Badge

Calendar

Date Picker

Combobox

Command Palette

# 10. Motion System

Animation Philosophy

Fast.

Subtle.

Physical.

Purposeful.

Never flashy.

Duration

100ms

Hover

150ms

Button

200ms

Modal

250ms

Page

350ms

Easing

ease-out

cubic-bezier(.22,1,.36,1)

Spring

Only for draggable components.

Hover

scale

1 → 1.02

Shadow

2%

Background

+4%

Cards

Translate

Y -4px

Duration

180ms

Buttons

Opacity

95%

Scale

98%

Dialog

Fade

Scale

95 →100

Blur

4px

Duration

250ms

Page Transition

Opacity

0→1

TranslateY

8px

Duration

350ms

Skeleton

Pulse

Opacity

Never shimmer.

Loading

Use spinner only if

600ms

Otherwise Skeleton.

# 11. Iconography

Lucide Icons

Stroke

1.75

Never use filled icons.

# 12. Illustration

Minimal

Monochrome

Simple

No cartoon.

# 13. AI Experience

AI output should appear progressively.

Use streaming text.

Do not instantly render large paragraphs.

Show:

Thinking...

Analyzing...

Finding Risks...

Generating Summary...

# 14. Accessibility

WCAG AA

Keyboard Navigation

Visible Focus Ring

ARIA labels

Screen Reader Support

Reduced Motion Support

# 15. Interaction Guidelines

Every clickable item

Hover

Focus

Pressed

Disabled

Loading

must have unique states.

# 16. Empty State

Friendly.

Minimal.

Action-oriented.

# 17. Error State

Explain

Why

How to fix

Next action

Never only

"Something went wrong"

# 18. Tone

Professional

Calm

Simple

Human

Never legal jargon.

Explain legal concepts like speaking to a founder.

# 19. Responsive

Desktop First

1440

↓

1280

↓

1024

↓

768

↓

390

# 20. Code Standards

Next.js App Router

TypeScript

Tailwind

shadcn/ui

BeUI

Framer Motion

Lucide

React Hook Form

Zod

TanStack Query

Class Variance Authority

Tailwind Merge

Never inline styles.

Never hardcoded colors.

Always use design tokens.

```

```

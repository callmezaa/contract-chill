# DESIGN.md — ContractChill visual system

World: **Neutral Minimal — "the precise instrument."** coss.com/ui as the primary component library (copy-paste sources in `client/src/components/coss/`). White canvas, near-black ink, zinc grays, alpha borders, crisp 1px hairlines, solid ink buttons. No gradients, no serif, no warm tints. Personality comes from weight (bold Inter), Geist Mono for data, and generous whitespace.

Mode: landing page = Persuade. App surfaces (Dashboard, Analyzer, etc.) remain Operate.

## Library

- **coss ui** (Base UI + Tailwind v4, shadcn-registry model). Sources vendored at `client/src/components/coss/`: `button`, `card`, `badge`, `accordion`, `separator`, `spinner`. Import path `@/components/coss/*`.
- App-wide legacy `components/motion/button` is reskinned to match (flat, `rounded-lg`, no backing plate/slab) — same API, coss look.
- `components/ui/*` (shadcn/Radix) still exists for app pages; tokens restyle them. Migrate to coss incrementally.

## Tokens (client/src/index.css) — coss colors-neutral

| Token | Light | Dark (port, low priority) |
|---|---|---|
| `--background` | `#FFFFFF` | `#0A0A0A` |
| `--foreground` / text | neutral-800 `#262626` / `#171717` | `#F5F5F5` |
| `--border` | black @ 8% | white @ 8% |
| `--surface-2` / `--muted` / `--accent` | black @ 4% | white @ 4% |
| `--primary` | neutral-800 `#262626` | `#F5F5F5` |
| `--brand` | ink `#262626` (accent = weight, not hue) | `#FAFAFA` |
| `--success/--warning/--danger/--info` | 500s + `-foreground` 700s (400s dark) | 500s + 400s foregrounds |
| `--radius` | `0.625rem` | same |

## Typography

- **Sans + heading: Inter Variable** (`@fontsource-variable/inter`). Display = Inter **bold (700)**, tracking `-0.025em` to `-0.03em`, `[text-wrap:balance]`. Body regular, `-0.011em`.
- **Mono: Geist Mono** — data only: file names, step numbers, stat values, URLs in mockups. Uppercase mono for stat labels.
- `--font-heading` aliases Inter (coss convention; `CardTitle` uses it).

## Layout language

- **Hero app-frame**: nav + hero live in one `rounded-3xl bg-card border` container floating on a gray canvas (`bg-secondary`). Left copy / right brand illustration (`HeroIllustration.tsx` — composed product-UI cards with idle float + pointer parallax, reduced-motion aware). Nav detaches into a fixed floating pill (`bg-background/85 backdrop-blur-xl rounded-2xl`) past the hero.
- Hairlines over boxes: stats `border-y + divide-x`, FAQ uses coss Accordion (`border-b` rows, `multiple={false}`).
- Cards: coss `Card` (`rounded-2xl border bg-card shadow-xs/5`), hover lift `-translate-y-0.5` + `shadow-xs`. Never heavier.
- Buttons: coss Button (solid ink default, outline, ghost, secondary; `rounded-lg`). Sizes `sm`–`xl`.
- Badges: coss Badge; semantic variants (`error`, `warning`, `success`, `secondary`, `outline`) only where meaning is real (persona tones, status).
- Alternating section tint = `bg-card` full-bleed bands on the gray canvas (stats/FAQ sit directly on canvas).
- Faux browser chrome: three ink dots @ 40%, mono URL in bordered pill.
- Motion: one authored load sequence (frame fade-scale-in, staggered copy, spring illustration), quiet whileInView fades elsewhere, reduced-motion respected. Press feedback `active:scale-[0.96]`.

## Copy

English-first. Product copy lives in `client/src/i18n/locales/en.json`. No marketing clichés; buttons name their action.

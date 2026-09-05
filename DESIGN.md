# DESIGN.md — ContractChill visual system

World: **Warm Editorial — "the calm legal desk."** The subject's world is paper documents, ink, and the highlighter marks an AI reviewer makes on a contract. Paper background, ink text, one warm ochre accent used like a highlighter. Everything else is quiet.

Mode: landing page = Persuade. App surfaces (Dashboard, Analyzer, etc.) remain Operate and may keep the neutral system.

## Tokens (client/src/index.css)

| Token | Light | Dark | Role |
|---|---|---|---|
| `--background` | `#FBFBFA` paper | `#131312` | Canvas |
| `--surface` | `#FFFFFF` | `#1C1C1A` | Cards |
| `--text` / `--primary` | `#1B1B18` ink | `#F0EFED` | Text, solid buttons |
| `--border` | `#E5E5E2` | `#333330` | Hairlines only |
| `--brand` | `#A16207` ochre | `#D9A441` amber | THE accent: icons, washes, badges, highlight marks |
| `--brand-wash` | ochre @ 18% | amber @ 16% | Highlighter background wash |
| `--danger / --warning / --success` | semantic | semantic | Risk states and persona tones only |

## Typography

- **Display: Fraunces Variable** (`@fontsource-variable/fraunces/opsz.css`, opsz+wght+italic). Headlines, section titles, feature/persona names, featured quote, brand wordmark. Weight 500 (`font-medium`), tracking `-0.02em`, never bolder. Italic for the rotating hero word and quotes.
- **Body/UI: Geist** — unchanged.
- **Mono: Geist Mono** — data and document meta only (file names in mockups, step numbers `01/02/03`, URLs in browser chrome). Never decorative labels.

## Layout language

- Hairlines over boxes: stats row is a `border-y + divide-x` band, FAQ is `divide-y`, no card containers.
- Cards (bento, personas, small testimonials): `rounded-xl` (12px), `1px border`, hover shadow max `0 2px 12px rgba(0,0,0,0.04)`. Never `rounded-2xl`+heavy shadow.
- Buttons on landing: solid ink or 1px outline, `rounded-lg`, no backing plate (`backing={false}`). Pills only for tiny chips.
- No eyebrows/kickers above headings; the heading carries the section. Section rhythm: group paper sections (hero + stats band) then surface sections.
- Hero signature: the key noun in the headline (i18n `landing.hero.heroTitle.highlight`) is italic Fraunces sitting on an amber **highlight wash** that sweeps in once on load (scaleX from left) — the product metaphor (AI highlights what matters). This is the one authored moment; everything else animates with the standard quiet fade-up.

## Bans adopted from project skills (minimalist-ui)

No gradients, no glass, no heavy shadows, no colored section backgrounds, no emoji, no display font below weight 500, mono only for data.

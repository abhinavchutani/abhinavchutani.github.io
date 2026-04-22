# Design System — Abhinav Chutani Portfolio

---

## Colour Palette

### Theme Tokens (CSS Custom Properties)

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--bg` | `#ffffff` | `#0d0d0d` | Page background |
| `--fg` | `#111111` | `#ededed` | Text, borders, icons |
| `--surf` | `#ffffff` | `#1c1c1c` | Surface / card background |
| `--surf-h` | `#f0f0f0` | `#2a2a2a` | Surface hover state |
| `--muted` | `rgba(17,17,17,0.38)` | `rgba(237,237,237,0.38)` | Subdued text, labels |
| `--dim` | `rgba(17,17,17,0.10)` | `rgba(237,237,237,0.10)` | Hairline fills, track backgrounds |
| `--row-bg` | `#ffffff` | `#0d0d0d` | Solid row background (domino stack) |
| `--accent` | `#f9b8c0` | `#f9b8c0` | Accent pink (unchanged across themes) |

### Accent / Brand Colour

| Name | Hex | Usage |
|---|---|---|
| Accent Pink | `#f9b8c0` | Logo button background, cursor aura, spotlight radial glow, blob-1, hero tags |

### Skill Row Hover Colours — Light Mode

Each skill row gets a distinct pastel hover colour, applied via `--hover-bg`.

| # | Colour | Hex |
|---|---|---|
| 1 | Rose | `#FDE8EE` |
| 2 | Mint | `#BBF7D0` |
| 3 | Lavender | `#DDD6FE` |
| 4 | Yellow | `#FEF08A` |
| 5 | Emerald | `#A7F3D0` |
| 6 | Sky | `#BFDBFE` |
| 7 | Salmon | `#FECACA` |
| 8 | Grey | `#F3F4F6` |
| 9 | Amber | `#FDE68A` |
| 10 | Mint | `#BBF7D0` |
| 11 | Pink | `#FBCFE8` |
| 12 | Amber | `#FDE68A` |
| 13 | Cream | `#FEF9C3` |
| 14 | Indigo | `#C7D2FE` |
| 15 | Peach | `#FFEDD5` |
| 16 | Cream | `#FEF9C3` |
| 17 | Ice Blue | `#E0F2FE` |
| 18 | Sage | `#ECFDF5` |
| 19 | Teal | `#F0FEFF` |

### Skill Row Hover Colours — Dark Mode

| # | Hex | # | Hex |
|---|---|---|---|
| 1 | `#3d1020` | 11 | `#340d22` |
| 2 | `#0a2e1a` | 12 | `#302200` |
| 3 | `#221650` | 13 | `#252300` |
| 4 | `#312800` | 14 | `#141a42` |
| 5 | `#0a2818` | 15 | `#281508` |
| 6 | `#0a1a34` | 16 | `#252300` |
| 7 | `#320808` | 17 | `#081a2a` |
| 8 | `#232323` | 18 | `#081c14` |
| 9 | `#302200` | 19 | `#081a22` |
| 10 | `#0a2e1a` | | |

### Special-Use Colours

| Value | Usage |
|---|---|
| `#111` (hardcoded) | Dark quote section background, logo button text, modal text |
| `rgba(0,0,0,0.38)` | Skill overlay dim layer |
| `rgba(249,184,192,0.26)` | Cursor aura gradient (light inner) |
| `rgba(249,184,192,0.35)` | Spotlight card hover radial — light mode |
| `rgba(249,184,192,0.14)` | Spotlight card hover radial — dark mode |
| `rgba(200,180,255,0.14)` | About hero blob-2 (purple) |
| `rgba(180,230,255,0.12)` | About hero blob-3 (ice blue) |
| `rgba(255,255,255,0.08)` | Dark quote decorative mark |
| `rgba(255,255,255,0.3)` | Dark quote sub-label |
| `#7cfc8a` | Laptop terminal text (green) |
| `rgba(124,252,138,0.4)` | Laptop terminal prompt (dimmed green) |
| `#ff5f57` | Laptop screen dot — close (macOS red) |
| `#febc2e` | Laptop screen dot — minimise (macOS yellow) |
| `#28c840` | Laptop screen dot — maximise (macOS green) |

---

## Typography

### Typefaces

| Family | Weights | Role |
|---|---|---|
| **Inter** | 100, 300, 400, 500, 700, 800, 900 | Primary — headings, UI, body |
| **Playfair Display** | 400, 900 (regular + italic) | Decorative — greeting words, typewriter |

Both loaded from Google Fonts. Inter is the system fallback (`system-ui, sans-serif`).

### Type Scale

| Element | Size | Weight | Tracking | Notes |
|---|---|---|---|---|
| Loader name | `clamp(36px, 7vw, 100px)` | 800 | `-0.04em` | Uppercase |
| Loader sub | `clamp(9px, 1.2vw, 16px)` | 500 | `0.35em` | Uppercase, 50% opacity |
| Greeting "Hello" | `clamp(64px, 12vw, 188px)` | 800 | `-0.05em` | |
| Greeting ghost | `clamp(80px, 19vw, 300px)` | 900 | `-0.06em` | 4.5% opacity |
| Skill row title | `clamp(36px, 8.2vw, 124px)` | 400 | `-0.024em` | Uppercase |
| Skill row badge | `clamp(9px, 0.85vw, 13px)` | 400 | — | Pill label |
| Modal title | `clamp(40px, 6vw, 96px)` | 800 | `-0.04em` | Uppercase |
| Modal body text | `clamp(14px, 1.1vw, 17px)` | 400 | — | Line height 1.7 |
| Modal eyebrow / labels | `9–10px` | 400 | `0.4em` | Uppercase |
| About hero name | `clamp(80px, 14vw, 210px)` | 800 | `-0.045em` | Uppercase, line-height 0.84 |
| About hero typewriter | `clamp(14px, 1.4vw, 22px)` | 400 | — | Playfair italic |
| Chapter heading | `clamp(56px, 9vw, 148px)` | 800 | `-0.04em` | Uppercase |
| Chapter detail | `clamp(15px, 1.3vw, 20px)` | 400 | — | Line height 1.7, muted |
| Chapter ghost | `clamp(120px, 22vw, 380px)` | 900 | `-0.06em` | 4% opacity |
| Stats number | `clamp(44px, 5.5vw, 90px)` | 800 | `-0.04em` | Tabular nums |
| Stats label | `10px` | 400 | `0.3em` | Uppercase, muted |
| Mastery title | `clamp(52px, 8vw, 120px)` | 800 | `-0.045em` | Uppercase |
| Mastery item name | `13px` | 400 | `0.14em` | Uppercase |
| Dark quote text | `clamp(28px, 4vw, 68px)` | 800 | `-0.035em` | Line height 1.08 |
| Works / Currently title | `clamp(52px, 9vw, 138px)` | 800 | `-0.045em` | Uppercase |
| Works item | `clamp(18px, 2.2vw, 32px)` | 400 | `-0.02em` | |
| Eyebrow labels | `10–11px` | 400–500 | `0.3–0.4em` | Uppercase, muted |
| Footer | `10px` | 400 | `0.07em` | |

### Text Rendering

```css
-webkit-font-smoothing: antialiased;
text-rendering: optimizeLegibility;
```

---

## Spacing & Layout

### Grid

- Max content width: `1200px` (hero), `1100px` (mastery, laptop section)
- Page padding (desktop): `28px` horizontal
- Page padding (hero): `48px` horizontal

### Key Spacing Values

| Context | Value |
|---|---|
| Header height | `60px` |
| Header padding | `14px 28px` |
| Domino row overlap | `28px` (negative margin + hover rise) |
| Row padding | `4px 26px` |
| Modal padding | `36px 40px` (header), `32px 40px` (columns) |
| Section padding (large) | `96px 28px` or `120px 28px` |
| Stats cell padding | `52px 36px` |
| Contact cell padding | `52px 32px` |

### Border Width

All borders are `1.5px solid var(--fg)` throughout. Exception: modal level bar track is `1px solid var(--dim)` (mastery items).

### Border Radius

| Element | Radius |
|---|---|
| Nav pills / badges | `100px` (full pill) |
| Logo button | `100px` |
| Close button | `50%` (circle) |
| Skill modal | `20px` |
| Hero tags | `100px` |
| Cursor ring | `50%` |
| Progress / level bars | `2–6px` |
| Laptop lid | `14px 14px 0 0` |
| Laptop screen bezel | `8px` |
| Laptop base | `0 0 8px 8px` |

---

## Component Inventory

### Global UI

| Component | Description |
|---|---|
| **Custom cursor** | 38px ring (`mix-blend-mode: difference`) + 5px dot. Expands to 64px on hoverable elements. Hidden on mobile (<680px). |
| **Cursor aura** | 860px radial gradient blob following cursor. Pink-tinted, very subtle (26% opacity max). |
| **Loader** | Full-screen, particle canvas background, name + subtitle + progress bar, morphs progress bar into nav border on exit. |
| **Theme toggle** | `☾` / `○` emoji button. Persisted in `localStorage`. Smooth 0.3s transition on `background` + `color`. |
| **Site header** | Fixed, `60px` tall, transparent on index / frosted glass on about. Fade-in after loader exits. |
| **Logo button** | Pill with accent pink background, bouncy hover (`scale(1.06) rotate(-1.5deg)`). Dark mode: surface background. |
| **Nav pills** | Transparent pill, `--surf-h` hover. |

### index.html Components

| Component | Description |
|---|---|
| **Greeting section** | `min-height: 34vh`, floating multi-language greeting words drifting randomly via CSS `translate` property + rAF loop. Ghost oversized word at 4.5% opacity. |
| **Skill rows (domino stack)** | 19 skills. `margin-bottom: -28px` overlap. Hover: `translateY(-28px)` rise + pastel bg. `::before` border at top ensures visibility. |
| **Badge pills** | Inline pill after title text. Positioned via `getBoundingClientRect()` on badge. |
| **Illustrations** | SVG, `height: 155%`, positioned just after badge right edge. Rise animation on hover, float while visible. |
| **Skill modal** | Full-screen overlay with two-layer backdrop (blur layer + dim layer, both fade via opacity). Modal card fades in linearly (`0.28s linear`). Two-column layout with mastery bar. |
| **Footer strip** | Single row, `10px` text, `1.5px` border. |

### about.html Components

| Component | Description |
|---|---|
| **Hero section** | Full-viewport, 3 CSS blur blobs drifting, particle canvas (35 nodes), clip-overflow name slide-up, typewriter tagline (Playfair italic), cascading tags. |
| **Stats bar** | 4-column grid, animated counter (`easeOutCubic`, triggered by IntersectionObserver). |
| **Sticky chapter scroll** | `600vh` container, 5 cross-fading panels, scroll-driven opacity + translateY. Vertical dot nav (right edge). |
| **Spotlight cards** | 3-column grid. `mousemove → --mx/--my → ::before radial-gradient` glow. |
| **3D CSS laptop** | `perspective: 1400px`. Lid `rotateX(-76deg → -4deg)` on scroll. Terminal text with staggered reveal. |
| **Mastery bars** | 12 items, 2-column grid. Width animates on IntersectionObserver. `1.1s cubic-bezier(0.34,1.3,0.64,1)`. |
| **Dark quote + wave** | Fixed `#111` background. 3 overlapping sine waves on canvas (rAF). Quote in white. |
| **Works list** | Scroll-reveal items. `--surf-h` hover. |
| **Contact grid** | 4-column (collapses to 2, then 1 on mobile). |
| **Scroll progress bar** | `2px` line at bottom of header, tracks `scrollY / scrollHeight`. |

---

## Animation & Motion

### Easing Reference

| Name | Value | Used for |
|---|---|---|
| Spring bounce | `cubic-bezier(0.34,1.3,0.64,1)` | Logo hover, modal close spin, loader name, mastery bars, counter |
| Smooth spring | `cubic-bezier(0.34,1.2,0.64,1)` | Scroll reveals, illustration rise, hero lines |
| Smooth spring (soft) | `cubic-bezier(0.34,1.1,0.64,1)` | Laptop lid open |
| Standard material | `cubic-bezier(0.4,0,0.2,1)` | Row hover transform, badge hover, loader progress |
| Cinematic wipe | `cubic-bezier(0.77,0,0.175,1)` | Loader bar morph |
| Linear | `linear` | Modal fade in/out, overlay fade |

### Duration Reference

| Animation | Duration |
|---|---|
| Loader name in | `0.9s` |
| Loader sub in | `0.6s` |
| Loader progress fill | `2s` |
| Loader bar morph | `0.75s` |
| Loader exit fade | `0.65s` |
| Header fade in | `0.5s` |
| Theme transition | `0.3s` |
| Row hover rise | `0.38s` |
| Illustration rise | `0.9s` |
| Illustration float | `3.6s infinite` |
| Illustration leave | `0.38s` |
| Modal fade | `0.28s linear` |
| Overlay blur fade | `0.48s ease` |
| Overlay dim fade | `0.42s ease` |
| Mastery bar fill | `1.1s` |
| Laptop lid open | `1.6s` |
| Blob drift 1 | `18s infinite` |
| Blob drift 2 | `22s infinite` |
| Blob drift 3 | `14s infinite` |
| Scroll reveal | `0.7s opacity + 0.8s transform` |
| Greeting float | rAF, velocity `±0.26–0.32px/frame`, bounces at `±28px` |

### Keyframe Animations

| Name | Description |
|---|---|
| `ltIn` | `translateY(24px) scale(0.97) → translateY(0) scale(1)` + fade |
| `lsIn` | `translateY(6px) → translateY(0)`, opacity `0 → 0.5` |
| `progressFill` | `0% → 68% → 90% → 100%` width |
| `illusRise` | `translateY(120%) opacity:0 → translateY(0) opacity:1` |
| `illusFloat` | `translateY(0) ↔ translateY(-9px)` loop |
| `illusLeave` | `opacity:1 → 0, translateY(0 → 90%)` |
| `orbDrift1/2/3` | Multi-point translate+scale drift for hero blobs |

---

## Effects & Special Techniques

### Domino Stacking
Rows use `margin-bottom: -28px`. Each row's `background: var(--row-bg)` is solid to cover the row above. Hover uses `translateY(-28px)` (no `z-index` change). Borders use `::before { top: 0 }` — later DOM rows paint their top border over the previous row's background.

### Two-Layer Backdrop Blur
Rather than animating `backdrop-filter` blur value (unreliable), two sibling divs are layered:
1. `#skill-overlay-blur` — always `blur(16px) saturate(1.2)`, fades `opacity: 0 → 1`
2. `#skill-overlay-dim` — `rgba(0,0,0,0.38)` tint, fades `opacity: 0 → 1`

Both transitions are compositor-only (opacity), guaranteeing 60fps.

### Cursor Mix-Blend Difference
The cursor ring uses `mix-blend-mode: difference`, causing it to invert whatever it passes over — white on dark backgrounds, dark on light backgrounds.

### Spotlight Cards
Each card tracks `mousemove`, setting `--mx` and `--my` CSS properties. The `::before` pseudo-element uses `radial-gradient(circle 280px at var(--mx) var(--my), ...)` for a light-follows-cursor effect.

### Floating Greeting Words
CSS `translate` property (CSS Transforms Level 2) is used — independent of `transform` — so it doesn't overwrite existing `rotate()` or `writing-mode` on words. Each word bounces within `±28px` bounds.

### Illustration Positioning
`getBoundingClientRect()` on the `.badge` element, subtracting `rowRect.left`, gives the badge's right edge relative to the row. `svg.style.left = anchRect.right - rowRect.left + 20 + 'px'`. Re-run at 0ms, 350ms, and 4600ms (after fonts load and loader exits).

### Canvas Effects
Three canvases used across pages:
- **Loader canvas**: particle network (nodes connected by lines within proximity threshold)
- **Hero canvas (about)**: 35-node particle network
- **Wave canvas (about)**: 3 overlapping sine waves, `rAF` loop

### CSS 3D Laptop
`perspective: 1400px` on scene. Wrapper has `rotateX(12deg)`. Lid uses `transform-origin: 50% 100%`, transitions from `rotateX(-76deg)` (closed) to `rotateX(-4deg)` (open) via IntersectionObserver.

---

## Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `≤ 1100px` | Row title font scales down, illustration height 130%, spotlight cards collapse to 1-column |
| `≤ 860px` | Stats bar → 2 columns, mastery grid → 1 column, contact grid → 2 columns, laptop shrinks |
| `≤ 680px` | Custom cursor hidden, header compresses, chapter ghost hidden, contact → 1 column, laptop shrinks further |

---

## File Structure

```
/
├── index.html      Main portfolio (skills / projects)
├── about.html      Scroll-storytelling about page
├── design.md       This file
├── package.json
└── package-lock.json
```

Both pages are self-contained single-file HTML with all CSS, JS, and content inline. Tailwind CSS is loaded via CDN (`https://cdn.tailwindcss.com`). Placeholder images use `https://placehold.co/`.

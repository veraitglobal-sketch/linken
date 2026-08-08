# Hansala design reference

Values read from the codebase. If one disagrees with the code, the code is
right and this file is stale — fix the file.

## Colour — `src/app/globals.css`

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0d1210` | Primary text |
| `--ink-soft` | `#3a423e` | Body copy on paper |
| `--muted` | `#66706b` | Captions, micro-labels |
| `--plus` | `#5f6964` | Lightest text still AA on paper/surface |
| `--line` | `#dde2df` | Hairlines, card borders |
| `--paper` | `#f0f2f0` | Page ground |
| `--mute` | `#e8ebe8` | Banded section ground |
| `--surface` | `#ffffff` | Cards on paper |
| `--navy` | `#0e1f1c` | Dark chapters, buttons |
| `--navy-deep` | `#081412` | Gradient ends |
| `--blue` | `#1a5c51` | Eyebrows on light, links, active |
| `--blue-soft` | `#7eb8a4` | **Mint.** Mark, one status dot, one accent |
| `--success` | `#1f7a56` | "Verified", confirmed facts |
| `--ember` | `#b8895a` | Confirmation-request eyebrow. Rare |

**Text on navy** has its own ramp — use it instead of `text-white/NN`:
`--on-navy` `#f2f5f3` · `--on-navy-soft` `#c5cdc8` · `--on-navy-muted` `#a8b2ad`.
Tailwind: `text-on-navy`, `text-on-navy-soft`, `text-on-navy-muted`.

No colour outside this list.

## Shape and elevation — use the scale, not literals

| Token | Value | Tailwind | Use |
|---|---|---|---|
| `--r-tile` | 20px | `rounded-tile` | Tiles, inner cards |
| `--r-card` | 24px | `rounded-card` | Cards |
| `--r-chapter` | 28px | `rounded-chapter` | Dark chapters |
| `--r-hero` | 32px | `rounded-hero` | Hero stages |
| `--elev-card` | `0 18px 48px rgba(8,20,18,.10)` | `shadow-card` | Cards |
| `--elev-chapter` | `0 28px 70px rgba(8,20,18,.18)` | `shadow-chapter` | Chapters |
| `--elev-hero` | `0 28px 90px rgba(8,20,18,.28)` | `shadow-hero` | Hero |

Pills stay `rounded-full`. Prefer these over `rounded-[28px]` — a lot of older
code still hardcodes pixels; new work should not add to it.

## Type

One family: **Plus Jakarta Sans** via `--font-ui`. `font-display` and
`font-sans` both resolve to it. No serif in Hansala's own chrome.

| Role | Size |
|---|---|
| Hero headline | `clamp(3.4rem, 8.5vw, 6.2rem)` |
| Section headline | `clamp(2rem, 3.8vw, 3rem)` — the common one |
| Compact section headline | `clamp(1.8rem, 3.1vw, 2.25rem)` |
| Sub-headline | `text-[17px]` semibold `tracking-[-0.03em]` |
| Body | `text-[15px] leading-relaxed` |
| Small body | `text-[13px]`–`text-[13.5px]` |
| Micro-label | `text-[11px] font-semibold tracking-[0.16em] uppercase` |

Headline tracking is tight (`-0.035em` to `-0.042em`); micro-labels are the
opposite (`+0.14em` to `+0.18em`). Figures use `tabular-nums`.

## Component inventory — reuse before building

This list exists because these have all been rebuilt by accident at least once.

### Marketing shell
| Component | Notes |
|---|---|
| `HomeSection` | `tone`: `default` \| `mute` \| `tight`. Override padding with `!py-*` |
| `HomeEyebrow` | Micro-label; `onDark` flips it to mint |
| `NetworkMark` | The mark. `animate={false}` when static |
| `TrustLedger` | Points plus the evidence behind them |
| `RotatingLogos` | One slot, crossfades a list. Currently unused |
| `HOME_SHOWCASE_LOGOS` | Real logos in `public/logos/showcase/` |

### Embeds — what a customer's page actually renders
| Component | Notes |
|---|---|
| `EmbedVerifiedLockup` | Seal + "Hansala / VERIFIED". `size`, `theme` |
| `EmbedVerified` | The lockup, linked to the profile |
| `EmbedProofRow` | Stacked partner tiles + overflow count |
| `EmbedBareLogo` | One logo, no tile. `scale`/`padding` for optical sizing |
| `EmbedTestimonialCard` | Quote mark, body, author, provenance, seal |
| `EmbedTestimonials` | Layout switch + theme shell |
| `EmbedResizeReporter` | Reports height to the host page |

Rendering these with props beats drawing a mock: the marketing page then shows
the same pixels the customer gets, and cannot drift or 404.

### Product surfaces worth mirroring in a screenshot
`network-map-canvas`, `network-company-node` (hub `w-164`, partner `w-150`,
`border-dashed` = pending), `graph-side-panel`, `workspace-nav-items`
(MAIN: Company, Map, Inbox — MORE: Case studies … Radar, locked),
`confirm-decision`, `partner-search-section`.

### Logic to call, never re-implement
`buildEmbedSnippet` / `buildEmbedSrc` / `widgetHeight`
(`features/widgets/embed-snippet.ts`) · `computeTrustScore`
(`features/trust/score.ts`) · `extractDomain` / `isPublicEmailProvider`
(`features/verification/domain.ts`) · `safe-fetch` for any outbound fetch of a
user-supplied URL.

## Trust levels

`Member → Established → Trusted → Pillar`. Earned, never bought. `Pillar`
needs ≥40 points **and** ≥3 ongoing references **and** ≥5 confirmed partners.

Never rename these to metals. Bronze/silver/gold read as purchasable and make
"new" look like "worst", which breaks *absence is not a negative finding*.

Testimonial weight: attached + domain-verified `1.0` · attached `0.5` ·
standalone + domain-verified `0.25` · free-provider author `0`.

## Widget catalog — real heights

| Variant | Height | Tier |
|---|---|---|
| `verified` | 44 | free |
| `footer-strip` | 48 | free |
| `micro` | 52 | free |
| `horizontal` | 56 | free |
| `case-stamp` | 72 | free |
| `credentials` | 76 | pro |
| `score` | 88 | pro |
| `starter`, `assessment` | 120 | pro |
| `trust-card` | 132 | pro |
| `references`, `signature` | 160 | pro |
| `partners-rotate` | 164 | pro |
| `case-gallery` | 340 | pro |
| `testimonials`, `logo-wall` | computed | pro |

Always take heights from `widgetHeight(variant)`, never as a literal.

## Testimonial layouts — fit rules

| Layout | Max chars | Count |
|---|---|---|
| `single` | 600 | 1 |
| `featured` | 500 | 1 |
| `editorial` | 420 | 1–6 |
| `carousel` | 400 | 1–12 |
| `masonry` | 380 | 1–12 |
| `grid` | 320 | 1–12 |
| `strip` | 180 | 1–12 |
| `marquee` | 140 | 2–12 |

Over-length quotes are **dropped, not truncated** — author text is immutable,
so the layout bends and never the words.

## Widget theming contract

Owner may set: preset (minimal, editorial, card, bordered, glass, dark), font
family/size/line-height, text/muted/accent colour, background, card
background, border colour and width, radius, shadow, spacing, align,
`maxColumns` (2–4, an upper bound only), custom CSS.

Never themeable: the mark, the provenance line, the verify link. `customCss`
is excluded from the public API payload (XSS).

Card variables: `--hs-tm-text`, `--hs-tm-muted`, `--hs-tm-accent`,
`--hs-tm-card-bg`, `--hs-tm-border`, `--hs-tm-border-w`, `--hs-tm-radius`,
`--hs-tm-spacing`, `--hs-tm-shadow`, `--hs-tm-max-cols`.

`match-site.ts` reads the customer's own homepage and derives font and colours
from it — prefer that over asking them to choose.

## Public API

`GET|POST /api/v1/verify?domain=` · `GET /api/v1/companies/{slug}` and
`/partners` `/testimonials` `/references` `/case-studies` ·
`GET /api/v1/openapi`.

Envelope everywhere:
`{"error":{"code":"not_found|invalid_request|internal","message":"…"}}`.
`found:false` returns **200** — absence is not an error.

## Photography

`public/images/` — `hero-network.jpg` (two people over one drawing),
`hero-partner*.jpg`, `story-collaboration*.jpg`, `story-partners.jpg`,
`story-team.jpg`, `story-projects.jpg`, `story-plans.jpg`,
`highlight-share.jpg`.

Real people, real work, desaturated, architectural, unposed. Never generate a
replacement.

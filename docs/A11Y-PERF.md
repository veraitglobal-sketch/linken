# Accessibility, mobile UX & performance

Target: **WCAG 2.2 AA**, Lighthouse Performance/a11y/BP/SEO **≥95** where realistic,
LCP **&lt;2.5s**, CLS **&lt;0.1**, INP **&lt;200ms** on representative mobile.

## Before (audit snapshot)

| Area | Finding |
|------|---------|
| Skip / landmarks | Marketing only; workspace & confirm lacked skip + `#main` |
| Dialogs | Widget configurator trapped focus; mobile menu / API key / graph detach did not |
| Forms | Project request placeholder-only labels; login errors not live regions |
| Contrast | `--plus` `#8a948e` ~2.8:1 on paper; chart ticks same |
| Motion | Smooth scroll + several animations ignored `prefers-reduced-motion` |
| Charts | Recharts with no text alternative; eager import on Insights |
| Perf | `getCompanyForPage` duplicated metadata + page; no request cache |
| CI | No workflow; Playwright present but unused for a11y |

## After (this pass)

### Accessibility
- Shared `SkipLink`, `useFocusTrap`, `StatusMessage`, `FormField`, focus utilities
- Skip + `<main id="main-content" tabIndex={-1}>` on marketing, workspace, confirm, admin
- Mobile workspace menu: `aria-modal`, labelled dialog, focus trap, Escape, restore focus, ≥44px targets
- Login: tabs with `aria-selected`, `autoComplete`, alert live region
- Onboarding / project request: labelled fields + status announcements
- API key + graph detach dialogs: modal + focus trap
- Global `:focus-visible`; case-file inputs keep visible focus ring
- `--plus` → `#5f6964`; chart axis / muted text aligned to AA
- Charts expose `role="img"` + summary; donut legend summary announced

### Performance
- `getCompanyForPage` wrapped in React `cache()` (dedupes metadata + page)
- Insights intertwined chart lazy-loaded (`dynamic`, `ssr: false`)
- Existing: `next/font` swap, xyflow lazy, image AVIF/WebP, package import opts

### Automation
- `npm run test:a11y:static` — foundation regressions
- `npm run test:a11y` — Playwright + axe-core WCAG 2.2 AA on major public routes
- `.github/workflows/ci.yml` — lint, unit/static tests, `tsc`, build, axe

## Remaining limitations

1. **Auth-gated routes** (dashboard, onboarding post-login, confirm tokens) need seeded sessions for axe — not in CI yet.
2. **Embed / widget iframes** inherit host CSS; limited control beyond reduced-motion and verify-line rules.
3. **Network map (xyflow)** remains a complex canvas — keyboard alternatives exist via Structure/partners, not full graph a11y parity.
4. **Raw `<img>`** remains on some logos/embeds where remote sizing is dynamic; prefer `next/image` when dimensions are known.
5. **Lighthouse numbers** are environment-dependent; CI asserts axe serious/critical = 0 (excluding global color-contrast), not Lighthouse scores.
6. **Dark marketing surfaces** still use some low-opacity whites outside the hero/footer; CI includes a footer contrast smoke test and continues replacing `text-white/NN` with solid AA greys (`#c5cdc8`, `#a8b2ad`).
7. **Header auth** still client-fetches session (cookie parity); loading announces via `aria-busy`.
8. **Mint accent** (`--blue-soft`) must not be the sole indicator of meaning.

## How to verify locally

```bash
npm run test:a11y:static
npm run build && npm run test:a11y
# Optional: Lighthouse against production or `npm run start`
```

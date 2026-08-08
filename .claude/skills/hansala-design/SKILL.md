---
name: hansala-design
description: Design and build Hansala UI — marketing sections, the workspace, and the embeddable widgets that render on customers' own sites. Use whenever the task touches a page, section, landing, layout, spacing, typography, visual polish, a product screenshot, a logo wall, or a widget. Carries the house rules, the traps that have already cost this project real time, and the measurement recipes that catch what the eye cannot.
---

# Hansala design

Enterprise B2B for a registry of confirmed work. Calm, precise, dependable.
Never playful SaaS. The product's claim is that a record means something —
the design either supports that or quietly undermines it.

`reference.md` in this folder holds the tokens, type scale, component
inventory, widget catalog and API shapes. Read it before writing values.

## Authority, in order

1. **`AGENTS.md`** — product law and design language. Wins every conflict.
2. **`src/app/globals.css`** — the only source of colour, radius, elevation.
3. **The running page, measured** — not eyeballed, not inferred from source.
4. `.cursor/rules/ui.mdc` and `docs/DESIGN_PROPOSALS.md` are **stale**: they
   describe a serif / Newsreader direction that never shipped. Ignore them on
   typography until someone reconciles them.

## Workflow

1. **Look at the running page.** Reading source is not enough. This is a rule
   in `AGENTS.md` and it has been proven repeatedly.
2. **Measure before diagnosing.** Every serious defect here was invisible by
   eye and obvious in numbers. Recipes at the bottom.
3. **Show a plan** for anything design-led: type scale, spacing scale, the
   light/dark rhythm against the neighbouring sections, and the one visual
   anchor that carries meaning.
4. **One section at a time.** Do not redesign a page in a single pass.
5. **Prefer extending what exists** to adding a parallel path. Check the
   component inventory first — nearly everything already exists.
6. **Verify at 1440 and 390**, then report what changed *in numbers*.

## Non-negotiable

- **Never invent a customer, quote, logo, number or testimonial.** Not in
  code, not in seed data, not in a mockup. When content does not exist,
  **change the design** — cut the element, use the empty state. Fabricating is
  never the lesser evil, and for a product whose whole claim is verified
  records it is self-defeating.
- **A marketing page must never depend on runtime data.** No iframe to a route
  that needs a database record; no fetch that can fail. If the record is
  missing, the homepage renders a 404 document mid-section. Feed the product's
  real components with props instead: same pixels, no network.
- **Public shows `confirmed` only.** Absence is `no_file`, never
  "not verified". Wording is factual, never judgemental — "Confirmed from a
  gmail.com address", not "unverified", and no warning icons.
- **Widgets carry no Hansala brand except the check mark.** No plan tier on a
  customer's site. The mark and the provenance line can never be hidden — not
  by a setting, not by custom CSS.
- **Author text is immutable.** Layout bends; the words never do.
- Mint `#7eb8a4` is the mark, one status dot, or one accent. Never a third
  thing in the same component.
- UI copy is English.

## Traps this project has already fallen into

**Typography that silently is not the brand font.** A self-referential custom
property (`--font-display: var(--font-display)`) is a CSS *cycle*: the
property resolves to nothing and everything falls back to `system-ui`. On
macOS that is SF Pro, close enough that nobody notices for months. Confirm
with `getComputedStyle`, never by looking.

**Unlayered CSS always beats `@layer base`.** A critical-CSS `<style>` in
`<head>`, meant as a fallback "if the stylesheet fails", is present on every
page and permanently overrides Tailwind. If it sets `font-family`, that *is*
the site's font. Such rules must reference the same variable as the real rule.

**Product screenshots have fixed arithmetic.** A scaled window's height is
`width × (designH / designW)`. You cannot have a large window, a whole window,
and a one-screen section at once. Pick two, say which two, give the numbers.

**A crop reads as a rendering bug** unless it lands exactly on the container's
edge. Cut mid-air with rounded corners above and a hard edge below, it looks
broken; the same cut at the card's bottom edge looks deliberate.

**Never cross-fade two opaque full screens** — at 50% both are visible at
once. Slide the incoming one over the outgoing one.

**Logo walls need optical, not geometric, sizing.** A square glyph and a wide
wordmark in the same box read at wildly different weights. `EmbedBareLogo`
takes `scale` and `padding` per logo for exactly this.

**Widget columns resolve from the container, never the viewport.** The widget
renders at unknown width on someone else's page, and the script path draws
into the host DOM where `sm:` tracks *their* viewport. Use
`repeat(auto-fit, minmax(min(100%, max(MIN, calc((100% - gaps) / n))), 1fr))`:
`n` caps the count, `MIN` degrades it as the container narrows.

**`setState` inside an effect** cascades renders and the linter rejects it.
Derive the value, or move the state into a child that unmounts between cycles.

**A hidden preview pane does not run rAF or IntersectionObserver.** When
`document.visibilityState === "hidden"` the page is never rendered, so
entry-triggered animations, lazy images and screenshots all silently do
nothing — and the code looks broken when it is fine. Check visibility before
diagnosing any animation. Layout measurement (`getBoundingClientRect`) still
works while hidden, so heights and padding stay trustworthy.

**Equal-height cards with unequal copy** leave one card a third empty. Pin a
footer row with `mt-auto` so the cards square off, or shorten the copy.

**A JSX comment before the root element breaks the build.** `return ( {/* … */}
<Section/> )` is two children, not one — the page 500s. Put design rationale in
a `//` comment above the `return`, or inside the root. This has cost this
project two build breaks.

**Numbers imply sequence.** Do not label parallel items `01–04` — a reader
looks for an order that is not there.

## Composition

Sections alternate light and dark; check the two neighbours before choosing.
Dark moments are rounded chapters on paper, not full-bleed bands — the hero
and the closing block set that shape.

Restraint without craft is an empty page. Every section still needs one anchor
that means something. Precision, hairlines, structure and negative space read
as expensive. Softness reads as consumer: no purple gradients, glow blobs,
cream-and-terracotta, emoji, pill clusters, or a blurred stock photo behind a
dark gradient.

Motion is a courtesy. Pause off-screen with `IntersectionObserver`, honour
`prefers-reduced-motion` by holding the end state, and never let a widget cost
a host page anything.

## Before calling it done

- Contrast: body copy uses `--muted` or darker; on navy use the `on-navy` ramp.
- Focus rings intact; tap targets ≥ 44px.
- 1440 and 390 both checked, and the numbers reported.
- No new colour, no new radius outside the scale.
- Nothing on screen that a real record did not produce.

## Measurement recipes

Run these in the browser. The preview pane in this environment frequently
returns blank screenshots — the DOM does not lie.

```js
// Is the page even being rendered? rAF and IO are dead when hidden.
({ visibility: document.visibilityState, hidden: document.hidden });

// Which font is actually rendering?
getComputedStyle(document.querySelector('h1')).fontFamily;
[...new Set([...document.fonts].map(f => f.family))];

// Where is the empty space?
const s = document.querySelector('section');
const cs = getComputedStyle(s);
({ h: s.getBoundingClientRect().height, pad: `${cs.paddingTop}/${cs.paddingBottom}` });

// Does the section fit one screen, allowing for the sticky header?
s.getBoundingClientRect().height + 60 - window.innerHeight;

// Is a scaled stage the size you think it is?
getComputedStyle(stage.firstElementChild).transform;

// Which rule is winning?
[...document.styleSheets].flatMap(sh => { try { return [...sh.cssRules]; } catch { return []; } })
  .filter(r => /font-family/.test(r.cssText || '')).map(r => r.cssText.slice(0, 160));
```

"It looks cramped" is not a finding. "224px of a 610px section is padding" is.

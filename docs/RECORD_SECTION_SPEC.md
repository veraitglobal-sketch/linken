# "The record" section — rebuild spec

Replaces the current `HomeOverview` / `OverviewRecord` (§2, "Public only after
the second yes"). Written from the Vercel/Notion composition the owner pointed
at, translated into Hansala's ground and content.

## The composition

Three planes at different depths, on **our light ground** — not Vercel's black.

1. **Back plane, left** — a large muted card, dimmed, partly covered. A badge
   floats at its top-left corner: the **Hansala Verified mark** (where Vercel
   puts the Notion "N"). This is the quiet layer.
2. **Front plane, centre** — a **live product window**, crisp, overlapping the
   back plane. This is the only sharp thing in the composition.
3. **Right column** — a short statement plus a labelled list, like Vercel's
   "Features" rail.

Where Vercel's third image sits, use **our own logo**.

## What plays inside the front window — three beats

The window is not a still. It runs the testimonial distribution story:

1. **The code.** The real embed / API snippet for testimonials. Presented as
   something you take — a copy affordance (⌘C or right-click → Copy).
2. **The paste.** The window becomes the place that code was dropped into —
   a host page / editor receiving it.
3. **The result.** The same testimonial, confirmed for the company, rendering
   on a website.

So: code → paste → live testimonial on a customer's site.

## Hard constraints

- **No invented testimonial text.** None exists yet. Until a real confirmed one
  does, beat 3 shows the widget shell and its provenance line, or the empty
  state — never a fabricated quote.
- **Real components, not drawings.** `EmbedTestimonialCard`,
  `EmbedVerifiedLockup`, `EmbedProofRow` fed with props. No iframe to
  `/embed/[slug]` — a marketing page must never depend on a database record.
- **The snippet must be real** — from `buildEmbedSnippet`, and the endpoint
  from `public-api/v1/types.ts` (`GET /api/v1/companies/{slug}/testimonials`).
- Ground stays as it is. Type scale: `text-chapter` for the headline.
- Mark and provenance line can never be hidden.

## Existing pieces to reuse

| Need | Component |
|---|---|
| Verified badge | `EmbedVerifiedLockup` |
| Testimonial card | `EmbedTestimonialCard` |
| Partner row | `EmbedProofRow` |
| Scaled app window | `FlowStage` (`product-flow-stage`) |
| Real snippet | `buildEmbedSnippet` |
| Reveal on scroll | `.reveal` / `.reveal-late` in `globals.css` |
| Blurred colour orb | `.orb`, `.orb-sm` |
| Corner falloff | `.stage-falloff` |

## The testimonial for beat 3

Supplied by the owner. **Reproduce verbatim — never edit, trim or tidy.** The
database enforces this (`lock_testimonial_author_fields`); the marketing page
must honour the same rule.

> vera quickly understood our vision for dienstemarkt.de and turned it into a
> professional, high-quality platform. The collaboration was smooth, reliable,
> and solution-focused from start to finish.

- **Author:** Jovica Mihajlovic
- **Role:** CEO
- **Subject:** the testimonial is *about* Vera, so it belongs to Vera IT's
  profile — the author writes from the client side (dienstemarkt.de).

### Before it ships — one thing to confirm

The homepage must not show a testimonial the API does not have. Check that this
record exists in the product with a real token and provenance line:

```
GET /api/v1/companies/verait/testimonials
```

If it returns it, render from that shape (`body`, `author_name`, `author_role`,
`author_company`, `source`, `provenance_line`, `published_at`) and the page and
the API agree. If it does not, create it through the normal author-token flow
first — not by writing it into the page.

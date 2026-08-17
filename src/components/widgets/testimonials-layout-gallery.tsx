"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  TESTIMONIAL_LAYOUTS,
  type TestimonialLayout,
} from "@/features/testimonials/settings";
import { LAYOUT_FIT } from "@/features/testimonials/theme/layout-fit";
import { TESTIMONIAL_LAYOUT_LABELS as LABELS } from "@/features/testimonials/testimonial-height";
import { saveTestimonialLayout } from "@/features/testimonials/testimonials-studio-actions";
import { testimonialHeight } from "@/features/testimonials/testimonial-height";
import { buildEmbedSnippet } from "@/features/widgets/embed-snippet";
import { cn } from "@/lib/cn";

/**
 * Grouped by the decision, ranked by what actually fits.
 *
 * Nine equal cards was our layout enum shown to a customer. Nobody chooses
 * between "grid" and "masonry" from two grey diagrams; what they are really
 * deciding is how much of their page this takes — a whole section, a thin band,
 * or one quote. So the shapes are grouped by that, and inside each group the
 * ones that would render more of their records come first. A layout that would
 * drop half their quotes should not sit in the same position as one that shows
 * them all.
 *
 * Copy sits on the selected card only. Nine copy buttons implied nine embeds
 * were needed; one at a time says the true thing — pick a shape, take its code,
 * and come back for another if a second placement wants a different one.
 *
 * This was nine text pills — "Wall", "Masonry", "Strip" — and the person with
 * forty testimonials, who has the most to gain from picking well, had the least
 * to go on. Each card now shows two things a word cannot: the shape, and how
 * many of *their own* records would actually render in it.
 *
 * The count is the honest part. Every layout drops quotes that exceed its
 * character cap rather than truncating them — the author's words are immutable,
 * so the layout bends. That means "Strip" can silently show three of nine, and
 * the only fair moment to say so is before they choose, not after.
 *
 * Schematics rather than nine live previews: nine iframes of real data to pick
 * one is a lot of network for a decision about shape, and the full preview
 * above already shows the chosen layout with their actual records.
 */

/** What the choice is actually about: how much of their page it occupies. */
const GROUPS: { title: string; note: string; layouts: TestimonialLayout[] }[] = [
  {
    title: "A whole section",
    note: "Many quotes at once",
    layouts: ["wall", "masonry", "grid", "editorial"],
  },
  {
    title: "A band",
    note: "Fits between other sections",
    layouts: ["strip", "marquee"],
  },
  {
    title: "One quote",
    note: "Beside your own copy",
    layouts: ["featured", "single", "carousel"],
  },
];

/* Anything not placed in a group above still gets shown. Without this, adding a
   tenth layout to `TESTIMONIAL_LAYOUTS` would silently drop it from the picker —
   it would exist, be selectable through the API, and be invisible here. */
function groupsWithRest() {
  const placed = new Set(GROUPS.flatMap((g) => g.layouts));
  const rest = TESTIMONIAL_LAYOUTS.filter((l) => !placed.has(l));
  return rest.length
    ? [...GROUPS, { title: "More shapes", note: "", layouts: rest }]
    : GROUPS;
}

type Props = {
  layout: TestimonialLayout;
  /** How many of the included records fit each layout's character cap. */
  fitCounts: Record<TestimonialLayout, number>;
  includedCount: number;
  siteUrl: string;
  slug: string;
  /** The testimonials embed is Pro; without it the shape is still selectable. */
  isPro: boolean;
};

export function TestimonialsLayoutGallery({
  layout,
  fitCounts,
  includedCount,
  siteUrl,
  slug,
  isPro,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState<TestimonialLayout | null>(null);

  /* Each shape carries its own snippet, so a wall on the homepage and a strip
     in the footer can run at once. Only the shape is in the URL — records,
     order and theme still come from settings, so neither snippet needs touching
     when a new testimonial publishes. */
  async function copySnippet(id: TestimonialLayout, fits: number) {
    await navigator.clipboard.writeText(
      buildEmbedSnippet({
        siteUrl,
        slug,
        variant: "testimonials",
        theme: "light",
        width: "100%",
        layout: id,
        height: testimonialHeight(id, fits),
      }),
    );
    setCopied(id);
    window.setTimeout(() => setCopied(null), 2000);
  }

  function pick(next: TestimonialLayout) {
    if (next === layout) return;
    startTransition(async () => {
      await saveTestimonialLayout(next);
      router.refresh();
    });
  }

  return (
    <div className={cn(pending && "pointer-events-none opacity-70")}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-plus uppercase">
        The shape on your site
      </p>
      <div className="mt-3 space-y-4">
        {groupsWithRest().map((group) => {
          /* Ranked inside the group: most of their records first. Ties keep the
             declared order, so the ranking never shuffles on every render. */
          const ordered = [...group.layouts].sort(
            (a, b) => (fitCounts[b] ?? 0) - (fitCounts[a] ?? 0),
          );
          return (
            <div key={group.title}>
              <p className="text-[11.5px] font-semibold text-ink">
                {group.title}
                {group.note ? (
                  <span className="font-normal text-muted"> · {group.note}</span>
                ) : null}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {ordered.map((id) => {
                  const rule = LAYOUT_FIT[id];
                  const fits = fitCounts[id] ?? 0;
                  const shown = Math.min(fits, rule.maxCount);
                  const short = shown < includedCount;
                  const active = layout === id;

                  return (
                    <div
                      key={id}
                      className={cn(
                        "flex flex-col rounded-xl border p-3 transition-colors",
                        active
                          ? "border-ink bg-paper"
                          : "border-line bg-surface hover:border-ink/30",
                      )}
                    >
                      {/* Two actions rather than one nested in the other — a
                          button inside a button is invalid, and the copy would
                          swallow the click that selects. */}
                      <button
                        type="button"
                        onClick={() => pick(id)}
                        aria-pressed={active}
                        className="rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      >
                        <LayoutGlyph layout={id} active={active} />
                        <p className="mt-2.5 text-[12px] font-semibold text-ink">
                          {LABELS[id]}
                        </p>
                        {/* Stated only when it costs them something. "all 9 fit"
                            on eight of nine cards is noise; "3 of 9" is the
                            whole reason to look. */}
                        {short ? (
                          <p className="mt-0.5 text-[11px] leading-snug text-ember">
                            {shown} of {includedCount} fit · {rule.label}
                          </p>
                        ) : (
                          <p className="mt-0.5 text-[11px] leading-snug text-muted">
                            {rule.label}
                          </p>
                        )}
                      </button>
                      {active && isPro ? (
                        <button
                          type="button"
                          onClick={() => copySnippet(id, shown)}
                          className="mt-2 h-8 rounded-full bg-navy text-[10.5px] font-semibold text-on-navy transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        >
                          {copied === id ? "Copied" : "Copy code"}
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Abstract arrangement, drawn in boxes — the shape, not a thumbnail. */
function LayoutGlyph({
  layout,
  active,
}: {
  layout: TestimonialLayout;
  active: boolean;
}) {
  const bar = cn("rounded-[2px]", active ? "bg-ink/70" : "bg-ink/20");

  const shapes: Record<TestimonialLayout, React.ReactNode> = {
    single: <div className={cn(bar, "h-full w-full")} />,
    featured: (
      <div className="flex h-full w-full flex-col gap-1">
        <div className={cn(bar, "flex-1")} />
        <div className={cn(bar, "h-1.5 w-1/2")} />
      </div>
    ),
    editorial: (
      <div className="flex h-full w-full flex-col gap-1">
        <div className={cn(bar, "h-1/2")} />
        <div className="flex flex-1 gap-1">
          <div className={cn(bar, "flex-1")} />
          <div className={cn(bar, "flex-1")} />
        </div>
      </div>
    ),
    strip: (
      <div className="flex h-full w-full flex-col justify-between">
        {[0, 1, 2].map((i) => (
          <div key={i} className={cn(bar, "h-1.5 w-full")} />
        ))}
      </div>
    ),
    grid: (
      <div className="grid h-full w-full grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={bar} />
        ))}
      </div>
    ),
    masonry: (
      <div className="flex h-full w-full gap-1">
        <div className="flex flex-1 flex-col gap-1">
          <div className={cn(bar, "flex-[2]")} />
          <div className={cn(bar, "flex-[1]")} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <div className={cn(bar, "flex-[1]")} />
          <div className={cn(bar, "flex-[2]")} />
        </div>
      </div>
    ),
    carousel: (
      <div className="flex h-full w-full flex-col gap-1">
        <div className={cn(bar, "flex-1")} />
        <div className="flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <span key={i} className={cn(bar, "h-1 w-1 rounded-full")} />
          ))}
        </div>
      </div>
    ),
    marquee: (
      <div className="flex h-full w-full items-center gap-1 overflow-hidden">
        <div className={cn(bar, "h-2/3 w-1/3 shrink-0")} />
        <div className={cn(bar, "h-2/3 w-1/3 shrink-0")} />
        <div className={cn(bar, "h-2/3 w-1/3 shrink-0 opacity-50")} />
      </div>
    ),
    /* Two columns, clipped top and bottom — the layout's whole point is that
       there is more than fits, so the glyph shows partial bars at both edges. */
    wall: (
      <div className="flex h-full w-full gap-1 overflow-hidden">
        {[0, 1].map((c) => (
          <div key={c} className="flex flex-1 flex-col gap-1">
            <div className={cn(bar, c === 0 ? "h-1" : "h-2 opacity-60")} />
            <div className={cn(bar, "flex-1")} />
            <div className={cn(bar, c === 0 ? "h-2 opacity-60" : "h-1")} />
          </div>
        ))}
      </div>
    ),
  };

  return <div className="h-12 w-full">{shapes[layout]}</div>;
}

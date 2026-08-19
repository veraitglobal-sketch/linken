"use client";

import Link from "next/link";
import { useState } from "react";
import { CodeBlock } from "@/components/developers/code-block";
import { LazyEmbedPreview } from "@/components/widgets/lazy-embed-preview";
import { PreviewStage } from "@/components/widgets/preview-stage";
import { useWidgetStudio } from "@/components/widgets/use-widget-studio";
import type { WidgetDefinition } from "@/features/widgets/catalog";
import { trackEmbedCreated } from "@/features/product-analytics/embed-actions";
import { cn } from "@/lib/cn";

/**
 * The widget, then the code that puts it there — on the page where the words
 * are arranged, not behind a link to a different one.
 *
 * The testimonials page used to send people to `/dashboard/widgets` for the
 * snippet, which meant leaving the list they were in the middle of ordering.
 * Nothing here is new machinery: `useWidgetStudio` is the same hook the modal
 * configurator uses, so the snippet, the height and the preview source cannot
 * drift from what the gallery hands out.
 *
 * The ground defaults to the checkerboard. This embed lands on somebody else's
 * page, and the two checks nobody performs unless the interface performs them
 * are what it looks like on a dark ground and whether it is painting a white
 * rectangle behind itself.
 */

/**
 * What sits behind the widget while they judge it.
 *
 * `null` is the checkerboard `PreviewStage` already draws, and it is the default
 * on purpose: the embed paints nothing behind the cards, and the only way to be
 * sure of that is to see a ground it cannot hide. A white stage looks identical
 * whether the widget is transparent or painting white, which is exactly the
 * mistake that reaches a customer's page.
 */
const GROUNDS: { label: string; color: string | null; title: string }[] = [
  { label: "Transparent", color: null, title: "Checkerboard — shows through wherever the embed paints nothing" },
  { label: "White", color: "#ffffff", title: "A light host page" },
  { label: "Dark", color: "#081412", title: "A dark host page" },
];

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  isPro: boolean;
  /** A verified website domain, needed for the per-company frame-ancestors. */
  domainReady: boolean;
  /** The shape being previewed — not necessarily the saved one. */
  layout: string;
  /** False while previewing a shape they have not applied to their site yet. */
  isSaved: boolean;
};

export function TestimonialsEmbedPanel({
  widget,
  siteUrl,
  slug,
  isPro,
  domainReady,
  layout,
  isSaved,
}: Props) {
  const studio = useWidgetStudio(widget, siteUrl, slug, layout);
  const [copied, setCopied] = useState(false);
  const proLocked = Boolean(widget.pro && !isPro);

  async function copy() {
    if (proLocked) return;
    await navigator.clipboard.writeText(studio.snippet);
    void trackEmbedCreated(widget.id);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-plus uppercase">
            On your website
          </p>
          <p className="mt-1 text-[13px] text-ink-soft">
            {isSaved
              ? "Your own records, at the size they render on your site."
              : "Previewing a shape you have not applied yet — the snippet below is for this one."}
          </p>
        </div>
        {/* Two different questions, kept apart because conflating them is how
            people ship a widget that looks right in the dashboard and wrong on
            their site: the theme is what the widget itself is, the ground is
            what happens to be behind it. */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => studio.setTheme(t)}
                aria-pressed={studio.theme === t}
                className={cn(
                  "h-8 rounded-full px-3 text-[11px] font-semibold capitalize transition-colors",
                  studio.theme === t
                    ? "bg-navy text-on-navy"
                    : "text-muted hover:text-ink",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-line p-0.5">
            {GROUNDS.map((g) => (
              <button
                key={g.label}
                type="button"
                onClick={() => studio.setStageBg(g.color)}
                aria-pressed={studio.stageBg === g.color}
                title={g.title}
                className={cn(
                  "h-8 rounded-full px-3 text-[11px] font-semibold transition-colors",
                  studio.stageBg === g.color
                    ? "bg-navy text-on-navy"
                    : "text-muted hover:text-ink",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <PreviewStage color={studio.stageBg} className="!p-5">
        <LazyEmbedPreview
          src={studio.previewSrc}
          height={studio.height}
          title={`${widget.name} preview`}
        />
      </PreviewStage>

      <div className="border-t border-line px-5 py-4">
        {proLocked ? (
          /* Never a tier badge on the embed itself — but in their own dashboard
             it is fair to say why the snippet is withheld. The preview above
             stays live either way: seeing it is not the thing being sold. */
          <div className="rounded-xl border border-line bg-paper/60 px-4 py-5 text-center">
            <p className="font-display text-[15px] font-medium tracking-[-0.02em] text-ink">
              This embed is on Pro
            </p>
            <p className="mx-auto mt-1 max-w-sm text-[12.5px] leading-relaxed text-muted">
              The preview above is your real data. Upgrade to copy the snippet
              for your site.
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-3 inline-flex h-9 items-center rounded-full bg-navy px-4 text-[11px] font-semibold text-on-navy"
            >
              See plans
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-plus uppercase">
                Paste once
              </p>
              <button
                type="button"
                onClick={copy}
                className="inline-flex h-9 items-center rounded-full bg-navy px-4 text-[11px] font-semibold text-on-navy transition-opacity hover:opacity-90"
              >
                {copied ? "Copied" : "Copy snippet"}
              </button>
            </div>
            <CodeBlock tokens={studio.tokens} />
            {/* The mistake this prevents is not hypothetical: a light snippet
                pasted on a dark site renders the badge chrome as white at 50%,
                which reads as a plain white plate rather than glass. Nothing
                anywhere told the person which theme they had just copied. */}
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              This is the{" "}
              <span className="font-semibold text-ink">{studio.theme}</span>{" "}
              snippet.{" "}
              {studio.theme === "light"
                ? "If your page background is dark, switch to Dark above and copy again — otherwise the widget lands as a pale panel on it."
                : "If your page background is light, switch to Light above and copy again."}
            </p>
            {!domainReady ? (
              /* Stated as a fact about setup, not as a warning about them. */
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Add and verify your website domain so the embed is allowed to
                frame on it.{" "}
                <Link
                  href="/dashboard/verification"
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Verify domain
                </Link>
              </p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}

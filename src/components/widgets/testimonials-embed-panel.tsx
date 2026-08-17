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
 * The dark stage is deliberate and is the only dark thing on the page. This
 * embed lands on somebody else's site, and the one check nobody performs unless
 * the interface performs it for them is what it looks like on a dark ground.
 */

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  isPro: boolean;
  /** A verified website domain, needed for the per-company frame-ancestors. */
  domainReady: boolean;
};

export function TestimonialsEmbedPanel({
  widget,
  siteUrl,
  slug,
  isPro,
  domainReady,
}: Props) {
  const studio = useWidgetStudio(widget, siteUrl, slug);
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
            Live preview of your own records. Reorder below and this updates —
            the snippet never changes.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-line p-0.5">
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
      </header>

      <PreviewStage
        color={studio.theme === "dark" ? "#081412" : null}
        className="!p-5"
      >
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

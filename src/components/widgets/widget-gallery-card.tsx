"use client";

import Link from "next/link";
import { LazyEmbedPreview } from "@/components/widgets/lazy-embed-preview";
import { CHECKERBOARD_STYLE } from "@/components/widgets/preview-stage";
import { WidgetZeroState } from "@/components/widgets/widget-zero-state";
import { Badge } from "@/components/ui/badge";
import {
  buildEmbedSrc,
  type WidgetDefinition,
} from "@/features/widgets/catalog";
import { cn } from "@/lib/cn";

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  available: boolean;
  /** Plan has logo-wall entitlement (pro/founding). */
  isPro: boolean;
  onConfigure: () => void;
};

export function WidgetGalleryCard({
  widget,
  siteUrl,
  slug,
  available,
  isPro,
  onConfigure,
}: Props) {
  const previewSrc = buildEmbedSrc({
    siteUrl,
    slug,
    variant: widget.id,
    theme: "light",
    preview: true,
  });

  const showProWatermark = Boolean(widget.pro && !isPro && available);
  /** Logo wall can open empty so owners can invite firms. */
  const canOpen = available || widget.id === "logo-wall";

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-[28px] border border-line bg-white",
        !available && widget.id !== "logo-wall" && "opacity-90",
      )}
    >
      <div
        className="relative border-b border-line px-4 py-4"
        style={CHECKERBOARD_STYLE}
      >
        {available ? (
          <LazyEmbedPreview
            src={previewSrc}
            height={widget.height}
            title={`${widget.name} preview`}
            scale={widget.id === "references" ? 0.92 : 1}
            className="rounded-2xl border border-line bg-white/80"
          />
        ) : (
          <WidgetZeroState
            variant={widget.id}
            height={widget.height}
            className="bg-white/90"
          />
        )}
        {showProWatermark ? (
          <div className="pointer-events-none absolute inset-x-4 inset-y-4 flex items-end justify-end rounded-2xl bg-gradient-to-t from-[#0a1714]/35 to-transparent p-3">
            <span className="rounded-md border border-white/30 bg-[#0a1714]/75 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-white uppercase">
              Pro preview
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col px-5 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            {widget.name}
          </h3>
          {widget.recommended ? (
            <Badge tone="success">Recommended</Badge>
          ) : null}
          {widget.pro ? <Badge tone="accent">PRO</Badge> : null}
          {!available ? <Badge tone="neutral">Not available yet</Badge> : null}
        </div>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#64748b]">
          {widget.description}
        </p>
        {widget.requirementHint ? (
          <p className="mt-2 text-[12px] text-[#94a3b8]">
            {widget.requirementHint}
          </p>
        ) : null}
        {!available ? (
          <p className="mt-2 text-[12px] text-[#92400e]">
            Not available yet —{" "}
            <Link
              href={widget.unavailableCtaHref ?? `/c/${slug}`}
              className="font-semibold underline underline-offset-2"
            >
              {widget.unavailableCtaLabel ?? "confirm your first partnership"}
            </Link>
          </p>
        ) : null}
        <button
          type="button"
          onClick={onConfigure}
          disabled={!canOpen}
          className={cn(
            "mt-4 h-10 rounded-xl text-[13px] font-semibold transition-colors",
            canOpen
              ? "bg-[#10231f] text-white hover:bg-[#0a1714]"
              : "cursor-not-allowed bg-[#eef1f6] text-[#94a3b8]",
          )}
        >
          {canOpen ? "Configure" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}

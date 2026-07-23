"use client";

import Link from "next/link";
import { LazyEmbedPreview } from "@/components/widgets/lazy-embed-preview";
import { WidgetZeroState } from "@/components/widgets/widget-zero-state";
import { Badge } from "@/components/ui/badge";
import {
  buildEmbedSrc,
  type WidgetDefinition,
} from "@/features/widgets/catalog";
import { cn } from "@/lib/cn";

const PREVIEW_H = 124;

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  available: boolean;
  isPro: boolean;
  index?: number;
  onConfigure: () => void;
};

export function WidgetGalleryCard({
  widget,
  siteUrl,
  slug,
  available,
  isPro,
  index = 0,
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
  const canConfigure = available || widget.id === "logo-wall";
  const ctaHref = widget.unavailableCtaHref ?? `/c/${slug}`;
  const ctaLabel = widget.unavailableCtaLabel ?? "Set up";

  return (
    <article
      className={cn(
        "linken-widget-enter group flex h-full flex-col overflow-hidden",
        "rounded-2xl bg-surface ring-1 ring-black/[0.05]",
        "shadow-[0_1px_0_rgba(8,20,18,0.03)]",
        "transition-[box-shadow,transform] duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(8,20,18,0.09)]",
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="relative flex h-[124px] shrink-0 items-center justify-center border-b border-line bg-[linear-gradient(180deg,#f5f6f5_0%,#eef0ee_100%)] px-5">
        {available ? (
          <div className="w-full overflow-hidden rounded-lg">
            <LazyEmbedPreview
              src={previewSrc}
              height={Math.min(widget.height, PREVIEW_H - 20)}
              title={`${widget.name} preview`}
              scale={widget.id === "references" ? 0.8 : 1}
              className="w-full bg-transparent"
              eager={
                widget.id === "verified" ||
                widget.id === "compact" ||
                widget.id === "badge" ||
                widget.id === "logo-wall"
              }
            />
          </div>
        ) : (
          <WidgetZeroState variant={widget.id} />
        )}
        {showProWatermark ? (
          <span className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-navy/85 px-2 py-0.5 text-[10px] font-semibold tracking-[0.06em] text-white uppercase">
            Pro
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            {widget.name}
          </h3>
          {widget.recommended ? (
            <Badge tone="success">Recommended</Badge>
          ) : null}
          {widget.pro ? <Badge tone="accent">PRO</Badge> : null}
        </div>
        <p className="mt-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] leading-relaxed text-muted">
          {widget.description}
        </p>

        <div className="mt-auto pt-4">
          {canConfigure ? (
            <button
              type="button"
              onClick={onConfigure}
              className="h-10 w-full rounded-xl bg-navy text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              Configure
            </button>
          ) : (
            <Link
              href={ctaHref}
              className="flex h-10 w-full items-center justify-center rounded-xl border border-line text-[13px] font-semibold text-ink transition-colors hover:bg-paper"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

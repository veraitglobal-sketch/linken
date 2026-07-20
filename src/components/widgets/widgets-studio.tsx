"use client";

import { useMemo, useState } from "react";
import { WidgetConfigurator } from "@/components/widgets/widget-configurator";
import { WidgetGalleryCard } from "@/components/widgets/widget-gallery-card";
import {
  WIDGET_CATALOG,
  type WidgetDefinition,
  type WidgetVariant,
} from "@/features/widgets/catalog";
import type {
  LogoWallEntry,
  LogoWallPendingInvite,
} from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Availability = Record<WidgetVariant, boolean>;

type Props = {
  siteUrl: string;
  slug: string;
  availability: Availability;
  isPro: boolean;
  logoWallConfirmed: LogoWallEntry[];
  logoWallPending: LogoWallPendingInvite[];
  logoWallExcludedIds: string[];
};

export function WidgetsStudio({
  siteUrl,
  slug,
  availability,
  isPro,
  logoWallConfirmed,
  logoWallPending,
  logoWallExcludedIds,
}: Props) {
  const [active, setActive] = useState<WidgetDefinition | null>(null);
  const status = useMemo(
    () => WIDGET_CATALOG.filter((w) => w.section === "status"),
    [],
  );
  const evidence = useMemo(
    () => WIDGET_CATALOG.filter((w) => w.section === "evidence"),
    [],
  );

  return (
    <>
      <Section
        title="Status"
        meta={`${status.filter((w) => availability[w.id]).length} of ${status.length} ready`}
        items={status}
        columns="two"
        availability={availability}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
        onConfigure={setActive}
      />
      <Section
        title="Evidence"
        meta={`${evidence.filter((w) => availability[w.id]).length} of ${evidence.length} ready`}
        items={evidence}
        columns="three"
        className="mt-10"
        availability={availability}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
        onConfigure={setActive}
        indexOffset={status.length}
      />

      {active ? (
        <WidgetConfigurator
          widget={active}
          siteUrl={siteUrl}
          slug={slug}
          isPro={isPro}
          onClose={() => setActive(null)}
          logoWallConfirmed={logoWallConfirmed}
          logoWallPending={logoWallPending}
          logoWallExcludedIds={logoWallExcludedIds}
        />
      ) : null}
    </>
  );
}

function Section({
  title,
  meta,
  items,
  columns,
  className,
  availability,
  siteUrl,
  slug,
  isPro,
  onConfigure,
  indexOffset = 0,
}: {
  title: string;
  meta: string;
  items: WidgetDefinition[];
  columns: "two" | "three";
  className?: string;
  availability: Availability;
  siteUrl: string;
  slug: string;
  isPro: boolean;
  onConfigure: (w: WidgetDefinition) => void;
  indexOffset?: number;
}) {
  return (
    <section className={className}>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <p className="text-[12px] font-medium text-plus">{meta}</p>
      </header>
      <div
        className={cn(
          "grid items-stretch gap-4",
          columns === "two" && "sm:grid-cols-2",
          columns === "three" && "sm:grid-cols-2 xl:grid-cols-3",
        )}
      >
        {items.map((widget, i) => (
          <WidgetGalleryCard
            key={widget.id}
            widget={widget}
            siteUrl={siteUrl}
            slug={slug}
            available={availability[widget.id]}
            isPro={isPro}
            index={indexOffset + i}
            onConfigure={() => onConfigure(widget)}
          />
        ))}
      </div>
    </section>
  );
}

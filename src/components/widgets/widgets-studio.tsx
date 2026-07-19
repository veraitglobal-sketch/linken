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
      <Section title="Show your status" items={status} />
      <Section title="Show your evidence" items={evidence} className="mt-8" />

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

  function Section({
    title,
    items,
    className,
  }: {
    title: string;
    items: WidgetDefinition[];
    className?: string;
  }) {
    return (
      <section className={className}>
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
          {title}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {items.map((widget) => (
            <WidgetGalleryCard
              key={widget.id}
              widget={widget}
              siteUrl={siteUrl}
              slug={slug}
              available={availability[widget.id]}
              isPro={isPro}
              onConfigure={() => setActive(widget)}
            />
          ))}
        </div>
      </section>
    );
  }
}

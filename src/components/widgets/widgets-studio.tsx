"use client";

import { useMemo, useState } from "react";
import { WidgetConfigurator } from "@/components/widgets/widget-configurator";
import { WidgetGalleryCard } from "@/components/widgets/widget-gallery-card";
import {
  WIDGET_CATALOG,
  type WidgetDefinition,
  type WidgetVariant,
} from "@/features/widgets/catalog";
import { cn } from "@/lib/cn";

type Availability = Record<WidgetVariant, boolean>;

type Props = {
  siteUrl: string;
  slug: string;
  availability: Availability;
  isPro: boolean;
  /** Verified domain present — badge can frame on the company site. */
  domainReady: boolean;
};

export function WidgetsStudio({
  siteUrl,
  slug,
  availability,
  isPro,
  domainReady,
}: Props) {
  const [active, setActive] = useState<WidgetDefinition | null>(null);
  const essential = useMemo(
    () =>
      WIDGET_CATALOG.filter(
        (w) => w.section === "essential" && !w.caseScoped,
      ),
    [],
  );
  const proof = useMemo(
    () =>
      WIDGET_CATALOG.filter((w) => w.section === "proof" && !w.caseScoped),
    [],
  );
  const signature = useMemo(
    () =>
      WIDGET_CATALOG.filter(
        (w) => w.section === "signature" && !w.caseScoped,
      ),
    [],
  );

  return (
    <>
      <Section
        title="Essential"
        meta={`${essential.filter((w) => availability[w.id]).length} of ${essential.length} ready`}
        items={essential}
        columns="three"
        availability={availability}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
        onConfigure={setActive}
      />
      <Section
        title="Proof"
        meta={`${proof.filter((w) => availability[w.id]).length} of ${proof.length} ready`}
        items={proof}
        columns="three"
        className="mt-10"
        availability={availability}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
        onConfigure={setActive}
        indexOffset={essential.length}
      />
      <Section
        title="Signature"
        meta={`${signature.filter((w) => availability[w.id]).length} of ${signature.length} ready`}
        items={signature}
        columns="two"
        className="mt-10"
        availability={availability}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
        onConfigure={setActive}
        indexOffset={essential.length + proof.length}
      />

      {active ? (
        <WidgetConfigurator
          widget={active}
          siteUrl={siteUrl}
          slug={slug}
          isPro={isPro}
          domainReady={domainReady}
          onClose={() => setActive(null)}
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

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
  domainReady: boolean;
};

const SECTIONS: {
  id: WidgetDefinition["section"];
  title: string;
  blurb: string;
  columns: "two" | "three";
}[] = [
  {
    id: "placement",
    title: "Where it lives",
    blurb: "Pick by spot on your site — footer, partners, or cases.",
    columns: "three",
  },
  {
    id: "essential",
    title: "Essential",
    blurb: "Logo-free trust bars.",
    columns: "three",
  },
  {
    id: "proof",
    title: "Proof",
    blurb: "Scores, references, and the curated logo wall.",
    columns: "three",
  },
  {
    id: "signature",
    title: "Signature",
    blurb: "Centered seals for about pages.",
    columns: "two",
  },
];

export function WidgetsStudio({
  siteUrl,
  slug,
  availability,
  isPro,
  domainReady,
}: Props) {
  const [active, setActive] = useState<WidgetDefinition | null>(null);
  const sections = useMemo(() => {
    const map = new Map<WidgetDefinition["section"], WidgetDefinition[]>();
    for (const w of WIDGET_CATALOG) {
      if (w.caseScoped) continue;
      const list = map.get(w.section) ?? [];
      list.push(w);
      map.set(w.section, list);
    }
    const filled = SECTIONS.map((section) => ({
      ...section,
      items: map.get(section.id) ?? [],
    })).filter((s) => s.items.length > 0);

    return filled.map((section, i) => ({
      ...section,
      indexOffset: filled
        .slice(0, i)
        .reduce((n, s) => n + s.items.length, 0),
    }));
  }, []);

  return (
    <>
      {sections.map((section) => {
        const ready = section.items.filter((w) => availability[w.id]).length;
        return (
          <Section
            key={section.id}
            title={section.title}
            blurb={section.blurb}
            meta={`${ready} of ${section.items.length} ready`}
            items={section.items}
            columns={section.columns}
            className={section.id === "placement" ? undefined : "mt-10"}
            availability={availability}
            siteUrl={siteUrl}
            slug={slug}
            isPro={isPro}
            onConfigure={setActive}
            indexOffset={section.indexOffset}
          />
        );
      })}

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
  blurb,
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
  blurb: string;
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
        <div>
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-[12px] text-muted">{blurb}</p>
        </div>
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

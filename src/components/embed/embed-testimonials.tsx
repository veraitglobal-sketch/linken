import { EmbedPlacementRail } from "@/components/embed/embed-placement-rail";
import { EmbedResizeReporter } from "@/components/embed/embed-resize-reporter";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedTestimonialThemeShell } from "@/components/embed/embed-testimonial-theme-shell";
import { EmbedTestimonialsMotion } from "@/components/embed/embed-testimonials-motion";
import { EmbedTestimonialsWall } from "@/components/embed/embed-testimonials-wall";
import { embedMutedClass, type EmbedTheme } from "@/components/embed/embed-theme";
import type { TestimonialLayout } from "@/features/testimonials/settings";
import {
  translucentTypeFor,
  type TestimonialThemeTokens,
} from "@/features/testimonials/theme/presets";
import { filterForLayout } from "@/features/testimonials/theme/layout-fit";
import type { PublicTestimonial } from "@/features/testimonials/types";
import { cn } from "@/lib/cn";

type Props = {
  items: PublicTestimonial[];
  layout: TestimonialLayout;
  theme: TestimonialThemeTokens;
  themeParam?: EmbedTheme;
  profileUrl: string;
  companyName: string;
};

/**
 * Columns resolve from the container, never the viewport.
 *
 * `maxColumns` is an upper bound: the `max(MIN, (100% - gaps) / n)` term makes a
 * column at least as wide as one nth of the row, so auto-fit can never place
 * more than n — and MIN forces fewer as the container narrows. Viewport
 * breakpoints would lie the moment the widget sits in a narrow host column on a
 * wide screen, or renders inline instead of in an iframe.
 */
const COL_MIN = 240;
const COL_GAP = 12;

function autoColumns(max: number) {
  const gaps = `${(max - 1) * COL_GAP}px`;
  return {
    display: "grid",
    gap: `${COL_GAP}px`,
    gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, max(${COL_MIN}px, calc((100% - ${gaps}) / ${max}))), 1fr))`,
  };
}

function autoMasonry(max: number) {
  // `columns: <width> <count>` is the same contract in one declaration.
  return { columns: `${COL_MIN}px ${max}`, gap: `${COL_GAP}px` };
}

export function EmbedTestimonials({
  items,
  layout,
  theme,
  themeParam = "light",
  profileUrl,
  companyName,
}: Props) {
  const fitting = filterForLayout(items, layout);

  /* `glass` is the one preset whose fill is deliberately neutral so it can sit
     on any host ground — which means its type cannot also be fixed. Measured on
     a mid tone it gave 4.04:1 on the body and 1.10:1 on the provenance, so the
     evidence line was invisible on exactly the backgrounds the preset exists
     for. The fill still adapts by itself; the light/dark param decides the ink.
     Every other preset states its own ground and keeps its own colours. */
  const resolvedTheme =
    theme.preset === "glass"
      ? { ...theme, ...translucentTypeFor(themeParam === "dark") }
      : theme;

  if (!fitting.length) {
    return (
      <p className={cn("px-1 py-6 text-center text-[12px]", embedMutedClass(themeParam))}>
        No testimonials fit this layout — try another layout or shorter quotes.
      </p>
    );
  }

  return (
    <EmbedTestimonialThemeShell theme={resolvedTheme}>
      <div className="box-border w-full px-0.5 py-1">
        <EmbedResizeReporter />
        {/* The wall brings its own header — the "Hansala / Verified" lockup and
            the section label — so the rail would be a second row saying the same
            thing above it. */}
        {layout !== "wall" ? (
          <EmbedPlacementRail
            label="Client testimonials"
            href={profileUrl}
            linkLabel={companyName}
            theme={themeParam}
          />
        ) : null}
        <div className={layout === "wall" ? undefined : "mt-2"}>
          {renderLayout(fitting, layout, profileUrl, theme.maxColumns, themeParam)}
        </div>
      </div>
    </EmbedTestimonialThemeShell>
  );
}

function renderLayout(
  items: PublicTestimonial[],
  layout: TestimonialLayout,
  profileUrl: string,
  maxColumns: number,
  themeParam: EmbedTheme,
) {
  if (layout === "single" || layout === "featured") {
    return (
      <EmbedTestimonialCard item={items[0]!} profileUrl={profileUrl} featured />
    );
  }

  if (layout === "carousel" || layout === "marquee") {
    return (
      <EmbedTestimonialsMotion
        items={items}
        profileUrl={profileUrl}
        mode={layout}
      />
    );
  }

  if (layout === "wall") {
    return (
      <EmbedTestimonialsWall
        items={items}
        profileUrl={profileUrl}
        maxColumns={maxColumns}
        themeParam={themeParam}
      />
    );
  }

  if (layout === "strip") {
    return (
      <ul className="divide-y" style={{ borderColor: "var(--hs-tm-border)" }}>
        {items.map((item) => (
          <li key={item.id}>
            <EmbedTestimonialCard item={item} profileUrl={profileUrl} compact />
          </li>
        ))}
      </ul>
    );
  }

  if (layout === "editorial") {
    const [lead, ...rest] = items;
    return (
      <div className="space-y-3">
        <EmbedTestimonialCard item={lead!} profileUrl={profileUrl} featured />
        {rest.length ? (
          <ul style={autoColumns(maxColumns)}>
            {rest.map((item) => (
              <li key={item.id}>
                <EmbedTestimonialCard item={item} profileUrl={profileUrl} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  const gridStyle =
    layout === "masonry"
      ? autoMasonry(maxColumns)
      : autoColumns(maxColumns);

  return (
    <ul style={gridStyle}>
      {items.map((item) => (
        <li key={item.id} className={layout === "masonry" ? "mb-3 break-inside-avoid" : ""}>
          <EmbedTestimonialCard item={item} profileUrl={profileUrl} />
        </li>
      ))}
    </ul>
  );
}

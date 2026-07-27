import { EmbedPlacementRail } from "@/components/embed/embed-placement-rail";
import { EmbedResizeReporter } from "@/components/embed/embed-resize-reporter";
import { EmbedTestimonialCard } from "@/components/embed/embed-testimonial-card";
import { EmbedTestimonialThemeShell } from "@/components/embed/embed-testimonial-theme-shell";
import { EmbedTestimonialsMotion } from "@/components/embed/embed-testimonials-motion";
import { embedMutedClass, type EmbedTheme } from "@/components/embed/embed-theme";
import type { TestimonialLayout } from "@/features/testimonials/settings";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
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

export function EmbedTestimonials({
  items,
  layout,
  theme,
  themeParam = "light",
  profileUrl,
  companyName,
}: Props) {
  const fitting = filterForLayout(items, layout);

  if (!fitting.length) {
    return (
      <p className={cn("px-1 py-6 text-center text-[12px]", embedMutedClass(themeParam))}>
        No testimonials fit this layout — try another layout or shorter quotes.
      </p>
    );
  }

  return (
    <EmbedTestimonialThemeShell theme={theme}>
      <div className="box-border w-full px-0.5 py-1">
        <EmbedResizeReporter />
        <EmbedPlacementRail
          label="Client testimonials"
          href={profileUrl}
          linkLabel={companyName}
          theme={themeParam}
        />
        <div className="mt-2">{renderLayout(fitting, layout, profileUrl)}</div>
      </div>
    </EmbedTestimonialThemeShell>
  );
}

function renderLayout(
  items: PublicTestimonial[],
  layout: TestimonialLayout,
  profileUrl: string,
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
          <ul className="grid gap-2 sm:grid-cols-2">
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

  const gridClass =
    layout === "masonry"
      ? "columns-1 gap-3 sm:columns-2"
      : "grid gap-3 sm:grid-cols-2";

  return (
    <ul className={gridClass}>
      {items.map((item) => (
        <li key={item.id} className={layout === "masonry" ? "mb-3 break-inside-avoid" : ""}>
          <EmbedTestimonialCard item={item} profileUrl={profileUrl} />
        </li>
      ))}
    </ul>
  );
}

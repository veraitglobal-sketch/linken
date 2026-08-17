"use client";

import { useState } from "react";
import { TestimonialsEmbedPanel } from "@/components/widgets/testimonials-embed-panel";
import { TestimonialsLayoutGallery } from "@/components/widgets/testimonials-layout-gallery";
import type { TestimonialLayout } from "@/features/testimonials/settings";
import type { WidgetDefinition } from "@/features/widgets/catalog";

/**
 * The preview and the shape picker, joined.
 *
 * They were apart — preview at the top of the page, picker buried in the studio
 * below — and the picker only wrote the choice to settings. The preview iframe's
 * URL never changed, so the browser had no reason to reload it and clicking a
 * shape appeared to do nothing at all. A schematic told you the arrangement and
 * nothing told you how it actually looked.
 *
 * Now the click is a preview first and a saved default second: the iframe src
 * carries the layout, so picking one loads it immediately with their own
 * records, at the size it will really be. Cause and effect sit next to each
 * other, which is what the page was missing.
 */

type Props = {
  widget: WidgetDefinition;
  siteUrl: string;
  slug: string;
  isPro: boolean;
  domainReady: boolean;
  savedLayout: TestimonialLayout;
  fitCounts: Record<TestimonialLayout, number>;
  includedCount: number;
};

export function TestimonialsWorkbench({
  widget,
  siteUrl,
  slug,
  isPro,
  domainReady,
  savedLayout,
  fitCounts,
  includedCount,
}: Props) {
  /* Starts at what is live on their site, so the first thing shown is the truth
     rather than a shape they never chose. */
  const [preview, setPreview] = useState<TestimonialLayout>(savedLayout);

  return (
    <div className="space-y-3">
      <TestimonialsEmbedPanel
        widget={widget}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
        domainReady={domainReady}
        layout={preview}
        isSaved={preview === savedLayout}
      />
      <TestimonialsLayoutGallery
        layout={preview}
        savedLayout={savedLayout}
        onPreview={setPreview}
        fitCounts={fitCounts}
        includedCount={includedCount}
        siteUrl={siteUrl}
        slug={slug}
        isPro={isPro}
      />
    </div>
  );
}

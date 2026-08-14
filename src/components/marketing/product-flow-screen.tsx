import type { ReactNode } from "react";

/**
 * Retell-style product screen: dark stage frame → white UI → caption below.
 * Hansala tokens only (navy / mint), never purple.
 */
export function ProductFlowScreen({
  caption,
  children,
}: {
  caption: string;
  children: ReactNode;
}) {
  return (
    <figure className="m-0">
      <div className="mark-stage relative overflow-hidden rounded-chapter p-4 shadow-chapter sm:rounded-hero sm:p-10 lg:p-12">
        {/* Retell's stages are image plates (bg-secondary-2.webp), not CSS
            gradients — that is what gives the screenshot somewhere to sit.
            Generated in navy/mint, never purple. `.mark-stage` stays beneath
            as the fallback colour and keeps the shadow. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/images/screen-plate.webp')] bg-cover bg-center"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 stage-grain opacity-35"
          aria-hidden
        />
        <div className="relative overflow-hidden rounded-card bg-surface shadow-hero ring-1 ring-black/[0.04]">
          {children}
        </div>
      </div>
      <figcaption className="mt-4 px-0.5 font-display text-[16px] leading-snug font-medium tracking-[-0.025em] text-ink sm:mt-5 sm:text-[17px]">
        {caption}
      </figcaption>
    </figure>
  );
}

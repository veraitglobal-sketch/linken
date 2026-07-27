import type { ReactNode } from "react";
import type { TestimonialThemeTokens } from "@/features/testimonials/theme/presets";
import { resolveTestimonialTheme } from "@/features/testimonials/theme/resolve";

const ATTRIBUTION_GUARD = `
.hs-tm-attribution,
.hs-tm-attribution * {
  display: revert !important;
  visibility: visible !important;
  opacity: 1 !important;
  max-height: none !important;
  height: auto !important;
  width: auto !important;
  max-width: none !important;
  overflow: visible !important;
  clip: auto !important;
  position: static !important;
}
`;

type Props = {
  theme: TestimonialThemeTokens;
  children: ReactNode;
};

/** Applies testimonial tokens, optional Google Font, custom CSS, attribution guard. */
export function EmbedTestimonialThemeShell({ theme, children }: Props) {
  const resolved = resolveTestimonialTheme(theme);

  return (
    <div className="hs-tm-root w-full" style={resolved.style}>
      {resolved.googleFontHref ? (
        // eslint-disable-next-line @next/next/no-css-tags
        <link rel="stylesheet" href={resolved.googleFontHref} />
      ) : null}
      {resolved.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: resolved.customCss }} />
      ) : null}
      <style>{ATTRIBUTION_GUARD}</style>
      {children}
    </div>
  );
}

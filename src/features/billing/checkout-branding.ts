/** Hansala look for Stripe-hosted Checkout (left rail + chrome). */
export const CHECKOUT_BRANDING = {
  background_color: "#0e1f1c",
  button_color: "#1a5c51",
  border_style: "rounded" as const,
  display_name: "Hansala",
  font_family: "source_sans_pro" as const,
  /**
   * The mark, not a photograph.
   *
   * This pointed at `/images/highlight-share.jpg` — a 1600×1066 marketing shot
   * of a man on a street. Stripe crops the icon to a circle, so paying
   * customers were greeted by an arbitrary crop of a stranger's face where the
   * logo belongs.
   *
   * `hansala-icon-512.png` is the favicon glyph rendered square and full-bleed:
   * white ground, dark mark, 512×512, well inside Stripe's limits (square, at
   * least 128px, under 512KB). Full-bleed rather than the favicon's rounded
   * rectangle because the circular crop discards the corners anyway, and a
   * rounded square inside a circle leaves four pale slivers.
   *
   * Absolute and pinned to production on purpose: Stripe fetches this URL from
   * its own servers, so a relative path or a localhost origin cannot resolve.
   * It follows that the file has to be deployed before this takes effect.
   */
  icon: {
    type: "url" as const,
    url: "https://www.hansala.com/logos/hansala-icon-512.png",
  },
};

export const CHECKOUT_CUSTOM_TEXT = {
  submit: {
    message:
      "Premium embeds, analytics, Agent API, and team seats unlock right after payment.",
  },
};

/** Hansala look for Stripe-hosted Checkout (left rail + chrome). */
export const CHECKOUT_BRANDING = {
  background_color: "#0e1f1c",
  button_color: "#1a5c51",
  border_style: "rounded" as const,
  display_name: "Hansala",
  font_family: "source_sans_pro" as const,
  icon: {
    type: "url" as const,
    url: "https://www.hansala.com/images/highlight-share.jpg",
  },
};

export const CHECKOUT_CUSTOM_TEXT = {
  submit: {
    message:
      "Premium embeds, analytics, Agent API, and team seats unlock right after payment.",
  },
};

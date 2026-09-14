export type OfferId = "six" | "year";

export type OfferSku = {
  id: OfferId;
  name: string;
  priceLabel: string;
  cadence: string;
  effective: string;
  compare: string;
  cta: string;
  recommended?: boolean;
};

/** USD intro SKUs — same Pro entitlements as monthly EUR Pro. */
export const OFFER_SKUS: OfferSku[] = [
  {
    id: "six",
    name: "Six months",
    priceLabel: "$99",
    cadence: "Billed every 6 months in USD",
    effective: "$16.50 / month equivalent",
    compare: "Standard Pro is €79 / month.",
    cta: "Buy six months",
  },
  {
    id: "year",
    name: "One year",
    priceLabel: "$149",
    cadence: "Billed once a year in USD",
    effective: "$12.42 / month equivalent",
    compare: "Standard Pro is €79 / month.",
    cta: "Buy one year",
    recommended: true,
  },
];

export function parseOfferId(raw: string): OfferId | null {
  return raw === "six" || raw === "year" ? raw : null;
}

export const OFFER_FAQ = [
  {
    q: "What currency is this offer?",
    a: "US dollars. Stripe Checkout charges USD. Standard monthly Pro on the pricing page is billed in EUR.",
  },
  {
    q: "Does the subscription renew?",
    a: "Yes. Six months renews at $99 every six months. One year renews at $149 each year, until you cancel.",
  },
  {
    q: "Is this the same Pro?",
    a: "Yes — testimonials widget, logo widgets, analytics, Agent API, and team seats. The Verified mark is never sold.",
  },
  {
    q: "How do I cancel?",
    a: "Company owners cancel from Workspace → Billing. Pro continues until the paid period ends.",
  },
] as const;

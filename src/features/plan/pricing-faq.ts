import {
  ANNUAL_BILLING_AVAILABLE,
  BILLING_UNIT,
} from "@/features/plan/pricing-meta";

export const PRICING_FAQ = [
  {
    q: "What is free forever?",
    a: "Your company profile, domain verification, unlimited confirmed partners, references, and case studies, plus standard embeds — on one owner seat.",
  },
  {
    q: "How is billing charged?",
    a:
      BILLING_UNIT +
      " Pro is a monthly subscription on the company, not per teammate.",
  },
  {
    q: "Is there annual billing?",
    a: ANNUAL_BILLING_AVAILABLE
      ? "Yes — choose annual at checkout."
      : "Not yet. Only monthly Pro is available in Stripe today.",
  },
  {
    q: "Do taxes apply?",
    a: "Taxes may apply depending on your location and Stripe Checkout settings. The amount charged is shown before you pay.",
  },
  {
    q: "How do I cancel?",
    a: "Company owners cancel from Workspace → Billing. Access continues until the end of the paid period, then the company returns to Free entitlements (Founding plans are not downgraded by Stripe).",
  },
  {
    q: "Is the Verified badge paid?",
    a: "No. Verified means domain or approved identity control. It is never sold as a plan perk.",
  },
] as const;

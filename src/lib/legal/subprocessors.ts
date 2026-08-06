/** Processors used by Hansala — only services wired in the product. */

export type Subprocessor = {
  name: string;
  purpose: string;
  location: string;
  website: string;
};

export const SUBPROCESSORS: Subprocessor[] = [
  {
    name: "Vercel Inc.",
    purpose: "Application hosting and edge delivery",
    location: "Primary app region: Frankfurt (fra1); global CDN",
    website: "https://vercel.com",
  },
  {
    name: "Supabase Inc.",
    purpose: "PostgreSQL database, authentication, and file storage",
    location: "Region of the linked Supabase project",
    website: "https://supabase.com",
  },
  {
    name: "Resend Inc.",
    purpose: "Transactional email (magic links, invites, confirmations)",
    location: "United States / EU as Resend operates",
    website: "https://resend.com",
  },
  {
    name: "Stripe, Inc.",
    purpose: "Payment processing when a paid plan is purchased",
    location: "United States / EU as Stripe operates",
    website: "https://stripe.com",
  },
];

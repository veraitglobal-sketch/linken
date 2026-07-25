import type { Metadata } from "next";
import Link from "next/link";
import { ClientConfirmedChip } from "@/components/case-studies/client-confirmed-chip";
import { CompanyHeroBand } from "@/components/company/company-hero-band";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/ui/logo-tile";
import { SectionTitle } from "@/components/ui/section-title";
import type { Company } from "@/types/company";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Demo profile",
  description:
    "An illustrative example of a confirmed company network on Hansala — not a real company.",
  robots: { index: false, follow: false },
};

const DEMO_COMPANY: Company = {
  id: "demo-company",
  slug: "demo",
  name: "Nordform Studio",
  tagline:
    "Brand, product, and delivery work — proven with partners who confirm it, not just claim it.",
  description: "",
  category: "Design & product strategy",
  city: "Berlin",
  country: "Germany",
  website: "",
  services: ["Brand strategy", "Product design", "Delivery"],
  verified: true,
  verifiedAt: "2026-02-01",
  websiteLinked: false,
  logoInitials: "NS",
  logoUrl: null,
  coverImageUrl: "/images/hero-network.jpg",
  claimed: true,
  acceptingClients: true,
  plan: "pro",
};

const DEMO_PARTNERS = [
  {
    name: "Bramble Engineering",
    category: "Software development",
    initials: "BE",
  },
  {
    name: "Ostra Legal Partners",
    category: "Professional services",
    initials: "OL",
  },
  { name: "Fielder & Voss", category: "Marketing & PR", initials: "FV" },
] as const;

const DEMO_CASE_STUDIES = [
  {
    title: "Relaunching a fintech onboarding flow",
    year: "2026",
    location: "Berlin, Germany",
    summary:
      "Redesigned account opening for a challenger bank, cutting drop-off by a third — delivered jointly with the client's engineering team.",
    services: ["Product design", "Engineering"],
    partner: "Bramble Engineering",
  },
  {
    title: "Brand system for a legal-tech platform",
    year: "2025",
    location: "Hamburg, Germany",
    summary:
      "A full identity and voice for a contract-review startup, built alongside outside counsel to keep every claim accurate.",
    services: ["Brand strategy", "Positioning"],
    partner: "Ostra Legal Partners",
  },
  {
    title: "Go-to-market for a logistics marketplace",
    year: "2025",
    location: "Munich, Germany",
    summary:
      "Launch strategy and press for a two-sided freight marketplace, coordinated with the client's PR partner from day one.",
    services: ["Marketing", "Launch strategy"],
    partner: "Fielder & Voss",
  },
] as const;

export default function DemoPage() {
  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-[#1a5c51]/20 bg-[#eafaf3] px-4 py-2.5 text-center">
        <p className="text-[13px] font-medium text-[#1a5c51]">
          <strong className="font-semibold">Demo profile</strong> —
          illustrative example, not a real company.{" "}
          <Link
            href="/onboarding"
            className="underline underline-offset-2 hover:no-underline"
          >
            Create your own company link →
          </Link>
        </p>
      </div>

      <CompanyHeroBand company={DEMO_COMPANY} trustLevel="Trusted" />

      <section className="px-4 pt-10 pb-4">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Confirmed partners
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.55rem,2.5vw,1.95rem)] font-medium tracking-[-0.035em] text-ink">
            Both sides clicked
            <span className="text-ink/35"> confirm.</span>
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {DEMO_PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-4"
              >
                <LogoTile
                  name={partner.name}
                  initials={partner.initials}
                  size="md"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-ink">
                      {partner.name}
                    </p>
                    <span className="rounded-lg border border-[#1a5c51]/25 bg-[#1a5c51]/10 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em] text-[#1a5c51] uppercase">
                      Verified
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {partner.category}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Case studies
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.55rem,2.5vw,1.95rem)] font-medium tracking-[-0.035em] text-ink">
            Delivered with
            <span className="text-ink/35"> confirmed clients.</span>
          </h2>
          <div className="mt-5 flex flex-col gap-3.5">
            {DEMO_CASE_STUDIES.map((cs, index) => (
              <article
                key={cs.title}
                className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7"
              >
                <div className="flex items-center gap-3 text-[12px] text-muted">
                  <span className="font-display text-ember">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>·</span>
                  <span className="font-semibold tracking-[0.1em] uppercase">
                    {cs.year}
                  </span>
                  <span>·</span>
                  <span>{cs.location}</span>
                </div>
                <h3 className="mt-3 font-display text-[clamp(1.35rem,2.2vw,1.65rem)] font-medium tracking-[-0.03em] text-ink">
                  {cs.title}
                </h3>
                <div className="mt-2">
                  <ClientConfirmedChip />
                </div>
                <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">
                  {cs.summary}
                </p>
                <p className="mt-2 text-[12px] text-muted">
                  {cs.services.join(" · ")}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-[#f7f8fa] px-3 py-1.5 text-[12px] text-ink">
                    <span className="font-medium">{cs.partner}</span>
                    <span className="text-muted">· delivery partner</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-6xl rounded-[28px] border border-line bg-surface px-6 py-10 text-center sm:px-10">
          <div className="mx-auto">
            <SectionTitle
              eyebrow="Your turn"
              title="Ready to build a network like this?"
              description="It starts with one confirmed partner and one shared project — real, not demo."
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button href="/onboarding" variant="primary" className="h-12 min-w-[190px] px-6">
              Create company
            </Button>
            <Button href="/" variant="secondary" className="h-12 min-w-[190px] px-6">
              Back to home
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

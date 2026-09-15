import type { Metadata } from "next";
import { PricingPhotoBand } from "@/components/pricing/pricing-photo-band";
import { DirectorySearch } from "@/components/search/directory-search";

export const metadata: Metadata = {
  title: "Search companies",
  description:
    "Find a company on Hansala. Public profiles show confirmed partners only.",
  alternates: { canonical: "/search" },
};

type Props = {
  searchParams: Promise<{ q?: string }>;
};

// Same shape as the homepage hero: a lime band under the floating nav, the
// claim centred, the field as the one object in it. Results sit on the wash.
export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const initialQuery = q?.trim().slice(0, 80) ?? "";

  return (
    <div className="home-wash bg-wash">
      <DirectorySearch
        initialQuery={initialQuery}
        header={
          <>
            <h1 className="animate-rise max-w-[20ch] font-display text-[clamp(2.3rem,4.3vw,3.875rem)] leading-[1.05] font-semibold tracking-[-0.04em] text-ink text-balance">
              See who a company has really worked with.
            </h1>
            <p className="animate-rise-delay mt-6 max-w-[54ch] text-[17px] leading-[1.6] text-ink-soft sm:text-[18px]">
              Search by name, sector or city. A profile lists a partner only
              after both companies confirmed it.
            </p>
          </>
        }
      />

      <PricingPhotoBand
        title="Not in the directory yet?"
        src="/images/lookup-wide-a1.jpg"
        alt="A small team in conversation around a table in a workshop"
        lead="Create your company profile for free, then invite the clients and partners who can confirm your work."
        href="/onboarding"
        cta="Create your company profile"
      />
      <div className="h-24 sm:h-32" />
    </div>
  );
}

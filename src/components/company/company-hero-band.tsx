import Image from "next/image";
import Link from "next/link";
import { EmbedSnippetButton } from "@/components/company/embed-snippet-button";
import { InquiryForm } from "@/components/inquiries/inquiry-form";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { Button } from "@/components/ui/button";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import type { TrustLevel } from "@/features/trust/score";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
  trustLevel?: TrustLevel;
  showContact?: boolean;
  showOnePager?: boolean;
  showEmbed?: boolean;
  siteUrl?: string;
  groupBadge?: ConfirmedGroupBadge | null;
};

export function CompanyHeroBand({
  company,
  trustLevel = "Member",
  showContact = false,
  showOnePager = false,
  showEmbed = false,
  siteUrl = "",
  groupBadge = null,
}: Props) {
  const accepting = company.acceptingClients !== false;
  const claimed = company.claimed !== false;

  return (
    <section className="px-4 pt-3">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-[#10231f] lg:min-h-[560px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative z-10 flex flex-col justify-between px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="animate-rise flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                claimed && accepting ? "bg-[#5ec4a8]" : "bg-white/40"
              }`}
            />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              {company.category} · {company.city}, {company.country}
            </p>
            {company.claimed === false ? (
              <span className="rounded-full border border-[#5ec4a8]/40 bg-[#5ec4a8]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#5ec4a8] uppercase">
                Unclaimed profile
              </span>
            ) : (
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase ${
                  accepting
                    ? "border-[#5ec4a8]/40 bg-[#5ec4a8]/15 text-[#5ec4a8]"
                    : "border-white/20 bg-white/5 text-white/55"
                }`}
              >
                {accepting ? "Accepting new clients" : "Fully booked"}
              </span>
            )}
            {groupBadge ? (
              <Link
                href={`/g/${groupBadge.slug}`}
                className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:border-[#5ec4a8]/50 hover:bg-[#5ec4a8]/15 hover:text-[#5ec4a8]"
              >
                Part of {groupBadge.name}
              </Link>
            ) : null}
          </div>

          <div className="animate-rise-delay max-w-xl py-10">
            <p className="font-display text-[clamp(0.95rem,1.4vw,1.1rem)] tracking-[0.04em] text-white/40 uppercase">
              Public company page
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.94] font-medium tracking-[-0.045em]">
                {company.name}
              </h1>
              {company.claimed !== false && company.verified ? (
                <span
                  title={
                    company.verifiedAt
                      ? `Domain verified · ${new Date(company.verifiedAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`
                      : "Domain verified"
                  }
                  className="rounded-full border border-[#5ec4a8]/45 bg-[#5ec4a8]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#5ec4a8] uppercase"
                >
                  Verified
                </span>
              ) : null}
              {company.claimed !== false ? (
                <TrustLevelBadge level={trustLevel} onDark />
              ) : null}
            </div>
            {company.claimed !== false && company.verified ? (
              <p className="mt-2 text-[12px] text-white/45">
                Domain verified
                {company.verifiedAt
                  ? ` · ${new Date(company.verifiedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
                  : ""}
              </p>
            ) : null}
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
              {company.tagline}
            </p>
          </div>

          <div className="animate-rise-late space-y-4">
            <div className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                Shareable address
              </p>
              <p className="mt-1 font-display text-lg tracking-[-0.03em] text-white sm:text-xl">
                linken.com/
                <span className="text-[#5ec4a8]">{company.slug}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-start">
              {showContact ? (
                <InquiryForm
                  companySlug={company.slug}
                  companyName={company.name}
                  fullyBooked={!accepting}
                />
              ) : null}
              {showOnePager ? (
                <Button
                  href={`/c/${company.slug}/one-pager`}
                  variant="onDark"
                  className="h-11 min-w-[150px] px-5"
                >
                  One-pager
                </Button>
              ) : null}
              {showEmbed && siteUrl ? (
                <EmbedSnippetButton
                  companySlug={company.slug}
                  siteUrl={siteUrl}
                />
              ) : null}
              {company.website ? (
                <Button
                  href={company.website}
                  variant={showContact ? "onDark" : "light"}
                  className="h-11 min-w-[150px] px-5"
                >
                  Website
                  {company.websiteLinked ? (
                    <span className="ml-1 text-[10px] font-semibold tracking-[0.08em] opacity-80 uppercase">
                      · Linked
                    </span>
                  ) : null}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="group relative min-h-[220px] overflow-hidden lg:min-h-full">
          <Image
            src="/images/site-work.jpg"
            alt=""
            fill
            priority
            className="media-zoom object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-[rgba(10,20,18,0.5)]" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#5ec4a8] uppercase">
              On Linken
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              Profile · Case studies · Mutual partners
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

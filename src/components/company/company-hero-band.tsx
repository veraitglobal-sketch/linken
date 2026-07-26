import Image from "next/image";
import Link from "next/link";
import { CompanyHeroActions } from "@/components/company/company-hero-actions";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import { SocialIcons } from "@/components/ui/social-icons";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import { getSchedulingForCompanyId } from "@/features/scheduling/queries";
import type { TrustLevel } from "@/features/trust/score";
import type { Company } from "@/types/company";
import { COMPANY_SHARE_PREFIX } from "@/lib/site";

type Props = {
  company: Company;
  trustLevel?: TrustLevel;
  showContact?: boolean;
  showOnePager?: boolean;
  showEmbed?: boolean;
  showEditProfile?: boolean;
  siteUrl?: string;
  groupBadge?: ConfirmedGroupBadge | null;
};

export async function CompanyHeroBand({
  company,
  trustLevel = "Member",
  showContact = false,
  showOnePager = false,
  showEmbed = false,
  showEditProfile = false,
  siteUrl = "",
  groupBadge = null,
}: Props) {
  const accepting = company.acceptingClients !== false;
  const claimed = company.claimed !== false;
  const scheduling =
    claimed && company.id
      ? await getSchedulingForCompanyId(company.id)
      : null;

  return (
    <section className="px-4 pt-3">
      <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-[32px] bg-[#0e1f1c] lg:min-h-[560px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative z-10 flex flex-col justify-between px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="animate-rise flex flex-wrap items-center gap-x-3 gap-y-2">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                claimed && accepting ? "bg-[#7eb8a4]" : "bg-white/40"
              }`}
            />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              {company.category} · {company.city}, {company.country}
            </p>
            {company.claimed === false ? (
              <span className="rounded-full border border-[#7eb8a4]/40 bg-[#7eb8a4]/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#7eb8a4] uppercase">
                Unclaimed profile
              </span>
            ) : (
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] uppercase ${
                  accepting
                    ? "border-[#7eb8a4]/40 bg-[#7eb8a4]/15 text-[#7eb8a4]"
                    : "border-white/20 bg-white/5 text-white/55"
                }`}
              >
                {accepting ? "Accepting new clients" : "Fully booked"}
              </span>
            )}
            {groupBadge ? (
              <Link
                href={`/g/${groupBadge.slug}`}
                className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-white uppercase transition-colors hover:border-[#7eb8a4]/50 hover:bg-[#7eb8a4]/15 hover:text-[#7eb8a4]"
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
              <LogoMark
                initials={company.logoInitials}
                logoUrl={company.logoUrl}
                size="lg"
                className={
                  company.logoUrl
                    ? "rounded-xl border-white/20"
                    : "rounded-xl border-white/20 bg-white/10 text-white"
                }
              />
              <h1 className="font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.94] font-medium tracking-[-0.045em]">
                {company.name}
              </h1>
              {company.claimed !== false && company.verified ? (
                <VerifiedBadge
                  title={
                    company.verifiedAt
                      ? `Verified company · ${new Date(company.verifiedAt).getFullYear()}`
                      : "Verified company"
                  }
                  size={26}
                />
              ) : null}
              {company.claimed !== false ? (
                <TrustLevelBadge level={trustLevel} onDark />
              ) : null}
            </div>
            {company.claimed !== false && company.verified ? (
              <p className="mt-2 text-[12px] text-white/45">
                Verified company
                {company.verifiedAt
                  ? ` · ${new Date(company.verifiedAt).getFullYear()}`
                  : ""}
              </p>
            ) : null}
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
              {company.tagline}
            </p>
            <SocialIcons
              linkedinUrl={company.linkedinUrl}
              facebookUrl={company.facebookUrl}
              tone="dark"
              className="mt-5"
            />
          </div>

          <div className="animate-rise-late space-y-4">
            <div className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                Shareable address
              </p>
              <p className="mt-1 font-display text-lg tracking-[-0.03em] text-white sm:text-xl">
                {COMPANY_SHARE_PREFIX}/
                <span className="text-[#7eb8a4]">{company.slug}</span>
              </p>
            </div>
            <CompanyHeroActions
              slug={company.slug}
              name={company.name}
              website={company.website}
              websiteLinked={Boolean(company.websiteLinked)}
              accepting={accepting}
              showContact={showContact}
              showOnePager={showOnePager}
              showEmbed={showEmbed}
              showEditProfile={showEditProfile}
              siteUrl={siteUrl}
              bookingUrl={scheduling?.url}
              bookingLabel={scheduling?.label}
            />
          </div>
        </div>

        <div className="group relative min-h-[220px] overflow-hidden lg:min-h-full">
          <Image
            src={company.coverImageUrl || "/images/hero-network.jpg"}
            alt={`${company.name} cover photo`}
            fill
            priority
            className="media-zoom object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-[rgba(10,20,18,0.5)]" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#7eb8a4] uppercase">
              Hansala
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

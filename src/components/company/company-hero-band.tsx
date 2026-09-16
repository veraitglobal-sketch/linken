import Image from "next/image";
import { CompanyHeroActions } from "@/components/company/company-hero-actions";
import { CompanyHeroChips } from "@/components/company/company-hero-chips";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import { SocialIcons } from "@/components/ui/social-icons";
import { VerifiedStatusNote } from "@/components/company/verified-status-note";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import { getCompanyPositions } from "@/features/ranking/queries-position";
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

  /* Where this company stands in its sector — only when it is ranked, and only
     from confirmed records. A company with none simply has no badge. */
  const position =
    company.claimed === false ? null : await getCompanyPositions(company.slug);

  /* New site style: a rounded navy chapter with the lime lip beneath it (the
     homepage's "Two companies" shape), cover photo inset on the right.
     Every fact shown is the company's own record — nothing added. */
  return (
    <section className="px-4 pt-4 sm:px-[18px]">
      <div className="relative mx-auto max-w-[1404px]">
        <div
          aria-hidden
          className="absolute inset-x-[-6px] top-1/3 bottom-[-14px] rounded-[40px] bg-lime sm:inset-x-[-8px] sm:bottom-[-18px] sm:rounded-[64px]"
        />
        <div className="relative grid overflow-hidden rounded-[32px] bg-navy sm:rounded-[60px] lg:min-h-[600px] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative z-10 flex flex-col justify-between gap-10 px-6 py-9 text-on-navy sm:px-12 sm:py-12 lg:pr-8 lg:pl-20 lg:py-16">
            <CompanyHeroChips
              company={company}
              claimed={claimed}
              accepting={accepting}
              position={position}
              groupBadge={groupBadge}
            />

            <div className="animate-rise-delay max-w-xl">
              <div className="flex flex-wrap items-center gap-4">
                <LogoMark
                  initials={company.logoInitials}
                  logoUrl={company.logoUrl}
                  size="lg"
                  className={
                    company.logoUrl
                      ? "rounded-2xl border-white/20"
                      : "rounded-2xl border-white/20 bg-white/10 text-white"
                  }
                />
                <h1 className="font-display text-[clamp(2.6rem,5.2vw,4.25rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-on-navy">
                  {company.name}
                </h1>
                {company.claimed !== false && company.verified ? (
                  <VerifiedBadge
                    title={
                      company.verifiedAt
                        ? `Verified company · ${new Date(company.verifiedAt).getFullYear()}`
                        : "Verified company"
                    }
                    size={28}
                  />
                ) : null}
                {company.claimed !== false ? (
                  <TrustLevelBadge level={trustLevel} onDark />
                ) : null}
              </div>
              <VerifiedStatusNote
                verified={Boolean(company.verified)}
                verifiedAt={company.verifiedAt}
                claimed={company.claimed !== false}
              />
              {company.tagline ? (
                <p className="mt-6 max-w-md text-[18px] leading-relaxed text-on-navy">
                  {company.tagline}
                </p>
              ) : null}
              <SocialIcons
                linkedinUrl={company.linkedinUrl}
                facebookUrl={company.facebookUrl}
                tone="dark"
                className="mt-5"
              />
            </div>

            <div className="animate-rise-late space-y-5">
              <p className="inline-flex max-w-full items-center gap-3 rounded-full bg-white/[0.06] py-2 pr-5 pl-2 ring-1 ring-white/12">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-on-navy-muted uppercase">
                  Share
                </span>
                <span className="truncate font-display text-[16px] tracking-[-0.02em] text-on-navy sm:text-[18px]">
                  {COMPANY_SHARE_PREFIX}/
                  <span className="text-lime">{company.slug}</span>
                </span>
              </p>
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

          <div className="relative p-3 pt-0 sm:p-4 sm:pt-0 lg:p-5">
            <div className="group relative h-full min-h-[260px] overflow-hidden rounded-[24px] sm:rounded-[44px]">
              <Image
                src={company.coverImageUrl || "/images/hero-network.jpg"}
                alt={`${company.name} cover photo`}
                fill
                priority
                className="media-zoom object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

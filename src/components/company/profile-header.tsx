import Image from "next/image";
import Link from "next/link";
import { EmbedSnippetButton } from "@/components/company/embed-snippet-button";
import { ProfileCoverArt } from "@/components/company/profile-cover-art";
import { ProfileStatCards } from "@/components/company/profile-stat-cards";
import { InquiryForm } from "@/components/inquiries/inquiry-form";
import { BookCallButton } from "@/components/scheduling/book-call-button";
import { Button } from "@/components/ui/button";
import { SocialIcons } from "@/components/ui/social-icons";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import type { ConfirmedGroupBadge } from "@/features/groups/types";
import { getCompanyPositions } from "@/features/ranking/queries-position";
import { getSchedulingForCompanyId } from "@/features/scheduling/queries";
import type { TrustProfile } from "@/features/trust/queries";
import type { Company } from "@/types/company";

export type ProfileTab = { href: string; label: string };

/**
 * The top of a company profile: one white record card, the way a serious
 * product shows a person or an account — cover across the top, the logo set
 * over its edge, the name and the plain facts beside it, actions on the right
 * and the page's sections as tabs along the bottom.
 *
 * Every fact here is the company's own record or a confirmed count. Nothing is
 * added to fill the card; a company without a cover gets the drawn banner, not
 * a photograph of someone else's office.
 */
export async function ProfileHeader({
  company,
  trust,
  counts,
  tabs,
  showContact,
  showOnePager,
  showEmbed,
  showEditProfile,
  siteUrl,
  groupBadge,
}: {
  company: Company;
  trust: TrustProfile;
  counts: { partners: number; clients: number; caseStudies: number };
  tabs: ProfileTab[];
  showContact: boolean;
  showOnePager: boolean;
  showEmbed: boolean;
  showEditProfile: boolean;
  siteUrl: string;
  groupBadge: ConfirmedGroupBadge | null;
}) {
  const claimed = company.claimed !== false;
  const accepting = company.acceptingClients !== false;
  const [scheduling, position] = await Promise.all([
    claimed && company.id ? getSchedulingForCompanyId(company.id) : null,
    claimed ? getCompanyPositions(company.slug) : null,
  ]);

  const place = [company.city, company.country].filter(Boolean).join(", ");
  const website = company.website?.trim() ?? "";
  const websiteLabel = website.replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");

  return (
    <section className="px-4 pt-4 sm:px-[18px]">
      <div className="mx-auto max-w-[1280px]">
        <div className="overflow-hidden rounded-[28px] bg-surface ring-1 ring-line/70 shadow-[0_30px_70px_-50px_rgba(14,31,28,0.4)]">
          <div className="relative h-[132px] bg-navy sm:h-[196px] lg:h-[232px]">
            {company.coverImageUrl ? (
              <Image
                src={company.coverImageUrl}
                alt={`${company.name} cover`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            ) : (
              <ProfileCoverArt />
            )}
          </div>

          <div className="px-5 pb-6 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
                <ProfileLogo company={company} />
                <div className="min-w-0 sm:pb-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h1 className="font-display text-[clamp(1.9rem,3.4vw,2.75rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-ink">
                      {company.name}
                    </h1>
                    {claimed && company.verified ? (
                      <VerifiedBadge
                        title={`Verified${company.verifiedAt ? ` · ${new Date(company.verifiedAt).getFullYear()}` : ""} — this company proved control of its business domain. Not a paid badge and not a quality guarantee.`}
                        size={26}
                      />
                    ) : null}
                    {company.category ? (
                      <span className="inline-flex h-7 items-center rounded-full bg-lime-soft px-3 text-[12.5px] font-semibold text-navy">
                        {company.category}
                      </span>
                    ) : null}
                  </div>

                  <ul className="mt-2.5 flex list-none flex-wrap items-center gap-x-4 gap-y-1.5 p-0 text-[14px] text-muted">
                    {place ? (
                      <li className="inline-flex items-center gap-1.5">
                        <PinIcon />
                        {place}
                      </li>
                    ) : null}
                    {websiteLabel ? (
                      <li className="inline-flex items-center gap-1.5">
                        <GlobeIcon />
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ink-soft underline-offset-2 hover:text-ink hover:underline"
                        >
                          {websiteLabel}
                        </a>
                      </li>
                    ) : null}
                    <li className="inline-flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={`size-2 rounded-full ${!claimed ? "bg-line" : accepting ? "bg-lime ring-2 ring-lime-soft" : "bg-muted/40"}`}
                      />
                      {!claimed ? "Unclaimed profile" : accepting ? "Accepting new clients" : "Fully booked"}
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end lg:pb-1 [&_a]:!rounded-full [&_button]:!rounded-full">
                {scheduling?.url ? (
                  <BookCallButton
                    companySlug={company.slug}
                    label={scheduling.label}
                    variant="secondary"
                  />
                ) : null}
                {showContact ? (
                  <InquiryForm
                    companySlug={company.slug}
                    companyName={company.name}
                    fullyBooked={!accepting}
                    appearance="panel"
                    triggerLabel="Request a quote"
                    triggerVariant="lime"
                  />
                ) : null}
                {showEditProfile ? (
                  <Button href={`/c/${company.slug}/edit`} variant="secondary" className="h-11 px-5">
                    Edit company
                  </Button>
                ) : null}
                {showOnePager ? (
                  <Button href={`/c/${company.slug}/one-pager`} variant="secondary" className="h-11 px-5">
                    One-pager
                  </Button>
                ) : null}
                {showEmbed && siteUrl ? (
                  <EmbedSnippetButton companySlug={company.slug} siteUrl={siteUrl} variant="secondary" />
                ) : null}
              </div>
            </div>

            {company.tagline || position || groupBadge ? (
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {company.tagline ? (
                  <p className="max-w-[68ch] text-[16px] leading-relaxed text-ink-soft">
                    {company.tagline}
                  </p>
                ) : (
                  <span />
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {position ? (
                    <Link
                      href={
                        position.countryCode
                          ? `/best/${position.categorySlug}/${position.countryCode.toLowerCase()}`
                          : `/best/${position.categorySlug}`
                      }
                      title="Position from confirmed records"
                      className="inline-flex h-8 items-center gap-1.5 rounded-full bg-navy px-3.5 text-[12.5px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
                    >
                      <span aria-hidden className="size-1.5 rounded-full bg-lime" />
                      {position.countryRank && position.countryName
                        ? `#${position.countryRank} in ${position.categoryName} · ${position.countryName}`
                        : position.worldRank
                          ? `#${position.worldRank} in ${position.categoryName}`
                          : `Ranked in ${position.categoryName}`}
                    </Link>
                  ) : null}
                  {groupBadge ? (
                    <Link
                      href={`/g/${groupBadge.slug}`}
                      className="inline-flex h-8 items-center rounded-full bg-wash px-3.5 text-[12.5px] font-semibold text-ink ring-1 ring-line/70 transition-colors hover:bg-lime-soft"
                    >
                      Part of {groupBadge.name}
                    </Link>
                  ) : null}
                  <SocialIcons
                    linkedinUrl={company.linkedinUrl}
                    facebookUrl={company.facebookUrl}
                    tone="light"
                  />
                </div>
              </div>
            ) : null}
          </div>

          {tabs.length > 1 ? (
            <nav aria-label="Sections on this profile" className="border-t border-line/70 px-3 sm:px-6 lg:px-8">
              <ul className="-mb-px flex list-none gap-1 overflow-x-auto p-0 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {tabs.map((tab, i) => (
                  <li key={tab.href}>
                    <a
                      href={tab.href}
                      aria-current={i === 0 ? "true" : undefined}
                      className={
                        i === 0
                          ? "inline-flex h-12 items-center border-b-2 border-navy px-3 text-[14px] font-semibold text-ink"
                          : "inline-flex h-12 items-center border-b-2 border-transparent px-3 text-[14px] font-semibold text-muted transition-colors hover:border-lime hover:text-ink"
                      }
                    >
                      {tab.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
        </div>

        {claimed ? (
          <ProfileStatCards
            partners={counts.partners}
            clients={counts.clients}
            caseStudies={counts.caseStudies}
            trust={trust}
            position={position}
          />
        ) : null}
      </div>
    </section>
  );
}

function ProfileLogo({ company }: { company: Company }) {
  return (
    <div className="relative -mt-12 shrink-0 sm:-mt-16">
      <div className="grid size-[88px] place-items-center overflow-hidden rounded-[24px] bg-surface shadow-[0_14px_30px_-18px_rgba(14,31,28,0.45)] ring-4 ring-surface sm:size-[112px] sm:rounded-[28px]">
        {company.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={company.logoUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="font-display text-[28px] font-semibold tracking-[-0.03em] text-ink sm:text-[34px]">
            {company.logoInitials}
          </span>
        )}
      </div>
    </div>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <path d="M8 14s4.5-4.2 4.5-7.6A4.5 4.5 0 0 0 3.5 6.4C3.5 9.8 8 14 8 14Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0">
      <circle cx="8" cy="8" r="5.8" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.4 8h11.2M8 2.2c1.5 1.6 2.2 3.5 2.2 5.8S9.5 12.2 8 13.8C6.5 12.2 5.8 10.3 5.8 8S6.5 3.8 8 2.2Z" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

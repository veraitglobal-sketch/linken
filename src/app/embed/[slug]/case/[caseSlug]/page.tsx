import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { parseEmbedTheme } from "@/components/embed/embed-theme";
import { EmbedCaseStamp } from "@/components/embed/embed-case-stamp";
import { logProfileEvent } from "@/features/analytics/log";
import { getCaseStudyForPage } from "@/features/case-studies/queries";
import { getCompanyForPage } from "@/features/companies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { isUndisclosedPublic } from "@/features/confirmations/meta";
import { formatConfirmDate } from "@/features/trust/relationship-banner";
import { embedCaseHref } from "@/features/widgets/embed-href";
import { classifyEmbedPlacement } from "@/features/widgets/placement";
import { recordWidgetPlacementThrottled } from "@/features/widgets/record-placement";
import { wrapEmbed } from "@/features/widgets/render-trusted-embed";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string; caseSlug: string }>;
  searchParams: Promise<{ theme?: string; preview?: string; w?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, caseSlug } = await params;
  const caseStudy = await getCaseStudyForPage(slug, caseSlug);
  return {
    title: caseStudy
      ? `${caseStudy.title} · Confirmed`
      : "Case confirmation",
    robots: { index: false, follow: true },
  };
}

/**
 * Confirmation stamp only — empty when unconfirmed.
 * Never shows pending / placeholder (would be a self-awarded badge).
 */
export default async function EmbedCaseStampPage({
  params,
  searchParams,
}: Props) {
  const { slug, caseSlug } = await params;
  const { theme: themeRaw, preview, w } = await searchParams;
  const theme = parseEmbedTheme(themeRaw);
  const isPreview = preview === "1";

  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) {
      permanentRedirect(`/embed/${redirectSlug}/case/${caseSlug}`);
    }
    notFound();
  }

  const caseStudy = await getCaseStudyForPage(slug, caseSlug);
  if (!caseStudy) notFound();

  const conf = caseStudy.clientConfirmation;
  const confirmed = conf?.status === "confirmed";

  if (!confirmed || !conf) {
    return wrapEmbed(null, theme, w, {
      bare: true,
      wrapBackground: "transparent",
    });
  }

  const headerList = await headers();
  const placement = classifyEmbedPlacement(
    headerList.get("referer"),
    company.website,
  );

  if (!isPreview && (placement.kind === "owned" || placement.kind === "foreign")) {
    if (placement.host) {
      await recordWidgetPlacementThrottled({
        companyId: company.id,
        host: placement.host,
        variant: "case-stamp",
      });
    }
  }

  if (!isPreview) {
    await logProfileEvent(company.slug, "embed_view", "embed");
  }

  const undisclosed = isUndisclosedPublic(conf.disclosure);
  const clientName = undisclosed ? null : (conf.confirmedBy?.name ?? null);
  const siteUrl = getSiteUrl();
  const verifyUrl = embedCaseHref({
    siteUrl,
    ownerSlug: company.slug,
    caseSlug: caseStudy.slug,
    viaHost: placement.host,
  });

  return wrapEmbed(
    <EmbedCaseStamp
      clientName={clientName}
      confirmedAtLabel={formatConfirmDate(conf.confirmedAt ?? null)}
      verifyUrl={verifyUrl}
      theme={theme}
    />,
    theme,
    w,
    { bare: true, wrapBackground: "transparent" },
  );
}

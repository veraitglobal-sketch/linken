import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { parseEmbedTheme } from "@/components/embed/embed-theme";
import { EmbedForeignNote } from "@/components/embed/embed-foreign-note";
import { embedWrapTransparent } from "@/components/embed/render-embed-variant";
import { logProfileEvent } from "@/features/analytics/log";
import { getCompanyForPage } from "@/features/companies/queries";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { getEntitlements } from "@/features/plan/entitlements";
import { resolvePublicEmbedVariant } from "@/features/widgets/embed-access";
import { classifyEmbedPlacement } from "@/features/widgets/placement";
import { recordWidgetPlacementThrottled } from "@/features/widgets/record-placement";
import {
  renderTrustedEmbed,
  wrapEmbed,
} from "@/features/widgets/render-trusted-embed";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    variant?: string;
    theme?: string;
    preview?: string;
    w?: string;
  }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyForPage(slug);
  return {
    title: company ? `${company.name} · Verified on Hansala` : "Hansala badge",
    robots: { index: false, follow: true },
  };
}

export default async function EmbedBadgePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { variant = "horizontal", theme: themeRaw, preview, w } =
    await searchParams;
  const theme = parseEmbedTheme(themeRaw);
  const company = await getCompanyForPage(slug);
  if (!company) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) {
      const qs = new URLSearchParams();
      if (variant) qs.set("variant", variant);
      if (themeRaw) qs.set("theme", themeRaw);
      if (w) qs.set("w", w);
      const suffix = qs.toString();
      permanentRedirect(`/embed/${redirectSlug}${suffix ? `?${suffix}` : ""}`);
    }
    notFound();
  }

  const headerList = await headers();
  const placement = classifyEmbedPlacement(
    headerList.get("referer"),
    company.website,
  );
  const isPreview = preview === "1";
  const premiumEmbeds = getEntitlements(company.plan).premiumEmbeds;
  const resolvedVariant = resolvePublicEmbedVariant({
    variant,
    premiumEmbeds,
    preview: isPreview,
  }).variant;

  if (!isPreview && (placement.kind === "owned" || placement.kind === "foreign")) {
    if (placement.host) {
      await recordWidgetPlacementThrottled({
        companyId: company.id,
        host: placement.host,
        variant: resolvedVariant,
      });
    }
  }

  if (placement.kind === "foreign" && !isPreview) {
    const profileUrl = `${getSiteUrl()}/c/${company.slug}?src=embed`;
    return wrapEmbed(
      <EmbedForeignNote theme={theme} profileUrl={profileUrl} />,
      theme,
      w,
      { center: true, transparent: embedWrapTransparent("horizontal") },
    );
  }

  if (!isPreview) {
    await logProfileEvent(company.slug, "embed_view", "embed");
  }

  return renderTrustedEmbed({
    company,
    theme,
    variant,
    w,
    isPreview,
  });
}

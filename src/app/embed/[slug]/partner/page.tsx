import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { EmbedForeignNote } from "@/components/embed/embed-foreign-note";
import { EmbedPartnerCard } from "@/components/embed/embed-partner-card";
import { parseEmbedTheme } from "@/components/embed/embed-theme";
import { wrapEmbed } from "@/features/widgets/wrap-embed";
import { getPartnerEmbedData } from "@/features/commissions/partner-embed";
import { resolveCompanySlugRedirect } from "@/features/companies/slug-redirect";
import { classifyEmbedPlacement } from "@/features/widgets/placement";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string; preview?: string; w?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPartnerEmbedData(slug);
  return {
    title: data
      ? `${data.name} · Hansala Premium Partner`
      : "Hansala Premium Partner",
    robots: { index: false, follow: true },
  };
}

export default async function PartnerEmbedPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { theme: themeRaw, preview, w } = await searchParams;
  const theme = parseEmbedTheme(themeRaw);
  const isPreview = preview === "1";

  const data = await getPartnerEmbedData(slug);
  if (!data) {
    const redirectSlug = await resolveCompanySlugRedirect(slug);
    if (redirectSlug) {
      const qs = new URLSearchParams();
      if (themeRaw) qs.set("theme", themeRaw);
      if (preview) qs.set("preview", preview);
      const suffix = qs.toString();
      permanentRedirect(
        `/embed/${redirectSlug}/partner${suffix ? `?${suffix}` : ""}`,
      );
    }
    notFound();
  }

  if (!data.eligible) notFound();

  const headerList = await headers();
  const placement = classifyEmbedPlacement(
    headerList.get("referer"),
    data.website,
  );

  if (placement.kind === "foreign" && !isPreview) {
    return wrapEmbed(
      <EmbedForeignNote theme={theme} profileUrl={data.profileUrl} />,
      theme,
      w,
      { center: true, transparent: true },
    );
  }

  return wrapEmbed(
    <div className="box-border flex w-full items-center justify-center py-2">
      <EmbedPartnerCard
        name={data.name}
        profileUrl={data.profileUrl}
        logoUrl={data.logoUrl}
        theme={theme}
      />
    </div>,
    theme,
    w,
    { center: true, transparent: true },
  );
}

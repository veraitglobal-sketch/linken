import "server-only";

import { EmbedNetworkStrip } from "@/components/embed/embed-network-strip";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { getPartnersForCompany } from "@/features/partners/public-queries";
import { wrapEmbed } from "@/features/widgets/wrap-embed";
import type { Company } from "@/types/company";
import { getSiteUrl } from "@/lib/site";

/** Free confirmation-network snippet for host footers. */
export async function renderNetworkEmbed(input: {
  company: Company;
  theme: EmbedTheme;
  w?: string;
}) {
  const { company, theme, w } = input;
  const siteUrl = getSiteUrl();
  const profileUrl = `${siteUrl}/c/${company.slug}?src=embed-network`;
  const partners = await getPartnersForCompany(company.id);
  const peers = partners.slice(0, 5).map((p) => ({
    name: p.name,
    slug: p.slug,
    logoUrl: p.logoUrl,
    initials: p.logoInitials,
  }));

  return wrapEmbed(
    <EmbedNetworkStrip
      companyName={company.name}
      profileUrl={profileUrl}
      theme={theme}
      peers={peers}
      total={partners.length}
      siteUrl={siteUrl}
    />,
    theme,
    w,
    { transparent: true },
  );
}

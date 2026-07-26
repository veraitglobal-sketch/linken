import "server-only";
import { getCaseStudiesForCompany } from "@/features/case-studies/queries";
import { parseWidgetSettings } from "@/features/widgets/settings";
import { createClient } from "@/lib/supabase/server";

export type CaseGalleryEntry = {
  id: string;
  slug: string;
  title: string;
  year: string;
  location: string;
  clientName: string;
  highlightStat: string;
  coverImageUrl: string | null;
};

/**
 * Client-confirmed case studies for the case-gallery embed.
 * Honors placements.cases exclude / order / limit.
 */
export async function getCaseGalleryEntries(
  companyId: string,
): Promise<CaseGalleryEntry[]> {
  if (!companyId) return [];

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("companies")
    .select("widget_settings")
    .eq("id", companyId)
    .maybeSingle();
  const { cases: cfg } = parseWidgetSettings(
    settingsRow?.widget_settings,
  ).placements;

  const all = await getCaseStudiesForCompany(companyId);
  const confirmed = all.filter(
    (c) => c.clientConfirmation?.status === "confirmed",
  );
  const excluded = new Set(cfg.excludedCaseIds);
  let list = confirmed.filter((c) => !excluded.has(c.id));

  if (cfg.order.length) {
    const rank = new Map(cfg.order.map((id, i) => [id, i]));
    list = [...list].sort((a, b) => {
      const ra = rank.get(a.id);
      const rb = rank.get(b.id);
      if (ra !== undefined && rb !== undefined) return ra - rb;
      if (ra !== undefined) return -1;
      if (rb !== undefined) return 1;
      return (b.year || "").localeCompare(a.year || "");
    });
  }

  return list.slice(0, cfg.limit).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    year: c.year,
    location: c.location,
    clientName:
      c.clientConfirmation?.confirmedBy?.name?.trim() ||
      c.clientLabel ||
      "Client",
    highlightStat: c.highlightStat,
    coverImageUrl: c.coverImageUrl,
  }));
}

export async function countConfirmedCases(companyId: string): Promise<number> {
  if (!companyId) return 0;
  const all = await getCaseStudiesForCompany(companyId);
  return all.filter((c) => c.clientConfirmation?.status === "confirmed")
    .length;
}

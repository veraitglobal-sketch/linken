import "server-only";

import { isUndisclosedPublic, parseDisclosure, UNDISCLOSED_CLIENT_LABEL } from "@/features/confirmations/meta";
import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { initials } from "@/features/ranking/helpers";
import { createPublicClient } from "@/lib/supabase/public";

export type ConfirmedCaseCard = {
  caseSlug: string;
  title: string;
  summary: string;
  year: string;
  location: string;
  coverImageUrl: string | null;
  companySlug: string;
  companyName: string;
  companyLogoUrl: string | null;
  companyInitials: string;
  /** The client that confirmed it, named only when they allowed it. */
  confirmedBy: string;
  confirmedBySlug: string | null;
  confirmedAt: string | null;
};

type Embedded<T> = T | T[] | null;

function one<T>(value: Embedded<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Projects whose client confirmed them, for a set of companies.
 *
 * Only `confirmed` rows are readable here by policy, so nothing pending can
 * reach this list. A client who confirmed without allowing their name shows as
 * an undisclosed client — the record still counts, the name simply is not ours
 * to publish.
 */
export async function getConfirmedCasesForCompanies(
  companyIds: string[],
  limit = 6,
): Promise<ConfirmedCaseCard[]> {
  const ids = [...new Set(companyIds.filter(Boolean))];
  if (ids.length === 0) return [];

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("case_study_client_confirmation_requests")
      .select(
        "case_study_id, confirmed_at, disclosure, confirmer:companies!confirmed_by_company_id(name, slug), case_studies!inner(slug, title, summary, year, location, cover_image_url, owner:companies!company_id(id, slug, name, logo_url, website))",
      )
      .eq("status", "confirmed")
      .in("requested_by_company_id", ids)
      .order("confirmed_at", { ascending: false })
      .limit(limit * 3);

    if (error) {
      console.error("[confirmed cases]", error.message);
      return [];
    }

    const out: ConfirmedCaseCard[] = [];
    const seen = new Set<string>();

    for (const row of data ?? []) {
      const caseId = row.case_study_id as string;
      if (seen.has(caseId)) continue;
      const study = one(
        row.case_studies as Embedded<{
          slug: string;
          title: string;
          summary: string | null;
          year: string | null;
          location: string | null;
          cover_image_url: string | null;
          owner: Embedded<{
            id: string;
            slug: string;
            name: string;
            logo_url: string | null;
            website: string | null;
          }>;
        }>,
      );
      const owner = study ? one(study.owner) : null;
      if (!study?.slug || !owner?.slug) continue;

      const hidden = isUndisclosedPublic(parseDisclosure(row.disclosure));
      const client = one(row.confirmer as Embedded<{ name: string; slug: string }>);
      if (!hidden && !client?.name) continue;

      seen.add(caseId);
      out.push({
        caseSlug: study.slug,
        title: study.title,
        summary: study.summary ?? "",
        year: study.year ?? "",
        location: study.location ?? "",
        coverImageUrl: study.cover_image_url ?? null,
        companySlug: owner.slug,
        companyName: owner.name,
        companyLogoUrl: companyDisplayLogoUrl({
          logoUrl: owner.logo_url,
          website: owner.website,
          allowFavicon: false,
        }),
        companyInitials: initials(owner.name),
        confirmedBy: hidden ? UNDISCLOSED_CLIENT_LABEL : client!.name,
        confirmedBySlug: hidden ? null : (client?.slug ?? null),
        confirmedAt: (row.confirmed_at as string | null) ?? null,
      });
      if (out.length >= limit) break;
    }

    return out;
  } catch (err) {
    console.error("[confirmed cases]", err);
    return [];
  }
}

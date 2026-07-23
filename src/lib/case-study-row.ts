import type { CaseStudy } from "@/types/case-study";
import type { CaseStudyPartner } from "@/types/case-study";
import type { ClientConfirmation } from "@/types/client-confirmation";

type DbCaseRow = {
  id: string;
  slug: string;
  title: string;
  summary?: string | null;
  challenge?: string | null;
  outcome?: string | null;
  process?: string | null;
  location?: string | null;
  year?: string | null;
  services?: string[] | null;
  cover_image_url?: string | null;
  gallery_urls?: string[] | null;
};

export function mapCaseStudyRow(
  row: DbCaseRow,
  partners: CaseStudyPartner[] = [],
  clientConfirmation: ClientConfirmation | null = null,
): CaseStudy {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    challenge: row.challenge ?? "",
    outcome: row.outcome ?? "",
    process: row.process ?? "",
    location: row.location ?? "",
    year: row.year ?? "",
    services: row.services ?? [],
    coverImageUrl: row.cover_image_url ?? null,
    galleryUrls: row.gallery_urls ?? [],
    partners,
    clientConfirmation,
  };
}

export const CASE_STUDY_SELECT =
  "id, slug, title, summary, challenge, outcome, process, location, year, services, cover_image_url, gallery_urls";

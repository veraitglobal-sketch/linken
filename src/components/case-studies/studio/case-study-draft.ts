export type CaseStudyDraft = {
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  process: string;
  location: string;
  year: string;
  services: string;
  coverImageUrl: string | null;
  galleryUrls: string[];
};

export type CaseStudyStudioTab = "visual" | "story" | "client";

export function draftFromCaseStudy(cs: {
  title: string;
  summary: string;
  challenge: string;
  outcome: string;
  process: string;
  location: string;
  year: string;
  services: string[];
  coverImageUrl: string | null;
  galleryUrls: string[];
}): CaseStudyDraft {
  return {
    title: cs.title,
    summary: cs.summary,
    challenge: cs.challenge,
    outcome: cs.outcome,
    process: cs.process,
    location: cs.location,
    year: cs.year,
    services: cs.services.join(", "),
    coverImageUrl: cs.coverImageUrl,
    galleryUrls: cs.galleryUrls,
  };
}

export function servicesList(raw: string) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

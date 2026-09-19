export type UseCasePhoto = {
  src: string;
  alt: string;
  focus?: string;
};

/** Index hero — people in the frame, same workshop set as Pricing. */
export const USE_CASES_INDEX_PHOTO: UseCasePhoto = {
  src: "/images/lookup-wide-a1.jpg",
  alt: "Three people talking at a plywood table in a workshop",
  focus: "object-[center_55%]",
};

const BY_SLUG: Record<string, UseCasePhoto> = {
  "verified-client-references": {
    src: "/images/lookup-wide-a2.jpg",
    alt: "Two people standing in a concrete gallery",
    focus: "object-[center_70%]",
  },
  "verified-project-portfolio": {
    src: "/images/story-projects.jpg",
    alt: "Architectural plans, hard hat, and tools on a project desk",
    focus: "object-[center_42%]",
  },
  "references-for-tenders": {
    src: "/images/lookup-wide-b1.jpg",
    alt: "Hands reviewing a notebook beside a laptop",
  },
  "supplier-verification": {
    src: "/images/story-partners.jpg",
    alt: "Two people talking across a table in an office",
  },
  "contractor-qualification": {
    src: "/images/story-team.jpg",
    alt: "Two people working on a wall during a fit-out",
  },
  "architecture-firm-references": {
    src: "/images/story-projects.jpg",
    alt: "Architectural plans, hard hat, and tools on a project desk",
    focus: "object-[center_42%]",
  },
  "engineering-company-references": {
    src: "/images/lookup-wide-b2.jpg",
    alt: "Hands working at a bench under a lamp",
  },
  "agency-case-study-verification": {
    src: "/images/story-partners.jpg",
    alt: "Two people talking across a table in an office",
  },
};

export function getUseCasePhoto(slug: string): UseCasePhoto {
  return BY_SLUG[slug] ?? USE_CASES_INDEX_PHOTO;
}

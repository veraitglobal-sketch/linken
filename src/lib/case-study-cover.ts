const FALLBACKS = [
  "/images/story-projects.jpg",
  "/images/story-collaboration.jpg",
  "/images/story-team.jpg",
  "/images/hero-partner.jpg",
] as const;

export function caseStudyCoverUrl(
  coverImageUrl: string | null | undefined,
  index = 0,
): string {
  if (coverImageUrl?.trim()) return coverImageUrl;
  return FALLBACKS[index % FALLBACKS.length]!;
}

export function caseStudyCoverFocus(index = 0): string {
  const focuses = [
    "object-[center_42%]",
    "object-[center_28%]",
    "object-center",
    "object-[center_35%]",
  ];
  return focuses[index % focuses.length]!;
}

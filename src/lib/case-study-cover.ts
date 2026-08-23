const FALLBACKS = [
  "/images/story-projects.jpg",
  "/images/story-collaboration-v2.jpg",
  "/images/story-team.jpg",
  "/images/hero-partner-v3.jpg",
] as const;

export function caseStudyCoverUrl(
  coverImageUrl: string | null | undefined,
  index = 0,
): string {
  if (coverImageUrl?.trim()) return coverImageUrl;
  return FALLBACKS[index % FALLBACKS.length]!;
}

/**
 * Where to hold a cover when the box has to crop it.
 *
 * This used to return a different focal point per list position — 42%, 28%,
 * centre, 35%, cycling. The crop therefore depended on where a case study
 * happened to sit in a list rather than on what the picture contains: reorder
 * the list and the same photograph is cut somewhere else. A screenshot whose
 * subject sits at the top was pulled to 42% for no reason at all.
 *
 * Centre is the only honest default without knowing the image. It is kept as a
 * function so a real per-image focal point can replace it later — that value
 * belongs on the case study, chosen by whoever uploaded the picture.
 */
export function caseStudyCoverFocus(): string {
  return "object-center";
}

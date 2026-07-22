import type { EmbedProofCompany } from "@/components/embed/embed-brand";

/** Real companies for the homepage split section, in public/logos/showcase/.
 * dienstemarkt and meineallrounder still have an opaque baked-in background —
 * omit logoUrl for those until a transparent export replaces the file, so the
 * marquee shows clean initials instead of a visible box around the mark. */
export const HOME_SHOWCASE_LOGOS: EmbedProofCompany[] = [
  { name: "Vera", initials: "VR", logoUrl: "/logos/showcase/vera.png" },
  { name: "Fade", initials: "FD", logoUrl: "/logos/showcase/fade.png" },
  { name: "Dienstemarkt", initials: "DM" },
  { name: "MeinAllrounder", initials: "MA" },
];

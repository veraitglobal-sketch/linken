import type { EmbedProofCompany } from "@/components/embed/embed-brand";

/** Real companies for the homepage split section, in public/logos/showcase/.
 * meineallrounder still has an opaque baked-in background — omit logoUrl until
 * a transparent export replaces the file, so the marquee shows clean initials
 * instead of a visible box around the mark. */
export const HOME_SHOWCASE_LOGOS: EmbedProofCompany[] = [
  { name: "Vera", initials: "VR", logoUrl: "/logos/showcase/vera.png" },
  { name: "Fade", initials: "FD", logoUrl: "/logos/showcase/fade.png" },
  {
    name: "Dienstemarkt",
    initials: "DM",
    logoUrl: "/logos/showcase/dienstemarkt-mark.png",
  },
  { name: "MeinAllrounder", initials: "MA" },
];

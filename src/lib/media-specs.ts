/**
 * Recommended upload dimensions for Hansala media.
 * Display uses object-cover — match these ratios to avoid bad crops.
 */
export type MediaSpec = {
  /** Human label, e.g. "Company cover" */
  label: string;
  width: number;
  height: number;
  ratio: string;
  formats: string;
  maxMb: number;
  note?: string;
};

export const MEDIA_SPECS = {
  companyCover: {
    label: "Company cover",
    width: 1200,
    height: 1400,
    ratio: "6∶7 portrait",
    formats: "JPG, PNG, or WEBP",
    maxMb: 8,
    note: "Vertical photo for the profile hero (right panel). Not a wide banner or logo.",
  },
  logo: {
    label: "Company logo",
    width: 512,
    height: 512,
    ratio: "1∶1 square",
    formats: "PNG (transparent) or SVG",
    maxMb: 1,
    note: "Square mark on a transparent or white background.",
  },
  caseStudyCover: {
    label: "Case study cover",
    width: 1920,
    height: 1200,
    ratio: "16∶10 landscape",
    formats: "JPG, PNG, or WEBP",
    maxMb: 8,
    note: "Full-width hero on the public case file.",
  },
  caseStudyGallery: {
    label: "Case study gallery",
    width: 1200,
    height: 900,
    ratio: "4∶3 landscape",
    formats: "JPG, PNG, or WEBP",
    maxMb: 8,
    note: "Project photos in the case file gallery (up to 8).",
  },
  teamPhoto: {
    label: "Team photo",
    width: 400,
    height: 400,
    ratio: "1∶1 square",
    formats: "JPG, PNG, or WEBP",
    maxMb: 2,
    note: "Headshot for the public team section.",
  },
} as const satisfies Record<string, MediaSpec>;

export function mediaSpecSizeLabel(spec: MediaSpec) {
  return `${spec.width} × ${spec.height} px`;
}

export function mediaSpecHint(spec: MediaSpec) {
  return `Recommended ${mediaSpecSizeLabel(spec)} (${spec.ratio}). ${spec.formats}, max ${spec.maxMb} MB.`;
}

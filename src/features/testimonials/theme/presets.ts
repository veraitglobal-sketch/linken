export type TestimonialPreset =
  | "minimal"
  | "editorial"
  | "card"
  | "bordered"
  | "glass"
  | "dark";

export type TestimonialShadow = "none" | "soft" | "lifted";
export type TestimonialAlign = "left" | "center";

/** Upper bound only. The real count is resolved from the container width, so
 *  a choice made on a wide screen can never break a narrow host column. */
export type TestimonialColumns = 2 | 3 | 4;
export const TESTIMONIAL_COLUMNS: TestimonialColumns[] = [2, 3, 4];

export type TestimonialThemeTokens = {
  preset: TestimonialPreset;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  background: string;
  cardBackground: string;
  borderColor: string;
  borderWidth: number;
  radius: number;
  shadow: TestimonialShadow;
  spacing: number;
  align: TestimonialAlign;
  maxColumns: TestimonialColumns;
  customCss: string;
};

export const TESTIMONIAL_PRESETS: TestimonialPreset[] = [
  "minimal",
  "editorial",
  "card",
  "bordered",
  "glass",
  "dark",
];

export const PRESET_LABELS: Record<TestimonialPreset, string> = {
  minimal: "Minimal",
  editorial: "Editorial",
  card: "Card",
  bordered: "Bordered",
  glass: "Glass",
  dark: "Dark",
};

/** Same face as Hansala. The embed iframe already loads Geist via next/font. */
export const EMBED_UI_FONT = '"Geist", ui-sans-serif, sans-serif';

/**
 * Host-fit presets — Geist on the customer's page, not a serif and not the
 * host OS. Colour and radius stay neutral. "Match my site" still copies the
 * host font when they ask.
 */
/**
 * Type for a translucent fill, chosen by the light/dark param rather than baked
 * into the preset.
 *
 * The first attempt made only the fill neutral — grey at 10% — on the theory
 * that a sheer fill sits on anything. Measured on a mid tone (`#6b7570`) that
 * gave 4.04:1 on the body and 1.10:1 on the provenance. Switching the ink to
 * white did not rescue it either: 4.17:1. Neither direction clears AA, because
 * light and dark are a binary and a mid tone is neither.
 *
 * So the fill is not sheer — it is strong enough to *be* the ground the type is
 * read against, in whichever direction the light/dark param names, while still
 * letting the host show through. That is what actually makes a card sit on any
 * background: not transparency, but carrying its own contrast with it.
 */
export function translucentTypeFor(dark: boolean) {
  return dark
    ? {
        textColor: "#f1f3f1",
        mutedColor: "rgba(241,243,241,0.66)",
        /* Neutral near-black, not our navy. Strong enough to be the ground the
           type is read against, sheer enough that the host still shows. */
        cardBackground: "rgba(9,11,10,0.82)",
        borderColor: "rgba(255,255,255,0.16)",
      }
    : {
        textColor: "#0d1210",
        mutedColor: "#5a635e",
        cardBackground: "rgba(255,255,255,0.88)",
        borderColor: "rgba(13,18,16,0.10)",
      };
}

export const PRESET_TOKENS: Record<TestimonialPreset, TestimonialThemeTokens> = {
  minimal: {
    preset: "minimal",
    fontFamily: EMBED_UI_FONT,
    fontSize: 17,
    lineHeight: 1.4,
    textColor: "#0d1210",
    mutedColor: "#66706b",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    radius: 0,
    shadow: "none",
    spacing: 4,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
  editorial: {
    preset: "editorial",
    fontFamily: EMBED_UI_FONT,
    fontSize: 18,
    lineHeight: 1.38,
    textColor: "#0d1210",
    mutedColor: "#66706b",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "transparent",
    borderColor: "rgba(13,18,16,0.1)",
    borderWidth: 0,
    radius: 0,
    shadow: "none",
    spacing: 8,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
  card: {
    preset: "card",
    fontFamily: EMBED_UI_FONT,
    fontSize: 16,
    lineHeight: 1.4,
    textColor: "#0d1210",
    mutedColor: "#66706b",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "#ffffff",
    borderColor: "rgba(13,18,16,0.08)",
    borderWidth: 1,
    radius: 14,
    shadow: "soft",
    spacing: 18,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
  bordered: {
    preset: "bordered",
    fontFamily: EMBED_UI_FONT,
    fontSize: 16,
    lineHeight: 1.4,
    textColor: "#0d1210",
    mutedColor: "#66706b",
    accentColor: "#0e1f1c",
    background: "transparent",
    cardBackground: "transparent",
    borderColor: "rgba(13,18,16,0.14)",
    borderWidth: 1,
    radius: 0,
    shadow: "none",
    spacing: 18,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
  glass: {
    preset: "glass",
    fontFamily: EMBED_UI_FONT,
    fontSize: 16,
    lineHeight: 1.4,
    textColor: "#0d1210",
    mutedColor: "#66706b",
    accentColor: "#1a5c51",
    background: "transparent",
    /* Neutral grey at low alpha, not white at high alpha.
       White at 78% is not translucent, it is white — it only ever worked on a
       light host and turned into a slab on a dark one. Mid grey lightens a dark
       ground and darkens a light one by the same small amount, which is what
       "sits on any background" actually requires. */
    cardBackground: "rgba(128,128,128,0.10)",
    borderColor: "rgba(128,128,128,0.24)",
    borderWidth: 1,
    radius: 16,
    shadow: "soft",
    spacing: 18,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
  dark: {
    preset: "dark",
    fontFamily: EMBED_UI_FONT,
    fontSize: 16,
    lineHeight: 1.4,
    textColor: "#f1f3f1",
    mutedColor: "rgba(241,243,241,0.55)",
    accentColor: "#8fc4b3",
    background: "transparent",
    /* Was `rgba(12,20,18,0.88)` — Hansala's own navy-deep, green-tinted, and
       nearly opaque. On a customer's dark page that is our brand colour painted
       onto their card, which AGENTS.md forbids outright: the widget carries no
       colour of ours except the mark. White at 6% is neutral, takes whatever
       dark they actually use, and stays translucent over an image or a
       gradient. */
    cardBackground: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    radius: 14,
    shadow: "none",
    spacing: 18,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
};

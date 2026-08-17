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
    cardBackground: "rgba(255,255,255,0.78)",
    borderColor: "rgba(13,18,16,0.08)",
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
    cardBackground: "rgba(12,20,18,0.88)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    radius: 14,
    shadow: "none",
    spacing: 18,
    align: "left",
    maxColumns: 2,
    customCss: "",
  },
};

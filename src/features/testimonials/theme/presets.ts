export type TestimonialPreset =
  | "minimal"
  | "editorial"
  | "card"
  | "bordered"
  | "glass"
  | "dark";

export type TestimonialShadow = "none" | "soft" | "lifted";
export type TestimonialAlign = "left" | "center";

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

export const PRESET_TOKENS: Record<TestimonialPreset, TestimonialThemeTokens> = {
  minimal: {
    preset: "minimal",
    fontFamily: '"Newsreader", Georgia, serif',
    fontSize: 15,
    lineHeight: 1.55,
    textColor: "#0e1f1c",
    mutedColor: "#5c6b68",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "transparent",
    borderColor: "transparent",
    borderWidth: 0,
    radius: 0,
    shadow: "none",
    spacing: 12,
    align: "left",
    customCss: "",
  },
  editorial: {
    preset: "editorial",
    fontFamily: '"Newsreader", Georgia, serif',
    fontSize: 17,
    lineHeight: 1.5,
    textColor: "#0e1f1c",
    mutedColor: "#5c6b68",
    accentColor: "#7eb8a4",
    background: "transparent",
    cardBackground: "#f7faf9",
    borderColor: "#e2e9e7",
    borderWidth: 1,
    radius: 16,
    shadow: "none",
    spacing: 16,
    align: "left",
    customCss: "",
  },
  card: {
    preset: "card",
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.55,
    textColor: "#0e1f1c",
    mutedColor: "#5c6b68",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "#ffffff",
    borderColor: "#e2e9e7",
    borderWidth: 1,
    radius: 20,
    shadow: "soft",
    spacing: 14,
    align: "left",
    customCss: "",
  },
  bordered: {
    preset: "bordered",
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.5,
    textColor: "#0e1f1c",
    mutedColor: "#5c6b68",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "transparent",
    borderColor: "#0e1f1c",
    borderWidth: 1,
    radius: 0,
    shadow: "none",
    spacing: 16,
    align: "left",
    customCss: "",
  },
  glass: {
    preset: "glass",
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.55,
    textColor: "#0e1f1c",
    mutedColor: "#5c6b68",
    accentColor: "#1a5c51",
    background: "transparent",
    cardBackground: "rgba(255,255,255,0.72)",
    borderColor: "rgba(14,31,28,0.12)",
    borderWidth: 1,
    radius: 24,
    shadow: "soft",
    spacing: 14,
    align: "left",
    customCss: "",
  },
  dark: {
    preset: "dark",
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    fontSize: 14,
    lineHeight: 1.55,
    textColor: "#f4f7f6",
    mutedColor: "rgba(255,255,255,0.55)",
    accentColor: "#7eb8a4",
    background: "#081412",
    cardBackground: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    radius: 20,
    shadow: "none",
    spacing: 14,
    align: "left",
    customCss: "",
  },
};

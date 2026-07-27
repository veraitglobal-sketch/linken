export type WidgetVariant =
  | "footer-strip"
  | "partners-rotate"
  | "case-gallery"
  | "testimonials"
  | "verified"
  | "micro"
  | "horizontal"
  | "starter"
  | "score"
  | "trust-card"
  | "credentials"
  | "signature"
  | "references"
  | "assessment"
  | "logo-wall"
  | "case-stamp";

export type WidgetTheme = "light" | "dark";
export type WidgetSection = "placement" | "essential" | "proof" | "signature";
export type WidgetPlacement = "footer" | "partners" | "cases" | "proof";

export type WidgetDefinition = {
  id: WidgetVariant;
  name: string;
  description: string;
  section: WidgetSection;
  /** Where this embed is meant to live on the host site. */
  placement?: WidgetPlacement;
  recommended?: boolean;
  pro?: boolean;
  height: number;
  requirementHint?: string;
  unavailableCtaHref?: string;
  unavailableCtaLabel?: string;
  /** Case-study scoped — not in company /embed/[slug] picker. */
  caseScoped?: boolean;
};

/** How partner logos move in the clean logo wall. */
export type LogoMotion = "row" | "stack" | "fade" | "grid";

/** Logo mark height — studio + embed `size` param. */
export type LogoSize = "sm" | "md" | "lg" | "xl";

export const LOGO_SIZE_PX: Record<LogoSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 52,
};

export const LOGO_MOTION_OPTIONS: {
  id: LogoMotion;
  name: string;
  hint: string;
}[] = [
  {
    id: "row",
    name: "Row slide",
    hint: "Logos drift left — classic trust bar.",
  },
  {
    id: "stack",
    name: "Vertical",
    hint: "Logos rise bottom → top (Viktor-style).",
  },
  {
    id: "fade",
    name: "Fade",
    hint: "One logo at a time, soft crossfade.",
  },
  {
    id: "grid",
    name: "Grid",
    hint: "Static hairline grid — editorial logo wall.",
  },
];

export function parseLogoMotion(raw: string | undefined): LogoMotion {
  if (raw === "stack" || raw === "fade" || raw === "grid") return raw;
  return "row";
}

export function parseLogoSize(raw: string | undefined): LogoSize {
  if (raw === "sm" || raw === "lg" || raw === "xl") return raw;
  return "md";
}

/** iframe height for clean logo wall (transparent, no card chrome). */
export function logoWallHeight(motion: LogoMotion, size: LogoSize): number {
  const logo = LOGO_SIZE_PX[size];
  const label = 22;
  switch (motion) {
    case "grid":
      return label + logo * 2 + 28;
    case "stack":
      return label + logo * 2 + 20;
    case "fade":
      return label + logo + 28;
    default:
      return label + logo + 28;
  }
}

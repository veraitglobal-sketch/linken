/** How partner logos move in the clean logo wall. */
export type LogoMotion =
  | "row"
  | "stack"
  | "fade"
  | "grid"
  | "swap-batch"
  | "swap-random";

/** Logo mark height — studio + embed `size` param. */
export type LogoSize = "sm" | "md" | "lg" | "xl";

export const LOGO_SIZE_PX: Record<LogoSize, number> = {
  sm: 28,
  md: 36,
  lg: 44,
  xl: 52,
};

/** Default visible cells for swap modes. */
export const LOGO_SWAP_CELLS = 5;

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
    hint: "Logos rise bottom → top.",
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
  {
    id: "swap-batch",
    name: "Swap batch",
    hint: "Fixed grid — cells crossfade together on a beat.",
  },
  {
    id: "swap-random",
    name: "Swap random",
    hint: "Fixed grid — individual cells swap on jittered timers.",
  },
];

export function parseLogoMotion(raw: string | undefined): LogoMotion {
  if (
    raw === "stack" ||
    raw === "fade" ||
    raw === "grid" ||
    raw === "swap-batch" ||
    raw === "swap-random" ||
    raw === "row"
  ) {
    return raw;
  }
  return "grid";
}

export function parseLogoSize(raw: string | undefined): LogoSize {
  if (raw === "sm" || raw === "lg" || raw === "xl") return raw;
  return "md";
}

/** iframe height for clean logo wall (transparent, no card chrome). */
export function logoWallHeight(motion: LogoMotion, size: LogoSize): number {
  const logo = LOGO_SIZE_PX[size];
  const label = 48; // Hansala Verified lockup
  switch (motion) {
    case "grid":
    case "swap-batch":
    case "swap-random":
      return label + logo * 2 + 56;
    case "stack":
      return label + logo * 2 + 36;
    case "fade":
      return label + logo + 40;
    default:
      return label + logo + 40;
  }
}

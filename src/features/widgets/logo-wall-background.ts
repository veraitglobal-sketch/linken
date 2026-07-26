import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoWallBackground } from "@/features/widgets/settings";

export type LogoWallPresentation = {
  theme: EmbedTheme;
  /** Outer wrap background — never a gradient shell. */
  wrapBackground: string;
  /** True = no border, no gradient shell, no fill chrome. */
  bare: boolean;
};

/**
 * Resolve wall presentation. `background` overrides `?theme=` when set to
 * light/dark/hex. `transparent` keeps theme for mark treatment but strips shell.
 */
export function resolveLogoWallPresentation(
  background: LogoWallBackground,
  themeParam: EmbedTheme,
): LogoWallPresentation {
  if (background === "transparent") {
    return { theme: themeParam, wrapBackground: "transparent", bare: true };
  }
  if (background === "light") {
    return { theme: "light", wrapBackground: "transparent", bare: true };
  }
  if (background === "dark") {
    return { theme: "dark", wrapBackground: "#081412", bare: true };
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(background)) {
    const theme = hexIsDark(background) ? "dark" : "light";
    return { theme, wrapBackground: background, bare: true };
  }
  return { theme: "light", wrapBackground: "transparent", bare: true };
}

function hexIsDark(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

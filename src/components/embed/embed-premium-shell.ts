import type { EmbedTheme } from "@/components/embed/embed-theme";

/**
 * Pro widget shells — frost on the host, not SaaS chrome.
 * No hover lift: embeds must stay still inside host layouts.
 * Fill is the sheet strength so body copy still reads.
 */
export function embedPremiumShell(
  theme: EmbedTheme,
  tier: "pro" | "signature" = "pro",
): string {
  const base = "rounded-xl border transition-colors duration-150 ease-out";
  const fill =
    theme === "dark" ? "embed-glass-sheet-dark" : "embed-glass-sheet";
  const inset =
    tier === "signature"
      ? theme === "dark"
        ? "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        : "shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]"
      : "";

  return [base, fill, inset].filter(Boolean).join(" ");
}

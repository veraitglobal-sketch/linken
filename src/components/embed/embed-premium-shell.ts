import type { EmbedTheme } from "@/components/embed/embed-theme";

/** Premium widget shells — editorial, not SaaS card kitsch. */
export function embedPremiumShell(
  theme: EmbedTheme,
  tier: "pro" | "signature" = "pro",
): string {
  const base =
    "rounded-2xl border transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px";

  if (theme === "dark") {
    return [
      base,
      tier === "signature"
        ? "border-white/18 bg-[linear-gradient(165deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.02)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_40px_rgba(0,0,0,0.35)]"
        : "border-white/14 bg-[radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(126,184,164,0.16),transparent_55%),linear-gradient(165deg,#081412_0%,#0e1f1c_100%)]",
      "hover:shadow-[0_14px_36px_rgba(0,0,0,0.42)]",
    ].join(" ");
  }

  return [
    base,
    tier === "signature"
      ? "border-[#0e1f1c]/12 bg-[linear-gradient(180deg,#ffffff_0%,#f4f7f6_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_10px_32px_rgba(10,23,20,0.07)]"
      : "border-[#0e1f1c]/10 bg-[radial-gradient(ellipse_75%_55%_at_0%_0%,rgba(126,184,164,0.12),transparent_50%),linear-gradient(180deg,#ffffff_0%,#f8faf9_100%)]",
    "hover:shadow-[0_12px_28px_rgba(10,23,20,0.09)]",
  ].join(" ");
}

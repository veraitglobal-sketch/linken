import { cn } from "@/lib/cn";
import type { EmbedTheme } from "@/components/embed/embed-theme";

type Props = {
  verified: boolean;
  theme: EmbedTheme;
};

/** Title stack — Verified · Hansala · silver Developer Partner. */
export function EmbedPartnerTitle({ verified, theme }: Props) {
  const dark = theme === "dark";
  const ink = dark ? "text-[#f2f5f3]" : "text-[#0d1210]";

  return (
    <span className="min-w-0">
      {verified ? (
        <span
          className={cn(
            "block text-[10px] font-semibold tracking-[0.18em] uppercase",
            dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
          )}
        >
          Verified
        </span>
      ) : null}
      <span
        className={cn(
          "mt-1 block font-display text-[13px] font-semibold leading-none tracking-[0.14em] uppercase",
          ink,
        )}
      >
        Hansala
      </span>
      <span
        className={cn(
          "mt-1.5 block font-display text-[15px] font-bold leading-tight tracking-[-0.02em]",
          dark
            ? "[background:linear-gradient(180deg,#e8ecea_0%,#a8b2ad_100%)] bg-clip-text text-transparent"
            : "[background:linear-gradient(180deg,#9aa39e_0%,#5f6964_100%)] bg-clip-text text-transparent",
        )}
      >
        Developer Partner
      </span>
    </span>
  );
}

import { NetworkMark } from "@/components/marketing/network-mark";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  profileUrl: string;
  logoUrl?: string | null;
  theme?: EmbedTheme;
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "·"
  );
}

/**
 * Webflow-style partner lockup — transparent stage.
 * Mark → Hansala → pill (partner favicon + Premium Partner).
 */
export function EmbedPartnerCard({
  name,
  profileUrl,
  logoUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const mark = initials(name);

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group box-border flex w-full max-w-[280px] flex-col items-center no-underline"
    >
      {/* Hansala mark */}
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full",
          dark
            ? "bg-[#7eb8a4] text-[#081412]"
            : "bg-[#0e1f1c] text-[#7eb8a4]",
        )}
        aria-hidden
      >
        <NetworkMark size={18} animate={false} />
      </span>

      <span
        className={cn(
          "mt-3 font-display text-[28px] font-semibold leading-none tracking-[-0.045em]",
          dark ? "text-white" : "text-[#0d1210]",
        )}
      >
        Hansala
      </span>

      {/* Partner pill — frost on the host, not a white sticker */}
      <span
        className={cn(
          "mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
          dark ? "embed-glass-dark" : "embed-glass",
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-[5px]",
            dark ? "bg-white/10" : "bg-[#f0f2f0]",
          )}
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt=""
              width={20}
              height={20}
              className="h-full w-full object-contain p-0.5"
            />
          ) : (
            <span
              className={cn(
                "text-[8px] font-bold tracking-wide",
                dark ? "text-white/70" : "text-[#0e1f1c]/70",
              )}
            >
              {mark}
            </span>
          )}
        </span>
        <span
          className={cn(
            "text-[13px] font-semibold tracking-[-0.02em]",
            dark ? "text-[#f2f5f3]" : "text-[#0d1210]",
          )}
        >
          Premium Partner
        </span>
      </span>
    </a>
  );
}

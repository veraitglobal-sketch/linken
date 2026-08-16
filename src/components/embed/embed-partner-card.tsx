import { NetworkMark } from "@/components/marketing/network-mark";
import {
  embedInkClass,
  embedMutedClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  profileUrl: string;
  verified: boolean;
  referredCount: number;
  theme?: EmbedTheme;
};

/**
 * Partner credibility seal for agency / studio sites.
 * Anchor = mint mark on navy. Firm name first. Partner line is earned copy.
 */
export function EmbedPartnerCard({
  name,
  profileUrl,
  verified,
  referredCount,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const partnerLine = verified
    ? "Verified Hansala developer partner"
    : "Hansala developer partner";

  const facts: string[] = [];
  if (referredCount > 0) {
    facts.push(
      referredCount === 1
        ? "1 company on Hansala"
        : `${referredCount} companies on Hansala`,
    );
  }

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group box-border flex w-full max-w-[420px] items-start gap-3.5 rounded-[18px] border px-4 py-3.5 no-underline transition-colors duration-150",
        dark
          ? "border-white/12 bg-[#0c1412]/95 hover:border-white/22"
          : "border-black/[0.08] bg-[#fcfcfb]/96 hover:border-black/[0.14]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] ring-1",
          dark
            ? "bg-[#7eb8a4] text-[#081412] ring-[#7eb8a4]/35"
            : "bg-[#0e1f1c] text-[#7eb8a4] ring-black/10",
        )}
        aria-hidden
      >
        <NetworkMark size={18} animate={false} />
      </span>

      <span className="min-w-0 flex-1 pt-0.5">
        <span
          className={cn(
            "block truncate font-display text-[17px] font-semibold leading-tight tracking-[-0.035em]",
            embedInkClass(theme),
          )}
        >
          {name}
        </span>
        <span
          className={cn(
            "mt-1.5 block text-[11px] font-semibold leading-snug tracking-[0.04em]",
            dark ? "text-[#8fc4b3]" : "text-[#1a5c51]",
          )}
        >
          {partnerLine}
        </span>
        {facts.length > 0 ? (
          <span
            className={cn(
              "mt-2.5 block border-t pt-2 text-[11px] leading-relaxed",
              dark ? "border-white/10" : "border-black/[0.07]",
              embedSoftClass(theme),
            )}
          >
            {facts.join(" · ")}
          </span>
        ) : (
          <span
            className={cn(
              "mt-2 block text-[11px] leading-relaxed",
              embedMutedClass(theme),
            )}
          >
            View on Hansala
          </span>
        )}
      </span>
    </a>
  );
}

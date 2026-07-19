import { EmbedVerifiedMark } from "@/components/embed/embed-brand";
import {
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { NetworkMark } from "@/components/marketing/network-mark";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  verified: boolean;
  claimed: boolean;
  confirmedCount?: number;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** ~40px one-line mark — icon + mint verified + count. */
export function EmbedCompact({
  name,
  verified,
  claimed,
  confirmedCount = 0,
  profileUrl,
  theme = "light",
}: Props) {
  const showVerified = claimed && verified;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex h-10 w-full items-center gap-2 border px-3 no-underline",
        embedShellClass(theme),
      )}
    >
      <NetworkMark
        size={15}
        animate={false}
        className="shrink-0 text-[#5ec4a8]"
      />
      {showVerified ? (
        <>
          <EmbedVerifiedMark theme={theme} label="Verified on Linken" />
          {confirmedCount > 0 ? (
            <span className={cn("min-w-0 truncate text-[12px]", embedMutedClass(theme))}>
              <span className="mx-0.5 opacity-45">·</span>
              <span
                className={cn(
                  "font-display text-[13px] font-medium tracking-[-0.02em]",
                  embedInkClass(theme),
                )}
              >
                {confirmedCount}
              </span>{" "}
              confirmed
            </span>
          ) : null}
        </>
      ) : (
        <>
          <p
            className={cn(
              "min-w-0 flex-1 truncate text-[13px] font-semibold",
              embedInkClass(theme),
            )}
          >
            {name}
          </p>
          {!claimed ? (
            <span
              className={cn(
                "shrink-0 text-[10px] font-semibold tracking-[0.08em] uppercase",
                embedMutedClass(theme),
              )}
            >
              Unclaimed
            </span>
          ) : (
            <span className="font-display text-[11px] font-semibold tracking-[-0.02em] text-[#5ec4a8]">
              Linken
            </span>
          )}
        </>
      )}
    </a>
  );
}

import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  clientName: string | null;
  confirmedAtLabel: string | null;
  verifyUrl: string;
  theme: EmbedTheme;
};

/**
 * Small strip for the customer's own case page.
 * Renders only when confirmation exists — caller must gate.
 */
export function EmbedCaseStamp({
  clientName,
  confirmedAtLabel,
  verifyUrl,
  theme,
}: Props) {
  const dark = theme === "dark";

  return (
    <a
      href={verifyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "box-border flex w-full items-start gap-3 px-3 py-2.5 no-underline",
        dark ? "text-white" : "text-[#0d1210]",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          dark ? "bg-[#7eb8a4]/25 text-[#7eb8a4]" : "bg-[#1a5c51]/12 text-[#1a5c51]",
        )}
        aria-hidden
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2.5 6.2L4.8 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold tracking-[-0.02em]">
          Confirmed by client
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[11px] leading-snug",
            dark ? "text-white/55" : "text-[#66706b]",
          )}
        >
          {clientName ?? "Client"}
          {confirmedAtLabel ? ` · ${confirmedAtLabel}` : ""}
        </span>
        <span
          className={cn(
            "mt-1.5 block text-[11px] font-semibold",
            dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
          )}
        >
          verify on Hansala →
        </span>
      </span>
    </a>
  );
}

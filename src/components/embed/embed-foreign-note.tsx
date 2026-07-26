import { cn } from "@/lib/cn";
import type { EmbedTheme } from "@/components/embed/embed-theme";

type Props = {
  theme: EmbedTheme;
  profileUrl: string;
};

/** Neutral state when Referer shows a non-owned host (CSP is still the lock). */
export function EmbedForeignNote({ theme, profileUrl }: Props) {
  const dark = theme === "dark";
  return (
    <div
      className={cn(
        "box-border flex min-h-[52px] w-full items-center justify-center px-4 py-3 text-center",
        dark ? "bg-[#081412] text-white/70" : "bg-transparent text-ink-soft",
      )}
    >
      <p className="max-w-md text-[12px] leading-relaxed">
        This badge is not authorised for this site.{" "}
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "font-semibold underline-offset-2 hover:underline",
            dark ? "text-white" : "text-ink",
          )}
        >
          View profile on Hansala
        </a>
      </p>
    </div>
  );
}

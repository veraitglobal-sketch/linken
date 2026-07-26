import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import type { CaseGalleryEntry } from "@/features/widgets/case-gallery";
import { caseStudyCoverUrl } from "@/lib/case-study-cover";
import { cn } from "@/lib/cn";

type Props = {
  entry: CaseGalleryEntry;
  href: string;
  theme: EmbedTheme;
  index: number;
};

/** Single dossier row — cover, meta, title, confirmed mark. */
export function EmbedCaseGalleryRow({ entry, href, theme, index }: Props) {
  const dark = theme === "dark";
  const cover = caseStudyCoverUrl(entry.coverImageUrl, index);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group grid grid-cols-[72px_1fr] gap-3.5 no-underline",
        "border-b py-3.5 last:border-b-0",
        dark ? "border-white/8" : "border-[#0e1f1c]/08",
      )}
    >
      <span
        className={cn(
          "relative block h-[52px] w-[72px] overflow-hidden",
          dark ? "bg-white/6" : "bg-[#0e1f1c]/05",
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- embed iframe, no next/image */}
        <img
          src={cover}
          alt=""
          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "text-[10px] font-semibold tracking-[0.12em] uppercase",
              embedMutedClass(theme),
            )}
          >
            {entry.year}
            {entry.location ? ` · ${entry.location}` : ""}
          </span>
          <span
            className={cn(
              "ml-auto inline-flex items-center gap-1 text-[9px] font-semibold tracking-[0.1em] uppercase",
              dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
            )}
          >
            <span
              className={cn(
                "flex h-3.5 w-3.5 items-center justify-center rounded-full",
                dark ? "bg-[#7eb8a4]/20" : "bg-[#1a5c51]/12",
              )}
              aria-hidden
            >
              <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2.5 6.2L4.8 8.5L9.5 3.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Confirmed
          </span>
        </span>

        <span
          className={cn(
            "mt-1 block line-clamp-2 font-display text-[15px] font-medium tracking-[-0.03em] leading-snug",
            embedInkClass(theme),
          )}
        >
          {entry.title}
        </span>

        <span
          className={cn(
            "mt-1 block truncate text-[11px] leading-snug",
            embedMutedClass(theme),
          )}
        >
          {entry.clientName}
          {entry.highlightStat ? (
            <>
              <span className="mx-1.5 opacity-40">·</span>
              {entry.highlightStat}
            </>
          ) : null}
        </span>
      </span>
    </a>
  );
}

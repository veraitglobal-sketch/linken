import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { CaseGalleryEntry } from "@/features/widgets/case-gallery";
import { cn } from "@/lib/cn";

type Props = {
  companySlug: string;
  siteUrl: string;
  entries: CaseGalleryEntry[];
  theme?: EmbedTheme;
  profileUrl: string;
};

/** Confirmed case studies grid for “Work” sections on the company site. */
export function EmbedCaseGallery({
  companySlug,
  siteUrl,
  entries,
  theme = "light",
  profileUrl,
}: Props) {
  const dark = theme === "dark";

  if (entries.length === 0) {
    return (
      <p
        className={cn(
          "px-3 py-4 text-center text-[12px]",
          dark ? "text-white/45" : "text-[#66706b]",
        )}
      >
        No client-confirmed cases yet
      </p>
    );
  }

  return (
    <div className="box-border w-full px-1 py-2">
      <div className="mb-3 flex items-baseline justify-between gap-3 px-1">
        <p
          className={cn(
            "text-[11px] font-semibold tracking-[0.08em] uppercase",
            dark ? "text-white/45" : "text-[#66706b]",
          )}
        >
          Confirmed work
        </p>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-[11px] font-semibold no-underline",
            dark ? "text-[#7eb8a4]" : "text-[#1a5c51]",
          )}
        >
          All on Hansala →
        </a>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((e) => {
          const href = `${siteUrl}/c/${companySlug}/case-studies/${e.slug}?src=embed`;
          return (
            <li key={e.id}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "block rounded-xl border px-3.5 py-3 no-underline transition-opacity hover:opacity-90",
                  dark
                    ? "border-white/12 bg-white/[0.04] text-white"
                    : "border-[#0e1f1c]/10 bg-white text-[#0d1210]",
                )}
              >
                <p
                  className={cn(
                    "text-[10px] font-medium tracking-[0.06em] uppercase",
                    dark ? "text-white/40" : "text-[#66706b]",
                  )}
                >
                  {e.year}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[13px] font-semibold tracking-[-0.02em]">
                  {e.title}
                </p>
                <p
                  className={cn(
                    "mt-1.5 line-clamp-1 text-[11px]",
                    dark ? "text-white/50" : "text-[#66706b]",
                  )}
                >
                  {e.clientName}
                  {e.highlightStat ? ` · ${e.highlightStat}` : ""}
                </p>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

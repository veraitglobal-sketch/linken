import Link from "next/link";
import {
  directoryLetterSlug,
  type DirectoryLetterGroup,
} from "@/features/seo/directory-group";

type Props = {
  groups: DirectoryLetterGroup[];
};

/** Crawlable A–Z hub — each letter is a real URL, not ?page=. */
export function CompanyDirectoryLetters({ groups }: Props) {
  if (groups.length === 0) {
    return (
      <p className="mx-auto max-w-[1180px] px-4 pb-24 text-[15px] text-ink-soft sm:px-[18px]">
        No companies to list yet.
      </p>
    );
  }

  return (
    <nav
      aria-label="Companies by letter"
      className="mx-auto max-w-[1180px] px-4 pb-24 sm:px-[18px] sm:pb-32"
    >
      <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {groups.map((g) => (
          <li key={g.letter} className="list-none">
            <Link
              href={`/companies/${directoryLetterSlug(g.letter)}`}
              className="flex h-16 flex-col items-center justify-center rounded-2xl bg-surface ring-1 ring-line/70 hover:ring-ink/20"
            >
              <span className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
                {g.letter}
              </span>
              <span className="text-[11px] text-muted tabular-nums">
                {g.rows.length}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

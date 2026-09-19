import Link from "next/link";
import {
  directoryLetterSlug,
  type DirectoryLetterGroup,
} from "@/features/seo/directory-group";
import type { DirectoryCompany } from "@/features/seo/directory-queries";

type Props = {
  companies: DirectoryCompany[];
  letter: string;
  letters: DirectoryLetterGroup[];
};

export function CompanyDirectoryList({ companies, letter, letters }: Props) {
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-24 sm:px-[18px] sm:pb-32">
      {letters.length > 1 ? (
        <nav aria-label="Letters" className="flex flex-wrap gap-2 pb-8">
          {letters.map((g) => {
            const active = g.letter === letter;
            return (
              <Link
                key={g.letter}
                href={`/companies/${directoryLetterSlug(g.letter)}`}
                className={`grid size-9 place-items-center rounded-full text-[13px] font-semibold ${
                  active
                    ? "bg-navy text-white"
                    : "bg-surface text-ink ring-1 ring-line/70 hover:ring-ink/20"
                }`}
              >
                {g.letter}
              </Link>
            );
          })}
        </nav>
      ) : null}

      <ul className="mt-1 divide-y divide-line/70 border-y border-line/70 p-0">
        {companies.map((c) => {
          const place = [c.city, c.country].filter(Boolean).join(", ");
          return (
            <li key={c.slug} className="list-none">
              <Link
                href={`/c/${c.slug}`}
                className="flex items-baseline justify-between gap-4 py-3 text-[16px] text-ink hover:text-navy"
              >
                <span className="font-medium">{c.name}</span>
                {place ? (
                  <span className="shrink-0 text-[13px] text-muted">{place}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

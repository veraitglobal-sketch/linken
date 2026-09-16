import Link from "next/link";
import { CopyChip } from "@/components/developers/copy-chip";
import { LogoMark } from "@/components/ui/logo-mark";
import { companyPath } from "@/features/seo/paths";
import type { Partner } from "@/types/partner";

type Props = {
  name: string;
  slug: string;
  category: string;
  city: string;
  country: string;
  logoUrl: string | null;
  logoInitials: string;
  siteUrl: string;
  partners: Partner[];
};

function citeLine(input: {
  name: string;
  category: string;
  place: string;
  profileUrl: string;
  partnerNames: string[];
}): string {
  const bits = [input.name];
  if (input.category) bits.push(input.category);
  if (input.place) bits.push(input.place);
  const names = input.partnerNames.slice(0, 3);
  const confirmed =
    names.length > 0 ? ` Confirmed with ${names.join(", ")}.` : "";
  return `${bits.join(" · ")}.${confirmed} ${input.profileUrl}`;
}

/** Public cite / press kit — factual line + logo for partners and media. */
export function PressKit({
  name,
  slug,
  category,
  city,
  country,
  logoUrl,
  logoInitials,
  siteUrl,
  partners,
}: Props) {
  const profileUrl = `${siteUrl}${companyPath(slug)}`;
  const place = [city, country].filter(Boolean).join(", ");
  const partnerNames = partners.map((p) => p.name);
  const line = citeLine({
    name,
    category,
    place,
    profileUrl,
    partnerNames,
  });
  const markdown = `[${name}](${profileUrl})${category ? ` — ${category}` : ""}`;

  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 sm:px-6">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Press kit
      </p>
      <h1 className="mt-2 font-display text-[clamp(1.6rem,4vw,2.1rem)] font-semibold tracking-[-0.035em] text-ink">
        Cite {name}
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Use this when you mention {name}. Factual wording only — confirmed
        relationships, never pending claims.
      </p>

      <div className="mt-8 flex items-center gap-4 rounded-[24px] bg-surface px-5 py-5 ring-1 ring-line/70">
        <LogoMark
          initials={logoInitials}
          logoUrl={logoUrl}
          size="lg"
          className="rounded-2xl!"
        />
        <div className="min-w-0">
          <p className="font-display text-[1.15rem] font-semibold tracking-[-0.02em] text-ink">
            {name}
          </p>
          <p className="mt-0.5 truncate text-[13px] text-muted">
            {[category, place].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
          Short line
        </h2>
        <p className="mt-3 rounded-2xl bg-wash px-4 py-3 text-[14px] leading-relaxed text-ink ring-1 ring-line/60">
          {line}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyChip value={line} label="Copy line" />
          <CopyChip value={markdown} label="Copy Markdown" />
          <CopyChip value={profileUrl} label="Copy profile URL" />
        </div>
      </section>

      {partners.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Confirmed partners
          </h2>
          <ul className="mt-3 list-none space-y-2 p-0">
            {partners.slice(0, 12).map((p) => (
              <li key={p.id}>
                <Link
                  href={companyPath(p.slug)}
                  className="text-[14px] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {p.name}
                </Link>
                <span className="text-[13px] text-muted">
                  {" "}
                  · press kit at {siteUrl}
                  {companyPath(p.slug)}/press
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-10 text-[13px] text-muted">
        <Link
          href={companyPath(slug)}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          ← Back to profile
        </Link>
      </p>
    </div>
  );
}

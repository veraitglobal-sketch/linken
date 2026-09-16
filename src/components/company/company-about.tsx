import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

/** Overview — the company's own words, and the plain facts under them. */
export function CompanyAbout({ company }: Props) {
  const place = [company.city, company.country].filter(Boolean).join(", ");
  const website = company.website?.trim();

  const facts = [
    company.category ? { label: "Industry", value: company.category } : null,
    place ? { label: "Location", value: place } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <ProfileSection id="overview" icon={ProfileIcons.overview} title="Overview">
      {company.description ? (
        <p className="max-w-[72ch] text-[16px] leading-relaxed text-ink-soft">
          {company.description}
        </p>
      ) : null}

      {facts.length > 0 || website ? (
        <dl
          className={`grid gap-px overflow-hidden rounded-2xl bg-line/70 ring-1 ring-line/70 sm:grid-cols-3 ${company.description ? "mt-6" : ""}`}
        >
          {facts.map((f) => (
            <div key={f.label} className="bg-surface px-4 py-3.5">
              <dt className="text-[12px] text-muted">{f.label}</dt>
              <dd className="mt-1 text-[15px] font-semibold text-ink">{f.value}</dd>
            </div>
          ))}
          {website ? (
            <div className="bg-surface px-4 py-3.5">
              <dt className="text-[12px] text-muted">Website</dt>
              <dd className="mt-1 truncate text-[15px] font-semibold text-ink">
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      {company.services.length ? (
        <div className="mt-6">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Services on record
          </p>
          <ul className="mt-3 flex list-none flex-wrap gap-2 p-0">
            {company.services.map((service) => (
              <li
                key={service}
                className="inline-flex h-9 items-center rounded-full bg-lime-soft px-4 text-[14px] font-medium text-ink"
              >
                {service}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </ProfileSection>
  );
}

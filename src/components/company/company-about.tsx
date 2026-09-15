import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

export function CompanyAbout({ company }: Props) {
  const place = [company.city, company.country].filter(Boolean).join(", ");
  const website = company.website?.trim();

  const facts = [
    company.category ? { label: "Industry", value: company.category } : null,
    place ? { label: "Location", value: place } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <section className="rounded-3xl bg-surface px-6 py-9 sm:px-12 sm:py-12">
      <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start md:gap-14">
        <div>
          <span className="inline-flex h-8 items-center rounded-full bg-lime px-3.5 text-[12px] font-semibold text-navy">
            Overview
          </span>
          <h2 className="mt-5 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-ink text-balance">
            What this firm stands behind.
          </h2>
          <dl className="mt-7 flex flex-wrap gap-2">
            {facts.map((f) => (
              <div
                key={f.label}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-mute px-4 text-[14px]"
              >
                <dt className="text-muted">{f.label}</dt>
                <dd className="font-semibold text-ink">{f.value}</dd>
              </div>
            ))}
            {website ? (
              <div className="inline-flex h-10 items-center gap-2 rounded-full bg-mute px-4 text-[14px]">
                <dt className="text-muted">Website</dt>
                <dd>
                  <a
                    href={website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    {website.replace(/^https?:\/\//i, "").replace(/\/$/, "")}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
        <div>
          {company.description ? (
            <p className="text-[17px] leading-relaxed text-ink-soft">
              {company.description}
            </p>
          ) : null}
          {company.services.length ? (
            <div className={company.description ? "mt-8" : ""}>
              <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">
                Services on record
              </p>
              <ul className="mt-4 flex list-none flex-wrap gap-2.5 p-0">
                {company.services.map((service) => (
                  <li
                    key={service}
                    className="inline-flex h-11 items-center rounded-full bg-lime-soft px-5 text-[15px] font-medium text-ink"
                  >
                    {service}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

export function CompanyAbout({ company }: Props) {
  return (
    <section className="rounded-[28px] border border-line bg-surface px-6 py-8 sm:px-9 sm:py-10">
      <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
            Overview
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,2.8vw,2.25rem)] font-medium tracking-[-0.035em] text-ink">
            What this firm
            <span className="mt-1 block text-ink/35">stands behind.</span>
          </h2>
        </div>
        <div>
          <p className="text-[15px] leading-relaxed text-ink-soft sm:text-[16px]">
            {company.description}
          </p>
          <div className="mt-6 border-t border-line pt-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Services on record
            </p>
            <ul className="mt-3 space-y-2">
              {company.services.map((service, index) => (
                <li
                  key={service}
                  className="flex items-baseline gap-3 text-[14px] text-ink"
                >
                  <span className="font-display text-[13px] text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

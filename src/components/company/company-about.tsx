import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

export function CompanyAbout({ company }: Props) {
  return (
    <section className="grid gap-6 border-b border-line py-9 md:grid-cols-[160px_minmax(0,1fr)]">
      <h2 className="text-[11px] font-medium tracking-[0.12em] text-muted uppercase">
        Overview
      </h2>
      <div>
        <p className="max-w-2xl text-[15px] leading-7 text-ink-soft">
          {company.description}
        </p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {company.services.map((service) => (
            <li
              key={service}
              className="border border-line bg-paper px-2.5 py-1 text-[12px] font-medium text-ink-soft"
            >
              {service}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

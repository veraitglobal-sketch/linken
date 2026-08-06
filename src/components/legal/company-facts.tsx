import {
  getLegalCompany,
  type LegalCompany,
} from "@/lib/legal/company";

const PLACEHOLDER = "Required before production";

type Row = { label: string; value: string | null; required?: boolean };

function rows(c: LegalCompany): Row[] {
  return [
    { label: "Legal name", value: c.entityName, required: true },
    { label: "Registered address", value: c.address, required: true },
    { label: "Country", value: c.country, required: true },
    {
      label: "Register court",
      value: c.registrationNumber,
      required: true,
    },
    { label: "VAT ID", value: c.vatId },
    { label: "Phone", value: c.phone },
    { label: "Business email", value: c.contactEmail },
  ];
}

/** Definition list of legal entity fields — placeholders when unset. */
export function CompanyFacts() {
  const company = getLegalCompany();

  return (
    <dl className="divide-y divide-line rounded-2xl border border-line">
      {rows(company).map((row) => {
        const empty = !row.value;
        if (empty && !row.required) return null;
        return (
          <div
            key={row.label}
            className="grid gap-1 px-4 py-3.5 sm:grid-cols-[11rem_1fr] sm:gap-6"
          >
            <dt className="text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">
              {row.label}
            </dt>
            <dd
              className={
                empty
                  ? "text-[14px] font-medium text-[#b45309]"
                  : "text-[14px] text-ink"
              }
            >
              {row.value ?? PLACEHOLDER}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

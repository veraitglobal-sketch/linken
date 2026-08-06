import { isLegalComplete, missingLegalFields } from "@/lib/legal/company";

const LABELS: Record<string, string> = {
  entityName: "Legal company name",
  address: "Registered address",
  country: "Country",
  registrationNumber: "Registration number",
};

/** Visible when required NEXT_PUBLIC_LEGAL_* fields are unset. */
export function PlaceholderNotice() {
  if (isLegalComplete()) return null;
  const missing = missingLegalFields().map((k) => LABELS[k] ?? k);

  return (
    <aside
      className="rounded-2xl border border-[#b45309]/35 bg-[#fff7ed] px-4 py-4 text-[13.5px] leading-relaxed text-ink"
      role="status"
    >
      <p className="font-semibold text-ink">Required before production</p>
      <p className="mt-1.5 text-ink-soft">
        Legal entity details are not configured yet. Set the matching{" "}
        <code className="text-[12px]">NEXT_PUBLIC_LEGAL_*</code> environment
        variables. Missing: {missing.join(", ")}.
      </p>
    </aside>
  );
}

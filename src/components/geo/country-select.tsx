"use client";

import { ISO_COUNTRIES } from "@/features/geo/countries";

type Props = {
  defaultCode?: string | null;
  defaultName?: string;
  className?: string;
  required?: boolean;
};

export function CountrySelect({
  defaultCode,
  defaultName = "Germany",
  className,
  required,
}: Props) {
  const selected =
    defaultCode && ISO_COUNTRIES.some((c) => c.code === defaultCode)
      ? defaultCode
      : ISO_COUNTRIES.find((c) => c.name === defaultName)?.code ?? "DE";

  return (
    <select name="country_code" required={required} defaultValue={selected} className={className}>
      {ISO_COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  );
}

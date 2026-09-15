"use client";

import { useState } from "react";
import {
  ORGANIZATION_KIND_META,
  type OrganizationKind,
} from "@/features/company/organization-kind";

type Props = {
  defaultKind?: OrganizationKind;
};

/** First choice on onboarding — what the organization is. */
export function OrganizationKindField({ defaultKind = "company" }: Props) {
  const [kind, setKind] = useState<OrganizationKind>(defaultKind);
  const hint =
    ORGANIZATION_KIND_META.find((k) => k.id === kind)?.categoryHint ?? "";

  return (
    <div>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-ink">
          Organization type
        </span>
        <span className="relative block">
          <select
            name="organization_kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as OrganizationKind)}
            className="h-11 w-full appearance-none rounded-lg border border-line bg-surface pr-10 pl-3.5 text-[15px] text-ink outline-none transition-colors focus:border-navy focus:ring-2 focus:ring-navy/10"
          >
            {ORGANIZATION_KIND_META.map((k) => (
              <option key={k.id} value={k.id}>
                {k.label}
              </option>
            ))}
          </select>
          <svg
            aria-hidden
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted"
          >
            <path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </label>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
        Sector example: {hint} Mutual confirmation works the same for every type.
      </p>
    </div>
  );
}

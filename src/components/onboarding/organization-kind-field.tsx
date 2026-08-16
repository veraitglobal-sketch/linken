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
    <div className="space-y-2">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">
          Organization type
        </span>
        <select
          name="organization_kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as OrganizationKind)}
          className="h-11 w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink outline-none transition-colors focus:border-[#1a5c51] focus:ring-2 focus:ring-[rgba(31,107,92,0.15)]"
        >
          {ORGANIZATION_KIND_META.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
      </label>
      <p className="text-[12px] leading-relaxed text-muted">
        Sector example: {hint} Mutual confirmation works the same for every type.
      </p>
    </div>
  );
}

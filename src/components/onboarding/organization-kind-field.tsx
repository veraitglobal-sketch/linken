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
        <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
          Organization type
        </span>
        <select
          name="organization_kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as OrganizationKind)}
          className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink outline-none transition-colors focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]"
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

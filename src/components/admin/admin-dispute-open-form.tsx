"use client";

import { useState, useTransition } from "react";
import { adminOpenDispute } from "@/features/admin/actions-disputes";

const RECORD_TYPES = [
  "testimonial",
  "service_reference",
  "partnership",
  "case_study_confirmation",
] as const;

/**
 * Staff-side stopgap: hides a record immediately given raw IDs.
 * A customer-facing "dispute this" flow is a later addition.
 */
export function AdminDisputeOpenForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminOpenDispute(fd);
      setMessage(res.ok ? "Dispute opened — record hidden." : (res.error ?? "Failed."));
      if (res.ok) e.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-[13px] font-semibold text-ink">Open a dispute</h3>
      <select
        name="recordType"
        required
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
      >
        {RECORD_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        name="recordId"
        required
        placeholder="Record ID"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
      />
      <input
        name="claimantCompanyId"
        required
        placeholder="Claimant company ID"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
      />
      <input
        name="counterpartyCompanyId"
        placeholder="Counterparty company ID (optional)"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
      />
      <textarea
        name="claim"
        required
        placeholder="What is being disputed?"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
      />
      <input
        name="reason"
        required
        placeholder="Reason (required)"
        className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
      />
      {message ? <p className="text-[12px] text-ink-soft">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-paper disabled:opacity-50"
      >
        Hide & open dispute
      </button>
    </form>
  );
}

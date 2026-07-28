"use client";

import { useState, useTransition } from "react";
import { adminResetRateLimit } from "@/features/admin/actions-email";

const LIMIT_TYPES = [
  { value: "domain_verification_email", label: "Domain verification send (key: email)" },
  { value: "domain_verification_discovery", label: "Domain discovery (key: company ID)" },
  { value: "testimonial_confirm_ensure", label: "Testimonial confirm ensure (key: confirm token)" },
] as const;

export function AdminRateLimitForm() {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminResetRateLimit(fd);
      setMessage(res.ok ? "Reset." : (res.error ?? "Failed."));
      if (res.ok) e.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-[13px] font-semibold text-ink">Reset a rate limit</h3>
      <div className="mt-3 space-y-2">
        <select
          name="limitType"
          required
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
        >
          {LIMIT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input
          name="key"
          required
          placeholder="Key value"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
        />
        <input
          name="reason"
          required
          placeholder="Reason (required)"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-paper disabled:opacity-50"
        >
          Reset
        </button>
      </div>
      {message ? <p className="mt-2 text-[12px] text-ink-soft">{message}</p> : null}
    </form>
  );
}

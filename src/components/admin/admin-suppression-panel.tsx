"use client";

import { useState, useTransition } from "react";
import {
  adminAddSuppression,
  adminRemoveSuppression,
} from "@/features/admin/actions-email";
import type { EmailSuppressionRow } from "@/features/admin/email-ops";

type Props = { rows: EmailSuppressionRow[] };

export function AdminSuppressionPanel({ rows }: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminAddSuppression(fd);
      setMessage(res.ok ? "Added." : (res.error ?? "Failed."));
      if (res.ok) e.currentTarget.reset();
    });
  }

  function onRemove(id: string) {
    const reason = window.prompt("Reason for removing this suppression?");
    if (!reason?.trim()) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("reason", reason);
    start(async () => {
      const res = await adminRemoveSuppression(fd);
      setMessage(res.ok ? "Removed." : (res.error ?? "Failed."));
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <h3 className="text-[13px] font-semibold text-ink">Suppressions</h3>
      <p className="mt-1 text-[12px] text-muted">
        Addresses or domains that are never mailed.
      </p>

      <form onSubmit={onAdd} className="mt-3 flex flex-wrap gap-2">
        <select name="kind" className="rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px]">
          <option value="address">address</option>
          <option value="domain">domain</option>
        </select>
        <input
          name="value"
          required
          placeholder="value"
          className="min-w-[180px] flex-1 rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px]"
        />
        <input
          name="reason"
          required
          placeholder="Reason (required)"
          className="min-w-[180px] flex-1 rounded-lg border border-line bg-paper px-2 py-1.5 text-[12px]"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-paper disabled:opacity-50"
        >
          Add
        </button>
      </form>
      {message ? <p className="mt-2 text-[12px] text-ink-soft">{message}</p> : null}

      <ul className="mt-3 divide-y divide-line/60 text-[12px] text-ink-soft">
        {rows.length === 0 ? (
          <li className="py-2">No suppressions.</li>
        ) : (
          rows.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-2 py-2">
              <span>
                <span className="font-semibold text-ink">{r.kind}</span> {r.value}
                {r.reason ? ` · ${r.reason}` : ""}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => onRemove(r.id)}
                className="shrink-0 text-[11px] font-semibold text-ember hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

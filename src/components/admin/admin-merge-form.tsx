"use client";

import { useState, useTransition } from "react";
import { adminMergeCompanies } from "@/features/admin/actions-merge";
import type { DuplicateCandidate } from "@/features/admin/duplicates";

type Props = { companies: DuplicateCandidate[] };

export function AdminMergeForm({ companies }: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState(companies[0]?.id ?? "");
  const [loserId, setLoserId] = useState(companies[1]?.id ?? "");

  const loser = companies.find((c) => c.id === loserId);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await adminMergeCompanies(fd);
      if (res.ok) {
        const conflictNote = res.conflicts.length
          ? ` (${res.conflicts.length} conflict${res.conflicts.length === 1 ? "" : "s"} logged in audit log)`
          : "";
        setMessage(`Merged.${conflictNote}`);
      } else {
        setMessage(res.error ?? "Merge failed.");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-2 rounded-xl border border-line bg-paper p-3"
    >
      <input type="hidden" name="winnerId" value={winnerId} />
      <input type="hidden" name="loserId" value={loserId} />

      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-[12px] text-ink-soft">
          Keep (winner)
          <select
            value={winnerId}
            onChange={(e) => setWinnerId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px]"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.claimed ? "claimed" : "unclaimed"})
              </option>
            ))}
          </select>
        </label>
        <label className="text-[12px] text-ink-soft">
          Merge away (loser)
          <select
            value={loserId}
            onChange={(e) => setLoserId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px]"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.claimed ? "claimed" : "unclaimed"})
              </option>
            ))}
          </select>
        </label>
      </div>

      <input
        name="confirmName"
        required
        placeholder={loser ? `Type "${loser.name}" to confirm` : "Select a company to merge away"}
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px]"
      />
      <input
        name="reason"
        required
        placeholder="Reason (required)"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px]"
      />
      {message ? <p className="text-[12px] text-ink-soft">{message}</p> : null}
      <button
        type="submit"
        disabled={pending || winnerId === loserId}
        className="rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-paper disabled:opacity-50"
      >
        Merge
      </button>
    </form>
  );
}

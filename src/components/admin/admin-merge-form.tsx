"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { adminMergeCompanies } from "@/features/admin/actions-merge";
import type { DuplicateCandidate } from "@/features/admin/duplicates";

type Props = {
  companies: DuplicateCandidate[];
  defaultWinnerId?: string;
};

export function AdminMergeForm({ companies, defaultWinnerId }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const preferred =
    defaultWinnerId && companies.some((c) => c.id === defaultWinnerId)
      ? defaultWinnerId
      : companies[0]?.id ?? "";
  const [winnerId, setWinnerId] = useState(preferred);
  const [loserId, setLoserId] = useState(
    companies.find((c) => c.id !== preferred)?.id ?? companies[1]?.id ?? "",
  );

  const loser = companies.find((c) => c.id === loserId);

  if (done) {
    return (
      <p className="rounded-xl border border-line bg-paper px-3 py-2.5 text-[13px] text-ink-soft">
        Merged into the kept profile. This duplicate is closed.
      </p>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const typed = String(fd.get("confirmName") ?? "").trim();
    if (!loser || typed !== loser.name) {
      setMessage(
        loser
          ? `Type the exact name to confirm: ${loser.name}`
          : "Select a company to merge away.",
      );
      return;
    }
    start(async () => {
      const res = await adminMergeCompanies(fd);
      if (res.ok) {
        const n = res.conflicts.length;
        setMessage(
          n
            ? `Merged. ${n} row${n === 1 ? "" : "s"} could not move — see Audit.`
            : "Merged.",
        );
        setDone(true);
        router.refresh();
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
            onChange={(e) => {
              setLoserId(e.target.value);
              setMessage(null);
            }}
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

      <p className="text-[11px] text-muted">
        Confirm by typing the merge-away name exactly
        {loser ? (
          <>
            : <span className="font-semibold text-ink">{loser.name}</span>
          </>
        ) : null}
        .
      </p>
      <input
        name="confirmName"
        required
        autoComplete="off"
        placeholder={loser ? loser.name : "Select a company to merge away"}
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
        {pending ? "Merging…" : "Merge"}
      </button>
    </form>
  );
}

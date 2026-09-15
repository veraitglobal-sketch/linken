"use client";

import { useState } from "react";

const field =
  "w-full rounded-none border border-line bg-paper px-3 py-2 text-[13px]";

type Props = {
  companyName: string;
  partnersCount: number;
  pending: boolean;
  onSubmit: (form: HTMLFormElement) => void;
};

export function AdminCompanyRemoveForm({
  companyName,
  partnersCount,
  pending,
  onSubmit,
}: Props) {
  const blocked = partnersCount > 0;
  const [mismatch, setMismatch] = useState(false);

  return (
    <form
      className="space-y-2 rounded-none border border-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const typed = (
          e.currentTarget.elements.namedItem("confirmName") as HTMLInputElement
        ).value;
        if (typed.trim() !== companyName) {
          setMismatch(true);
          return;
        }
        setMismatch(false);
        onSubmit(e.currentTarget);
      }}
    >
      <p className="text-[12px] font-semibold text-ink">Delete company row</p>
      <p className="text-[11px] text-muted">
        {blocked
          ? "Confirmed partners exist. Hide instead — deleting would take the other side’s record with it."
          : "Permanent. Only available when there are no confirmed partners."}
      </p>
      {blocked ? null : (
        <>
          <input
            name="confirmName"
            required
            placeholder={`Type “${companyName}” to confirm`}
            className={field}
          />
          <input
            name="reason"
            required
            placeholder="Reason (required)"
            className={field}
          />
          {mismatch ? (
            <p className="text-[11px] text-ink-soft">Type the exact company name.</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink disabled:opacity-50"
          >
            Delete
          </button>
        </>
      )}
    </form>
  );
}

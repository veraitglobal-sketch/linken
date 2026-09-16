"use client";

import { useState, useTransition } from "react";
import { adminDeleteUserAccount } from "@/features/admin/actions-account";

const field =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]";

type Props = {
  companyId: string;
  ownerEmail: string;
  canDelete: boolean;
};

export function AdminDeleteLoginForm({
  companyId,
  ownerEmail,
  canDelete,
}: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!canDelete) {
    return (
      <p className="text-[13px] text-muted">
        Deleting a login requires the owner staff role.
      </p>
    );
  }

  return (
    <form
      className="space-y-2 rounded-xl border border-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        fd.set("companyId", companyId);
        start(async () => {
          const res = await adminDeleteUserAccount(fd);
          setMessage(res.ok ? "Login deleted." : (res.error ?? "Failed."));
        });
      }}
    >
      <p className="text-[12px] font-semibold text-ink">Delete login</p>
      <p className="text-[11px] text-muted">
        Hides every company this person owns, clears ownership, then deletes the
        Auth account ({ownerEmail}). Confirmed partner records stay on the
        companies (hidden).
      </p>
      <input
        name="confirmEmail"
        type="email"
        required
        placeholder={`Type ${ownerEmail} to confirm`}
        className={field}
      />
      <input
        name="reason"
        required
        placeholder="Reason (required)"
        className={field}
      />
      {message ? <p className="text-[12px] text-ink-soft">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-line px-3 py-1.5 text-[12px] font-semibold text-ink disabled:opacity-50"
      >
        Delete login
      </button>
    </form>
  );
}

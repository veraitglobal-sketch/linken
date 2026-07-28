"use client";

import { useState, useTransition } from "react";
import { revokeVerification } from "@/features/admin/actions-verification";
import { AdminVerificationGrantForm } from "@/components/admin/admin-verification-grant-form";
import type { AdminVerificationRow } from "@/features/admin/verification-ops";

type Props = {
  row: AdminVerificationRow;
  canRevoke: boolean;
  canGrant: boolean;
};

export function AdminVerificationRowActions({ row, canRevoke, canGrant }: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!canRevoke && !canGrant) {
    return <span className="text-[12px] text-muted">View only</span>;
  }

  return (
    <div className="space-y-2">
      {message ? <p className="text-[11px] text-ink-soft">{message}</p> : null}

      {canRevoke && row.companyVerified ? (
        <form
          className="flex items-center gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set("companyId", row.companyId);
            start(async () => {
              const res = await revokeVerification(fd);
              setMessage(res.ok ? "Revoked." : (res.error ?? "Failed."));
            });
          }}
        >
          <input
            name="reason"
            required
            placeholder="Reason (required)"
            className="w-36 rounded-lg border border-line bg-paper px-2 py-1 text-[12px]"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-navy px-2 py-1 text-[11px] font-semibold text-paper disabled:opacity-50"
          >
            Revoke
          </button>
        </form>
      ) : null}

      {canGrant ? (
        <AdminVerificationGrantForm
          row={row}
          pending={pending}
          start={start}
          setMessage={setMessage}
        />
      ) : null}
    </div>
  );
}

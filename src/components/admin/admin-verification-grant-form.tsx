"use client";

import { useState } from "react";
import { grantVerification } from "@/features/admin/actions-verification";
import type { AdminVerificationRow } from "@/features/admin/verification-ops";

type Props = {
  row: AdminVerificationRow;
  pending: boolean;
  start: (callback: () => void | Promise<void>) => void;
  setMessage: (msg: string) => void;
};

export function AdminVerificationGrantForm({ row, pending, start, setMessage }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-semibold text-ember underline-offset-2 hover:underline"
      >
        Grant manually…
      </button>
    );
  }

  return (
    <form
      className="w-56 space-y-1 rounded-lg border border-line p-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const typed = (
          form.elements.namedItem("confirmName") as HTMLInputElement
        ).value;
        if (typed.trim() !== row.companyName) {
          setMessage("Type the exact company name to confirm.");
          return;
        }
        const fd = new FormData(form);
        fd.set("companyId", row.companyId);
        start(async () => {
          const res = await grantVerification(fd);
          setMessage(res.ok ? "Granted." : (res.error ?? "Failed."));
          if (res.ok) setOpen(false);
        });
      }}
    >
      <p className="text-[11px] font-semibold text-ink">
        Manual grant bypasses domain proof — rare, confirm carefully.
      </p>
      <select
        name="method"
        defaultValue="dns_txt"
        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[12px]"
      >
        <option value="email_domain">email_domain</option>
        <option value="dns_txt">dns_txt</option>
        <option value="meta_tag">meta_tag</option>
      </select>
      <input
        name="confirmName"
        required
        placeholder={`Type “${row.companyName}” to confirm`}
        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[12px]"
      />
      <input
        name="reason"
        required
        placeholder="Reason (required)"
        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[12px]"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-2 py-1 text-[11px] font-semibold text-paper disabled:opacity-50"
        >
          Grant
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

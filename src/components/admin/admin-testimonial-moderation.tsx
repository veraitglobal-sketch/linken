"use client";

import { useState, useTransition } from "react";
import {
  adminHideTestimonial,
  adminUnhideTestimonial,
} from "@/features/admin/actions-testimonials";

type Props = { id: string; status: string };

export function AdminTestimonialModeration({ id, status }: Props) {
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function run(action: (fd: FormData) => Promise<{ ok: boolean; error?: string; note?: string }>) {
    if (!reason.trim()) {
      setMessage("Reason is required.");
      return;
    }
    const fd = new FormData();
    fd.set("id", id);
    fd.set("reason", reason);
    start(async () => {
      const res = await action(fd);
      setMessage(res.ok ? (res.note ?? "Saved.") : (res.error ?? "Failed."));
      if (res.ok) setReason("");
    });
  }

  return (
    <div className="space-y-1.5">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required)"
        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[12px]"
      />
      <div className="flex gap-1.5">
        {status !== "withdrawn" ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(adminHideTestimonial)}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink disabled:opacity-50"
          >
            Hide
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(adminUnhideTestimonial)}
            className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink disabled:opacity-50"
          >
            Unhide
          </button>
        )}
      </div>
      {message ? <p className="text-[11px] text-muted">{message}</p> : null}
    </div>
  );
}

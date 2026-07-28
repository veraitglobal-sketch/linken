"use client";

import { useState, useTransition } from "react";
import { adminResolveDispute } from "@/features/admin/actions-disputes";

type Props = { disputeId: string };

export function AdminDisputeResolve({ disputeId }: Props) {
  const [pending, start] = useTransition();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  function run(decision: "confirm" | "remove") {
    if (!reason.trim()) {
      setMessage("Reason is required.");
      return;
    }
    const fd = new FormData();
    fd.set("disputeId", disputeId);
    fd.set("decision", decision);
    fd.set("reason", reason);
    start(async () => {
      const res = await adminResolveDispute(fd);
      setMessage(res.ok ? "Resolved." : (res.error ?? "Failed."));
    });
  }

  return (
    <div className="space-y-1.5">
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Resolution reason (required)"
        className="w-full rounded-lg border border-line bg-paper px-2 py-1 text-[12px]"
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() => run("confirm")}
          className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink disabled:opacity-50"
        >
          Confirm (restore)
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => run("remove")}
          className="rounded-full border border-line px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:text-ink disabled:opacity-50"
        >
          Remove (stay hidden)
        </button>
      </div>
      {message ? <p className="text-[11px] text-muted">{message}</p> : null}
    </div>
  );
}

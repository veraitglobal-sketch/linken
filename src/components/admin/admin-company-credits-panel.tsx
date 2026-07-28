"use client";

import { useState, useTransition } from "react";
import {
  adminGrantCredits,
  adminSetPlan,
  adminToggleRadar,
} from "@/features/admin/actions-credits";

type Props = {
  companyId: string;
  companyName: string;
  radar: boolean;
  plan: string;
  canWrite: boolean;
};

export function AdminCompanyCreditsPanel({
  companyId,
  companyName,
  radar,
  plan,
  canWrite,
}: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!canWrite) {
    return (
      <p className="text-[13px] text-muted">
        Credits and plan changes require admin role.
      </p>
    );
  }

  function run(
    fn: (fd: FormData) => Promise<{ ok: boolean; error?: string }>,
    form: HTMLFormElement,
  ) {
    const fd = new FormData(form);
    fd.set("companyId", companyId);
    start(async () => {
      const res = await fn(fd);
      setMessage(res.ok ? "Saved." : (res.error ?? "Failed."));
      if (res.ok) form.reset();
    });
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="text-[13px] text-ink-soft">{message}</p>
      ) : null}

      <form
        className="space-y-2 rounded-xl border border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(adminGrantCredits, e.currentTarget);
        }}
      >
        <p className="text-[12px] font-semibold text-ink">Grant credits</p>
        <input
          name="amount"
          type="number"
          min={1}
          required
          placeholder="Amount"
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
          Grant
        </button>
      </form>

      <form
        className="space-y-2 rounded-xl border border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(adminToggleRadar, e.currentTarget);
        }}
      >
        <p className="text-[12px] font-semibold text-ink">
          Radar is {radar ? "on" : "off"}
        </p>
        <input type="hidden" name="enabled" value={radar ? "false" : "true"} />
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
          {radar ? "Disable Radar" : "Enable Radar"}
        </button>
      </form>

      <form
        className="space-y-2 rounded-xl border border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const typed = (
            e.currentTarget.elements.namedItem("confirmName") as HTMLInputElement
          ).value;
          if (typed.trim() !== companyName) {
            setMessage("Type the exact company name to confirm plan change.");
            return;
          }
          run(adminSetPlan, e.currentTarget);
        }}
      >
        <p className="text-[12px] font-semibold text-ink">
          Change plan (current: {plan})
        </p>
        <p className="text-[11px] text-muted">
          Stripe remains source of truth — webhooks can overwrite this.
        </p>
        <select
          name="plan"
          defaultValue={plan}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]"
        >
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="founding">founding</option>
        </select>
        <input
          name="confirmName"
          required
          placeholder={`Type “${companyName}” to confirm`}
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
          Set plan
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState, useTransition, type ReactNode } from "react";
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

export function AdminCompanyCreditsPanel(props: Props) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!props.canWrite) {
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
    fd.set("companyId", props.companyId);
    start(async () => {
      const res = await fn(fd);
      setMessage(res.ok ? "Saved." : (res.error ?? "Failed."));
      if (res.ok) form.reset();
    });
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-[13px] text-ink-soft">{message}</p> : null}

      <ActionForm
        title="Grant credits"
        pending={pending}
        submitLabel="Grant"
        onSubmit={(form) => run(adminGrantCredits, form)}
      >
        <input
          name="amount"
          type="number"
          min={1}
          required
          placeholder="Amount"
          className={fieldClass}
        />
      </ActionForm>

      <ActionForm
        title={`Radar is ${props.radar ? "on" : "off"}`}
        pending={pending}
        submitLabel={props.radar ? "Disable Radar" : "Enable Radar"}
        onSubmit={(form) => run(adminToggleRadar, form)}
      >
        <input type="hidden" name="enabled" value={props.radar ? "false" : "true"} />
      </ActionForm>

      <ActionForm
        title={`Change plan (current: ${props.plan})`}
        hint="Stripe remains source of truth — webhooks can overwrite this."
        pending={pending}
        submitLabel="Set plan"
        onSubmit={(form) => {
          const typed = (
            form.elements.namedItem("confirmName") as HTMLInputElement
          ).value;
          if (typed.trim() !== props.companyName) {
            setMessage("Type the exact company name to confirm plan change.");
            return;
          }
          run(adminSetPlan, form);
        }}
      >
        <select name="plan" defaultValue={props.plan} className={fieldClass}>
          <option value="free">free</option>
          <option value="pro">pro</option>
          <option value="founding">founding</option>
        </select>
        <input
          name="confirmName"
          required
          placeholder={`Type “${props.companyName}” to confirm`}
          className={fieldClass}
        />
      </ActionForm>
    </div>
  );
}

const fieldClass =
  "w-full rounded-lg border border-line bg-paper px-3 py-2 text-[13px]";

function ActionForm({
  title,
  hint,
  pending,
  submitLabel,
  onSubmit,
  children,
}: {
  title: string;
  hint?: string;
  pending: boolean;
  submitLabel: string;
  onSubmit: (form: HTMLFormElement) => void;
  children?: ReactNode;
}) {
  return (
    <form
      className="space-y-2 rounded-xl border border-line p-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e.currentTarget);
      }}
    >
      <p className="text-[12px] font-semibold text-ink">{title}</p>
      {hint ? <p className="text-[11px] text-muted">{hint}</p> : null}
      {children}
      <input
        name="reason"
        required
        placeholder="Reason (required)"
        className={fieldClass}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-paper disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}

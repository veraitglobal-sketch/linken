"use client";

import { useState, useTransition } from "react";
import { AdminCompanyRemoveForm } from "@/components/admin/admin-company-remove-form";
import {
  adminHideCompany,
  adminRemoveCompany,
  adminUnhideCompany,
} from "@/features/admin/actions-company";

const field =
  "w-full rounded-none border border-line bg-paper px-3 py-2 text-[13px]";

type Props = {
  companyId: string;
  companyName: string;
  hiddenAt: string | null;
  partnersCount: number;
  canHide: boolean;
  canRemove: boolean;
};

export function AdminCompanyVisibility(props: Props) {
  const hidden = Boolean(props.hiddenAt);
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

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

  if (!props.canHide && !props.canRemove) {
    return (
      <p className="text-[13px] text-muted">
        Hiding or removing a profile requires admin role.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {message ? <p className="text-[13px] text-ink-soft">{message}</p> : null}
      <p className="text-[13px] text-ink-soft">
        {hidden
          ? "Public visitors currently see no file for this company."
          : "The public profile is listed."}
      </p>
      {props.canHide ? (
        <form
          className="space-y-2 rounded-none border border-line p-3"
          onSubmit={(e) => {
            e.preventDefault();
            run(hidden ? adminUnhideCompany : adminHideCompany, e.currentTarget);
          }}
        >
          <p className="text-[12px] font-semibold text-ink">
            {hidden ? "Restore public profile" : "Hide public profile"}
          </p>
          <p className="text-[11px] text-muted">
            Hide removes search, the public URL, and partner lists. The
            workspace stays. Author text is not rewritten.
          </p>
          <input name="reason" required placeholder="Reason (required)" className={field} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-full bg-navy px-3 py-1.5 text-[12px] font-semibold text-paper disabled:opacity-50"
          >
            {hidden ? "Restore" : "Hide"}
          </button>
        </form>
      ) : null}
      {props.canRemove ? (
        <AdminCompanyRemoveForm
          companyName={props.companyName}
          partnersCount={props.partnersCount}
          pending={pending}
          onSubmit={(form) => run(adminRemoveCompany, form)}
        />
      ) : null}
    </div>
  );
}

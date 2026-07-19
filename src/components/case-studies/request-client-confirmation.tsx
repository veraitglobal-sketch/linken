"use client";

import { useState } from "react";
import { requestClientConfirmation } from "@/features/case-studies/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  companySlug: string;
  caseSlug: string;
};

export function RequestClientConfirmation({ companySlug, caseSlug }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="secondary"
        className="h-10"
        onClick={() => setOpen(true)}
      >
        Request confirmation
      </Button>
    );
  }

  return (
    <form
      action={requestClientConfirmation}
      className="w-full max-w-md rounded-[20px] border border-line bg-[#f7f8fa] p-4"
    >
      <input type="hidden" name="companySlug" value={companySlug} />
      <input type="hidden" name="caseSlug" value={caseSlug} />
      <p className="text-[11px] font-semibold tracking-[0.12em] text-ember uppercase">
        Client confirmation
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        Ask the client company to confirm this project was delivered for them.
      </p>
      <label className="mt-3 block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          Client email
        </span>
        <Input
          type="email"
          name="email"
          required
          placeholder="client@company.com"
          className="h-10"
        />
      </label>
      <div className="mt-3 flex gap-2">
        <Button type="submit" className="h-10">
          Send request
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-10"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

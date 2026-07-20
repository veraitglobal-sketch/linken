"use client";

import { useState } from "react";
import { addReference } from "@/features/references/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddReferenceForm() {
  const [open, setOpen] = useState(false);
  const [ongoing, setOngoing] = useState(true);

  if (!open) {
    return (
      <Button type="button" variant="secondary" className="h-10" onClick={() => setOpen(true)}>
        Add a reference
      </Button>
    );
  }

  return (
    <form
      action={addReference}
      className="rounded-[24px] border border-line bg-[#f7f8fa] px-4 py-5 sm:px-5"
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        New reference
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        Confirmation comes only from the client — never self-marked.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">Client name</span>
          <Input name="client_name" required placeholder="Client company name" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">Service</span>
          <Input name="service" required placeholder="Office cleaning" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">Started year</span>
          <Input name="started_year" required placeholder="2019" />
        </label>
        <label className="flex items-end gap-2 pb-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={ongoing}
            onChange={(e) => setOngoing(e.target.checked)}
            className="size-4 rounded border-line"
          />
          Ongoing
          <input type="hidden" name="ongoing" value={ongoing ? "true" : "false"} />
        </label>
        {!ongoing ? (
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">Ended year</span>
            <Input name="ended_year" placeholder="2023" />
          </label>
        ) : null}
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Client email (for confirmation)
          </span>
          <Input type="email" name="invite_email" placeholder="client@company.com" />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Client website (optional)
          </span>
          <Input name="website" type="url" placeholder="https://" />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-ink sm:col-span-2">
          <input type="checkbox" name="create_ghost" className="size-4 rounded border-line" />
          Also create an unclaimed draft profile for this client
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" className="h-10">
          Save reference
        </Button>
        <Button type="button" variant="ghost" className="h-10" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

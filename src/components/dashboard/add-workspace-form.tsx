"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  claimWorkspaceFromLookup,
  lookupWorkspaceForAdd,
  type LookupState,
} from "@/features/workspace/add-workspace-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: LookupState = { status: "idle" };

export function AddWorkspaceForm({ error }: { error?: string }) {
  const [state, action, pending] = useActionState(lookupWorkspaceForAdd, initial);

  return (
    <div className="space-y-5">
      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-[13px] text-ink">
          {error}
        </p>
      ) : null}

      <form action={action} className="space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Work email for the company
          </span>
          <Input
            type="email"
            name="email"
            required
            placeholder="owner@company.com"
            defaultValue={
              state.status === "claim" ||
              state.status === "missing" ||
              state.status === "owned"
                ? state.email
                : undefined
            }
          />
        </label>
        <Button type="submit" className="h-10 w-full" disabled={pending}>
          {pending ? "Looking up…" : "Look up workspace"}
        </Button>
      </form>

      {state.status === "error" ? (
        <p className="text-[13px] text-ember">{state.message}</p>
      ) : null}

      {state.status === "claim" ? (
        <div className="rounded-2xl border border-line bg-paper/70 px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
            Claim the business
          </p>
          <p className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink">
            {state.companyName}
          </p>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            A draft profile is waiting for this email. Claim it to open a
            workspace you own.
          </p>
          <form action={claimWorkspaceFromLookup} className="mt-4">
            <input type="hidden" name="token" value={state.claimToken} />
            <Button type="submit" className="h-10 w-full">
              Claim the business
            </Button>
          </form>
        </div>
      ) : null}

      {state.status === "owned" ? (
        <div className="rounded-2xl border border-line bg-paper/70 px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
            Already yours
          </p>
          <p className="mt-2 text-[14px] text-ink-soft">
            You already own{" "}
            <span className="font-semibold text-ink">{state.companyName}</span>.
            Switch to it in the workspace menu, or create another company below.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-white"
          >
            Create another workspace
          </Link>
        </div>
      ) : null}

      {state.status === "missing" ? (
        <div className="rounded-2xl border border-line bg-paper/70 px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
            No workspace yet
          </p>
          <p className="mt-2 text-[14px] text-ink-soft">
            No draft or company matched{" "}
            <span className="font-semibold text-ink">{state.email}</span>. Create
            a workspace to own it.
          </p>
          <Link
            href="/onboarding"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-navy text-[13px] font-semibold text-white"
          >
            Create workspace
          </Link>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition, type FormEvent } from "react";
import { inviteTeamMemberFromPanel } from "@/features/team/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  companyId: string;
  canInviteAdmin: boolean;
  onSent: (email: string) => void;
  onCancel: () => void;
};

export function GraphInviteTeamForm({
  companyId,
  canInviteAdmin,
  onSent,
  onCancel,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("first_name") ?? "");
    const lastName = String(fd.get("last_name") ?? "");
    const title = String(fd.get("title") ?? "");
    const email = String(fd.get("email") ?? "");
    const roleRaw = String(fd.get("role") ?? "member");
    const role =
      canInviteAdmin && roleRaw === "admin" ? "admin" : "member";

    setError(null);
    startTransition(async () => {
      const result = await inviteTeamMemberFromPanel({
        companyId,
        firstName,
        lastName,
        title,
        email,
        role,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onSent(result.email);
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-2 space-y-2.5 rounded-xl border border-line bg-[#f7f8fa] px-3 py-3"
    >
      <p className="text-[12px] font-semibold text-ink">Invite a teammate</p>
      <p className="text-[11px] text-[#64748b]">
        They join after accepting the email link. Public profile stays off until
        they opt in.
      </p>
      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">
            First name
          </span>
          <Input name="first_name" required className="h-9 text-[13px]" />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-ink">
            Last name
          </span>
          <Input name="last_name" required className="h-9 text-[13px]" />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-ink">
          Title / Position
        </span>
        <Input
          name="title"
          placeholder="Operations lead"
          className="h-9 text-[13px]"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-ink">
          Email
        </span>
        <Input
          type="email"
          name="email"
          required
          placeholder="ana@company.com"
          className="h-9 text-[13px]"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] font-medium text-ink">Role</span>
        <select
          name="role"
          defaultValue="member"
          className="h-9 w-full rounded-xl border border-[#e6eaf0] bg-white px-3 text-[13px] text-ink"
        >
          <option value="member">Member</option>
          {canInviteAdmin ? <option value="admin">Admin</option> : null}
        </select>
      </label>
      {error ? (
        <p className="text-[11px] font-medium text-[#b45309]">{error}</p>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={pending}
          className="h-9 flex-1 text-[12px]"
        >
          {pending ? "Sending…" : "Send invite"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          className="h-9 text-[12px]"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

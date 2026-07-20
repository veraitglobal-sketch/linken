"use client";

import { useState } from "react";
import { inviteTeamMember } from "@/features/team/actions";
import { SectionPermissionsFields } from "@/components/team/section-permissions-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Props = {
  companyId: string;
};

export function InviteTeamForm({ companyId }: Props) {
  const [role, setRole] = useState<"member" | "admin">("member");

  return (
    <WorkspaceCard>
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Invite a teammate
      </h3>
      <p className="mt-0.5 text-[12px] text-[#64748b]">
        They join only after accepting the link. Public visibility defaults to
        off — they choose on join.
      </p>
      <form action={inviteTeamMember} className="mt-4 grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="back" value="/dashboard/team" />
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Name
          </span>
          <Input name="name" required placeholder="Ana Petrović" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Title
          </span>
          <Input name="title" placeholder="Operations lead" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Email
          </span>
          <Input
            type="email"
            name="email"
            required
            placeholder="ana@company.com"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Role
          </span>
          <select
            name="role"
            value={role}
            onChange={(e) =>
              setRole(e.target.value === "admin" ? "admin" : "member")
            }
            className="h-11 w-full rounded-xl border border-[#e6eaf0] bg-white px-3 text-[13px] text-ink"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <SectionPermissionsFields visible={role === "member"} />
        <div className="sm:col-span-2">
          <Button type="submit" className="h-10">
            Send invite
          </Button>
        </div>
      </form>
    </WorkspaceCard>
  );
}

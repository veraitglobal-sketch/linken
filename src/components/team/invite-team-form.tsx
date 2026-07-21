"use client";

import { useState } from "react";
import { inviteTeamMember } from "@/features/team/actions";
import { SectionPermissionsFields } from "@/components/team/section-permissions-fields";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type Props = {
  companyId: string;
};

export function InviteTeamForm({ companyId }: Props) {
  const [role, setRole] = useState<"member" | "admin">("member");

  return (
    <section>
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Invite a teammate
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          They join after accepting the email link. Public stays off until they
          opt in.
        </p>
      </header>
      <WorkspaceCard>
        <form action={inviteTeamMember} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="company_id" value={companyId} />
          <input
            type="hidden"
            name="back"
            value="/dashboard/team?tab=people"
          />
          <input type="hidden" name="role" value={role} />

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
          <label className="block sm:col-span-2">
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

          <div className="sm:col-span-2">
            <p className="mb-1.5 text-[12px] font-medium text-ink">Role</p>
            <div className="flex gap-1 rounded-xl border border-line bg-paper/60 p-1">
              {(
                [
                  { id: "member", label: "Member" },
                  { id: "admin", label: "Admin" },
                ] as const
              ).map((opt) => {
                const on = role === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setRole(opt.id)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors",
                      on
                        ? "bg-navy text-white shadow-sm"
                        : "text-ink hover:bg-surface",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-[11px] text-muted">
              {role === "admin"
                ? "Admins can manage team, settings, and invites."
                : "Members see only the sections you select below."}
            </p>
          </div>

          <SectionPermissionsFields visible={role === "member"} />

          <div className="sm:col-span-2">
            <Button type="submit" className="h-10 w-fit px-4">
              Send invite
            </Button>
          </div>
        </form>
      </WorkspaceCard>
    </section>
  );
}

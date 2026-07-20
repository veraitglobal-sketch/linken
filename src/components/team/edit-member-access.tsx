"use client";

import { useState } from "react";
import { updateMemberPermissions } from "@/features/team/actions";
import { SectionPermissionsFields } from "@/components/team/section-permissions-fields";
import { Button } from "@/components/ui/button";
import type { WorkspaceSection } from "@/features/workspace/sections";

type Props = {
  companyId: string;
  userId: string;
  permissions: WorkspaceSection[];
};

export function EditMemberAccess({ companyId, userId, permissions }: Props) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        type="button"
        variant="ghost"
        className="h-8 px-3 text-[11px]"
        onClick={() => setOpen(true)}
      >
        Edit access
      </Button>
    );
  }

  return (
    <form
      action={updateMemberPermissions}
      className="w-full max-w-md space-y-3 rounded-xl border border-[#e8eaee] bg-[#fafbfc] p-3"
    >
      <input type="hidden" name="company_id" value={companyId} />
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="back" value="/dashboard/team" />
      <SectionPermissionsFields
        visible
        defaultPermissions={permissions}
      />
      <div className="flex gap-2">
        <Button type="submit" className="h-8 text-[11px]">
          Save access
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 text-[11px]"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

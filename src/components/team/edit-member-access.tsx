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
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-3.5 text-[12px]"
          onClick={() => setOpen(true)}
        >
          Edit access
        </Button>
      </div>
    );
  }

  return (
    <form
      action={updateMemberPermissions}
      className="space-y-3 rounded-xl border border-line bg-paper/50 p-3.5"
    >
      <input type="hidden" name="company_id" value={companyId} />
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="back" value="/dashboard/team?tab=people" />
      <SectionPermissionsFields visible defaultPermissions={permissions} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" className="h-9 px-3.5 text-[12px]">
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-9 px-3.5 text-[12px]"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

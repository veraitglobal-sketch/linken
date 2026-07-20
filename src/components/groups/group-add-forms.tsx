import type { ReactNode } from "react";
import { StructureSectionHead } from "@/components/dashboard/structure-ui";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createSubsidiary,
  inviteCompanyToGroup,
} from "@/features/groups/actions";
import type { GroupMemberCard } from "@/features/groups/types";
import { cn } from "@/lib/cn";

type Props = {
  groupId: string;
  confirmed: GroupMemberCard[];
  backPath: string;
};

const selectClass =
  "h-11 w-full rounded-xl border border-line bg-surface px-3 text-[13px] text-ink outline-none transition-colors focus:border-blue";

export function GroupAddForms({ groupId, confirmed, backPath }: Props) {
  return (
    <>
      <WorkspaceCard className="overflow-hidden !p-0">
        <StructureSectionHead
          eyebrow="Grow the tree"
          title="Add subsidiary"
          description="Unclaimed branch, auto-confirmed. Optionally nest under a parent."
          tone="soft"
        />
        <form
          action={createSubsidiary}
          className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6"
        >
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="back" value={backPath} />
          <Field label="Name" className="sm:col-span-2">
            <Input name="name" required placeholder="CleanCo Austria" />
          </Field>
          <Field label="Category">
            <Input name="category" required placeholder="Cleaning" />
          </Field>
          <Field label="City">
            <Input name="city" required placeholder="Vienna" />
          </Field>
          <Field label="Country" className="sm:col-span-2">
            <Input name="country" placeholder="Austria" />
          </Field>
          <Field label="Website (optional)" className="sm:col-span-2">
            <Input name="website" type="url" placeholder="https://" />
          </Field>
          <Field label="Parent in group (optional)" className="sm:col-span-2">
            <ParentSelect confirmed={confirmed} />
          </Field>
          <div className="sm:col-span-2">
            <Button type="submit" className="h-10">
              Create subsidiary
            </Button>
          </div>
        </form>
      </WorkspaceCard>

      <WorkspaceCard className="overflow-hidden !p-0">
        <StructureSectionHead
          eyebrow="Existing firm"
          title="Invite company"
          description="They must confirm. Optional parent nests them after confirmation."
          tone="soft"
        />
        <form action={inviteCompanyToGroup} className="space-y-3 px-5 py-5 sm:px-6">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="back" value={backPath} />
          <Field label="Company slug">
            <Input name="company_slug" required placeholder="company-slug" />
          </Field>
          <Field label="Parent in group (optional)">
            <ParentSelect confirmed={confirmed} />
          </Field>
          <Button type="submit" variant="secondary" className="h-10">
            Send invite
          </Button>
        </form>
      </WorkspaceCard>
    </>
  );
}

function ParentSelect({ confirmed }: { confirmed: GroupMemberCard[] }) {
  return (
    <select
      name="parent_company_id"
      className={selectClass}
      defaultValue=""
    >
      <option value="">Directly under group</option>
      {confirmed.map((m) => (
        <option key={m.companyId} value={m.companyId}>
          {m.name}
        </option>
      ))}
    </select>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[12px] font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

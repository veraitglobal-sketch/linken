import type { ReactNode } from "react";
import { GroupSection } from "@/components/groups/group-section";
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
  "h-11 w-full rounded-xl border border-line bg-paper px-3 text-[13px] text-ink outline-none transition-colors focus:border-blue focus:bg-surface";

export function GroupAddForms({ groupId, confirmed, backPath }: Props) {
  return (
    <div className="space-y-10">
      <section>
        <GroupSection
          title="Add a subsidiary"
          description="Creates a new company profile under your group. It starts unclaimed — a local manager can claim it later. Nest under a parent to place it in the tree."
        />
        <WorkspaceCard>
          <form
            action={createSubsidiary}
            className="grid gap-3 sm:grid-cols-2"
          >
            <input type="hidden" name="group_id" value={groupId} />
            <input type="hidden" name="back" value={backPath} />
            <Field label="Branch name" className="sm:col-span-2">
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
            <Field
              label="Parent in the tree (optional)"
              className="sm:col-span-2"
            >
              <ParentSelect confirmed={confirmed} />
            </Field>
            <div className="sm:col-span-2">
              <Button type="submit" className="h-10 w-fit px-4">
                Create subsidiary
              </Button>
            </div>
          </form>
        </WorkspaceCard>
      </section>

      <section>
        <GroupSection
          title="Invite an existing company"
          description="They already have a Hansala profile. They must confirm the invite. After confirmation you can nest them under a parent."
        />
        <WorkspaceCard>
          <form action={inviteCompanyToGroup} className="grid gap-3">
            <input type="hidden" name="group_id" value={groupId} />
            <input type="hidden" name="back" value={backPath} />
            <Field label="Company slug">
              <Input
                name="company_slug"
                required
                placeholder="cleanco-austria"
              />
            </Field>
            <p className="text-[12px] text-muted">
              Find the slug on their public profile URL: linken…/c/
              <span className="font-semibold text-ink">slug</span>
            </p>
            <Field label="Parent in the tree (optional)">
              <ParentSelect confirmed={confirmed} />
            </Field>
            <Button
              type="submit"
              variant="secondary"
              className="h-10 w-fit px-4"
            >
              Send invite
            </Button>
          </form>
        </WorkspaceCard>
      </section>
    </div>
  );
}

function ParentSelect({ confirmed }: { confirmed: GroupMemberCard[] }) {
  return (
    <select name="parent_company_id" className={selectClass} defaultValue="">
      <option value="">Top level under the group</option>
      {confirmed.map((m) => (
        <option key={m.companyId} value={m.companyId}>
          Nest under {m.name}
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
      <span className="mb-1.5 block text-[12px] font-medium text-ink">
        {label}
      </span>
      {children}
    </label>
  );
}

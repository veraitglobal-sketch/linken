import { GroupSection } from "@/components/groups/group-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup } from "@/features/groups/actions";

type Props = { backPath: string };

export function GroupCreateEmpty({ backPath }: Props) {
  return (
    <section>
      <GroupSection
        title="Create your group"
        description="Think of a group as the holding name for your country branches. Each branch keeps its own profile and evidence."
      />
      <WorkspaceCard>
        <form action={createGroup} className="grid gap-3">
          <input type="hidden" name="back" value={backPath} />
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Group name
            </span>
            <Input name="name" required placeholder="CleanCo Group" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Short description
            </span>
            <Input
              name="description"
              placeholder="Multi-country delivery network"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Website (optional)
            </span>
            <Input name="website" type="url" placeholder="https://" />
          </label>
          <p className="text-[12px] text-muted">
            After you create the group, add a subsidiary (new country firm) or
            invite a company that already has a Hansala profile.
          </p>
          <Button type="submit" className="h-10 w-fit px-4">
            Create group
          </Button>
        </form>
      </WorkspaceCard>
    </section>
  );
}

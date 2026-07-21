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
        title="Create a group"
        description="One group for country branches. Evidence stays on each company profile."
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
              Description
            </span>
            <Input
              name="description"
              placeholder="Multi-country delivery network"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Website
            </span>
            <Input name="website" type="url" placeholder="https://" />
          </label>
          <Button type="submit" className="h-10 w-fit px-4">
            Create group
          </Button>
        </form>
      </WorkspaceCard>
    </section>
  );
}

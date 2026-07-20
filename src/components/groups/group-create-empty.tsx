import { StructureSectionHead } from "@/components/dashboard/structure-ui";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup } from "@/features/groups/actions";

type Props = { backPath: string };

export function GroupCreateEmpty({ backPath }: Props) {
  return (
    <WorkspaceCard className="overflow-hidden !p-0">
      <StructureSectionHead
        eyebrow="Company group"
        title="Create a group for your branches"
        description="One group, nested country profiles. Evidence stays on each company."
        tone="soft"
      />
      <form action={createGroup} className="space-y-3 px-5 py-5 sm:px-6">
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
        <Button type="submit" className="h-10">
          Create group
        </Button>
      </form>
    </WorkspaceCard>
  );
}

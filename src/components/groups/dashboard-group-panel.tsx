import { GroupAddForms } from "@/components/groups/group-add-forms";
import { GroupCreateEmpty } from "@/components/groups/group-create-empty";
import { GroupLogoSection } from "@/components/groups/group-logo-section";
import { GroupMembersList } from "@/components/groups/group-members-list";
import { flattenMemberTree } from "@/features/groups/tree";
import type { DashboardGroup } from "@/features/groups/types";

type Props = {
  data: DashboardGroup | null;
  backPath?: string;
  /** Hide members list when a tree is shown elsewhere (e.g. Structure). */
  omitMembers?: boolean;
};

export function DashboardGroupPanel({
  data,
  backPath = "/dashboard/group",
  omitMembers = false,
}: Props) {
  if (!data) return <GroupCreateEmpty backPath={backPath} />;

  const { group, confirmed, tree, pending } = data;
  const flat = flattenMemberTree(tree);
  const initials = group.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-10">
      {!omitMembers ? (
        <GroupMembersList
          groupId={group.id}
          groupName={group.name}
          groupSlug={group.slug}
          members={flat}
          pending={pending}
          backPath={backPath}
        />
      ) : null}
      <GroupLogoSection
        groupId={group.id}
        name={group.name}
        website={group.website}
        logoUrl={group.logoUrl}
        logoSource={group.logoSource}
        initials={initials}
        backPath={backPath}
      />
      <GroupAddForms
        groupId={group.id}
        confirmed={confirmed}
        backPath={backPath}
      />
    </div>
  );
}

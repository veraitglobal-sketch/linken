import Link from "next/link";
import { StructureSectionHead } from "@/components/dashboard/structure-ui";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { GroupAddForms } from "@/components/groups/group-add-forms";
import { GroupCreateEmpty } from "@/components/groups/group-create-empty";
import { GroupLogoSection } from "@/components/groups/group-logo-section";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/ui/logo-tile";
import { endGroupMembership } from "@/features/groups/actions";
import { flattenMemberTree } from "@/features/groups/tree";
import type { DashboardGroup } from "@/features/groups/types";

type Props = {
  data: DashboardGroup | null;
  backPath?: string;
};

export function DashboardGroupPanel({
  data,
  backPath = "/dashboard/group",
}: Props) {
  if (!data) return <GroupCreateEmpty backPath={backPath} />;

  const { group, confirmed, tree, pending } = data;
  const flat = flattenMemberTree(tree);
  const groupInitials = group.name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">
      <WorkspaceCard className="overflow-hidden !p-0">
        <StructureSectionHead
          eyebrow="Your group"
          title={group.name}
          description={`${confirmed.length} confirmed · ${pending.length} pending`}
          tone="soft"
          action={
            <Button href={`/g/${group.slug}`} variant="secondary" className="h-9">
              Public group
            </Button>
          }
        />

        <div className="px-4 py-4 sm:px-5">
          {flat.length > 0 ? (
            <ul className="space-y-1.5">
              {flat.map((m) => (
                <li
                  key={m.companyId}
                  style={{ marginLeft: `${m.depth * 0.65}rem` }}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-paper/60"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <LogoTile
                      name={m.name}
                      initials={m.logoInitials}
                      logoUrl={m.logoUrl}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-ink">
                        {m.name}
                      </p>
                      <p className="truncate text-[11px] text-muted">
                        {m.depth > 0 ? "Subsidiary" : "Root"}
                        {m.city ? ` · ${m.city}` : ""}
                        {m.country ? `, ${m.country}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <Link
                      href={`/c/${m.slug}`}
                      className="inline-flex h-8 items-center rounded-lg px-2.5 text-[12px] font-semibold text-blue hover:bg-accent-soft"
                    >
                      Profile
                    </Link>
                    <form action={endGroupMembership}>
                      <input type="hidden" name="group_id" value={group.id} />
                      <input
                        type="hidden"
                        name="company_id"
                        value={m.companyId}
                      />
                      <input type="hidden" name="back" value={backPath} />
                      <Button
                        type="submit"
                        variant="ghost"
                        className="h-8 px-2.5 text-[12px]"
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-3 text-center text-[13px] text-muted">
              No confirmed members yet.
            </p>
          )}

          {pending.length > 0 ? (
            <div className="mt-4 border-t border-line pt-4">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
                Pending invites
              </p>
              <ul className="mt-2 space-y-1.5">
                {pending.map((p) => (
                  <li
                    key={p.companyId}
                    className="rounded-xl border border-dashed border-line bg-paper/40 px-3 py-2.5 text-[12px] text-muted"
                  >
                    <span className="font-semibold text-ink">{p.name}</span>
                    {p.city ? ` · ${p.city}` : ""} — awaiting confirmation
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </WorkspaceCard>

      <GroupLogoSection
        groupId={group.id}
        name={group.name}
        website={group.website}
        logoUrl={group.logoUrl}
        logoSource={group.logoSource}
        initials={groupInitials}
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

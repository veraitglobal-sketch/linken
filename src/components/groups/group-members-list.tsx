import Link from "next/link";
import { GroupSection } from "@/components/groups/group-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { LogoTile } from "@/components/ui/logo-tile";
import { endGroupMembership } from "@/features/groups/actions";
import type { GroupMemberNode } from "@/features/groups/tree";

type PendingMember = {
  companyId: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  parentCompanyId: string | null;
};

type Props = {
  groupId: string;
  groupName: string;
  groupSlug: string;
  members: GroupMemberNode[];
  pending: PendingMember[];
  backPath: string;
};

export function GroupMembersList({
  groupId,
  groupName,
  groupSlug,
  members,
  pending,
  backPath,
}: Props) {
  return (
    <section>
      <GroupSection
        title={groupName}
        description="Confirmed companies in the ownership tree."
        meta={`${members.length} confirmed · ${pending.length} pending`}
        action={
          <Button
            href={`/g/${groupSlug}`}
            variant="secondary"
            className="h-9 px-3.5 text-[12px]"
          >
            Public group
          </Button>
        }
      />

      <WorkspaceCard padded={false}>
        {members.length === 0 ? (
          <div className="px-5 py-10 text-center sm:px-6">
            <p className="text-[14px] font-medium text-ink">No members yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
              Create a subsidiary or invite an existing company below.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {members.map((m, i) => (
              <li
                key={m.companyId}
                className="linken-widget-enter flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <div
                  className="flex min-w-0 items-center gap-2.5"
                  style={{ marginLeft: `${m.depth * 0.75}rem` }}
                >
                  <LogoTile
                    name={m.name}
                    initials={m.logoInitials}
                    logoUrl={m.logoUrl}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-ink">
                      {m.name}
                    </p>
                    <p className="truncate text-[12px] text-muted">
                      {m.depth > 0 ? "Subsidiary" : "Root"}
                      {m.city ? ` · ${m.city}` : ""}
                      {m.country ? `, ${m.country}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/c/${m.slug}`}
                    className="inline-flex h-8 items-center rounded-lg px-2.5 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    Profile
                  </Link>
                  <form action={endGroupMembership}>
                    <input type="hidden" name="group_id" value={groupId} />
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
        )}

        {pending.length > 0 ? (
          <div className="border-t border-line">
            <p className="px-5 pt-4 text-[10px] font-semibold tracking-[0.12em] text-plus uppercase sm:px-6">
              Pending invites
            </p>
            <ul className="divide-y divide-line">
              {pending.map((p) => (
                <li
                  key={p.companyId}
                  className="px-5 py-3.5 text-[13px] text-muted sm:px-6"
                >
                  <span className="font-semibold text-ink">{p.name}</span>
                  {p.city ? ` · ${p.city}` : ""} — awaiting confirmation
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </WorkspaceCard>
    </section>
  );
}

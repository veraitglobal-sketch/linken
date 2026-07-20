import Link from "next/link";
import { endGroupMembership } from "@/features/groups/actions";
import { flattenMemberTree } from "@/features/groups/tree";
import type { DashboardGroup } from "@/features/groups/types";
import { GroupAddForms } from "@/components/groups/group-add-forms";
import { GroupCreateEmpty } from "@/components/groups/group-create-empty";
import { GroupLogoSection } from "@/components/groups/group-logo-section";
import { Button } from "@/components/ui/button";

type Props = {
  data: DashboardGroup | null;
  /** Where forms redirect after success/error. */
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
      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Your group
            </p>
            <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
              {group.name}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              {confirmed.length} confirmed · {pending.length} pending
            </p>
          </div>
          <Button href={`/g/${group.slug}`} variant="secondary" className="h-10">
            View public page
          </Button>
        </div>

        {flat.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {flat.map((m) => (
              <li
                key={m.companyId}
                style={{ marginLeft: `${m.depth}rem` }}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line px-3 py-2.5"
              >
                <div>
                  <p className="text-[14px] font-medium text-ink">{m.name}</p>
                  <p className="text-[12px] text-ink-soft">
                    {m.city}
                    {m.country ? `, ${m.country}` : ""}
                    {m.depth > 0 ? " · subsidiary" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/c/${m.slug}`}
                    className="text-[12px] font-semibold text-[#1f6b5c] underline-offset-2 hover:underline"
                  >
                    Profile
                  </Link>
                  <form action={endGroupMembership}>
                    <input type="hidden" name="group_id" value={group.id} />
                    <input type="hidden" name="company_id" value={m.companyId} />
                    <input type="hidden" name="back" value={backPath} />
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-9 px-3 text-[12px]"
                    >
                      Remove
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {pending.length > 0 ? (
          <div className="mt-5">
            <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
              Pending invites
            </p>
            <ul className="mt-2 space-y-2">
              {pending.map((p) => (
                <li
                  key={p.companyId}
                  className="rounded-2xl border border-line bg-paper/60 px-3 py-2.5 text-[13px] text-ink-soft"
                >
                  {p.name}
                  {p.city ? ` · ${p.city}` : ""} — awaiting confirmation
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

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

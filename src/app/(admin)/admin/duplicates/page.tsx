import { AdminMergeForm } from "@/components/admin/admin-merge-form";
import { listDuplicateGroups } from "@/features/admin/duplicates";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";

export const metadata = { title: "Admin · Duplicates" };

export default async function AdminDuplicatesPage() {
  const { role } = await requirePlatformStaff("support");
  const canMerge = roleMeetsMinimum(role, "admin");
  const groups = await listDuplicateGroups();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">
          Duplicates
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {groups.length} candidate group{groups.length === 1 ? "" : "s"} sharing a
          website domain across two or more companies.
        </p>
      </div>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-4 text-[13px] text-ink-soft">
          No duplicate candidates found.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section
              key={group.domain}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <h3 className="text-[13px] font-semibold text-ink">{group.domain}</h3>
              <ul className="mt-2 space-y-1 text-[12px] text-ink-soft">
                {group.companies.map((c) => (
                  <li key={c.id}>
                    {c.name} — /{c.slug} ·{" "}
                    {c.claimed ? "claimed" : "unclaimed"}
                    {c.verified ? " · verified" : ""}
                  </li>
                ))}
              </ul>
              {canMerge ? (
                <div className="mt-3">
                  <AdminMergeForm companies={group.companies} />
                </div>
              ) : (
                <p className="mt-3 text-[12px] text-muted">
                  Merging requires admin role.
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

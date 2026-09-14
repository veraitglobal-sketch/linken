import { AdminMergeForm } from "@/components/admin/admin-merge-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
      <AdminPageHeader
        title="Duplicates"
        note={`${groups.length} candidate group${groups.length === 1 ? "" : "s"} sharing a website domain across two or more companies.`}
      />

      {groups.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-5 text-[13px] text-ink-soft">
          No duplicate candidates found.
        </p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section
              key={group.domain}
              className="rounded-card border border-line bg-surface p-5"
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

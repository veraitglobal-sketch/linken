import {
  createSubsidiary,
  endGroupMembership,
} from "@/features/groups/actions";
import type { OwnedGroupMembership } from "@/features/groups/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  memberships: OwnedGroupMembership[];
};

export function OwnedGroupPanel({ memberships }: Props) {
  if (memberships.length === 0) return null;

  return (
    <div className="space-y-4">
      {memberships.map((m) => (
        <section
          key={`${m.groupId}-${m.companyId}`}
          className="rounded-[24px] border border-line bg-surface px-5 py-5"
        >
          <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
            Group membership
          </p>
          <h2 className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink">
            {m.companyName} · {m.groupName}
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Confirmed member. Add a subsidiary under your company, or leave the
            group. Your references stay with your company.
          </p>

          <form action={createSubsidiary} className="mt-4 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="group_id" value={m.groupId} />
            <input type="hidden" name="parent_company_id" value={m.companyId} />
            <input type="hidden" name="back" value="/dashboard" />
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">
                Add subsidiary under you
              </span>
              <Input name="name" required placeholder="Branch name" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">
                Category
              </span>
              <Input name="category" required placeholder="Category" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">
                City
              </span>
              <Input name="city" required placeholder="City" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">
                Country
              </span>
              <Input name="country" placeholder="Country" />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1.5 block text-[13px] font-medium text-ink">
                Website (optional)
              </span>
              <Input name="website" type="url" placeholder="https://" />
            </label>
            <div className="sm:col-span-2">
              <Button type="submit" className="h-10">
                Add subsidiary
              </Button>
            </div>
          </form>

          <form action={endGroupMembership} className="mt-5 border-t border-line pt-4">
            <input type="hidden" name="group_id" value={m.groupId} />
            <input type="hidden" name="company_id" value={m.companyId} />
            <input type="hidden" name="back" value="/dashboard" />
            <p className="text-[12px] leading-relaxed text-ink-soft">
              Leave group: removes {m.companyName} from {m.groupName}&apos;s
              structure. References and confirmations stay with your company.
            </p>
            <Button type="submit" variant="secondary" className="mt-3 h-10">
              Leave group
            </Button>
          </form>
        </section>
      ))}
    </div>
  );
}

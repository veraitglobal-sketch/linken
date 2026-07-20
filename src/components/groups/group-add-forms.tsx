import {
  createSubsidiary,
  inviteCompanyToGroup,
} from "@/features/groups/actions";
import type { GroupMemberCard } from "@/features/groups/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  groupId: string;
  confirmed: GroupMemberCard[];
  backPath: string;
};

export function GroupAddForms({ groupId, confirmed, backPath }: Props) {
  return (
    <>
      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <h3 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Add subsidiary
        </h3>
        <p className="mt-1 text-[13px] text-ink-soft">
          Unclaimed branch, auto-confirmed. Optionally nest under a parent in
          the tree.
        </p>
        <form action={createSubsidiary} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="back" value={backPath} />
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Name
            </span>
            <Input name="name" required placeholder="CleanCo Austria" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Category
            </span>
            <Input name="category" required placeholder="Cleaning" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              City
            </span>
            <Input name="city" required placeholder="Vienna" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Country
            </span>
            <Input name="country" placeholder="Austria" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Website (optional)
            </span>
            <Input name="website" type="url" placeholder="https://" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Parent in group (optional)
            </span>
            <select
              name="parent_company_id"
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink"
              defaultValue=""
            >
              <option value="">Directly under group</option>
              {confirmed.map((m) => (
                <option key={m.companyId} value={m.companyId}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" className="h-11">
              Create subsidiary
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
        <h3 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
          Invite existing company
        </h3>
        <p className="mt-1 text-[13px] text-ink-soft">
          They must confirm. Optional parent nests them after confirmation.
        </p>
        <form action={inviteCompanyToGroup} className="mt-4 space-y-3">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="back" value={backPath} />
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Company slug
            </span>
            <Input name="company_slug" required placeholder="company-slug" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Parent in group (optional)
            </span>
            <select
              name="parent_company_id"
              className="h-11 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink"
              defaultValue=""
            >
              <option value="">Directly under group</option>
              {confirmed.map((m) => (
                <option key={m.companyId} value={m.companyId}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="secondary" className="h-11">
            Send invite
          </Button>
        </form>
      </section>
    </>
  );
}

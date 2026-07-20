import { createGroup } from "@/features/groups/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { backPath: string };

export function GroupCreateEmpty({ backPath }: Props) {
  return (
    <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Company group
      </p>
      <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Create a group for your branches
      </h2>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
        One group, nested country profiles. Evidence stays on each company.
      </p>
      <form action={createGroup} className="mt-5 space-y-3">
        <input type="hidden" name="back" value={backPath} />
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Group name
          </span>
          <Input name="name" required placeholder="CleanCo Group" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Description
          </span>
          <Input name="description" placeholder="Multi-country delivery network" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">
            Website
          </span>
          <Input name="website" type="url" placeholder="https://" />
        </label>
        <Button type="submit" className="h-11">
          Create group
        </Button>
      </form>
    </section>
  );
}

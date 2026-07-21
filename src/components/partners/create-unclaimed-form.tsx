import { createUnclaimedPartner } from "@/features/partners/actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  defaultName?: string;
};

export function CreateUnclaimedForm({ defaultName = "" }: Props) {
  return (
    <section>
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Draft invite
        </h2>
        <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-muted">
          Can&apos;t find them? Create an unclaimed profile and email a claim
          link. Official only after they claim and accept.
        </p>
      </header>
      <WorkspaceCard>
        <form
          action={createUnclaimedPartner}
          className="grid gap-3 sm:grid-cols-2"
        >
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Company name
            </span>
            <Input
              name="name"
              required
              defaultValue={defaultName}
              placeholder="Partner firm name"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Category
            </span>
            <Input name="category" required placeholder="Construction" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              City
            </span>
            <Input name="city" required placeholder="Berlin" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Invite email
            </span>
            <Input
              type="email"
              name="invite_email"
              placeholder="partner@company.com"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Website (optional)
            </span>
            <Input name="website" placeholder="https://" />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" className="h-10 w-fit px-4">
              Create draft &amp; invite
            </Button>
          </div>
        </form>
      </WorkspaceCard>
    </section>
  );
}

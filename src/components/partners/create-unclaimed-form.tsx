import { createUnclaimedPartner } from "@/features/partners/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  defaultName?: string;
};

export function CreateUnclaimedForm({ defaultName = "" }: Props) {
  return (
    <form
      action={createUnclaimedPartner}
      className="rounded-[24px] border border-line bg-surface px-5 py-6"
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Invite a new partner
      </p>
      <h2 className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Can&apos;t find them? Add a draft profile
      </h2>
      <p className="mt-2 text-[13px] text-ink-soft">
        We create an unclaimed company page and email a claim link. They are not
        official partners until they claim and accept the request.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Company name
          </span>
          <Input name="name" required defaultValue={defaultName} placeholder="Partner firm name" />
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
      </div>

      <Button type="submit" className="mt-5 h-11">
        Create draft &amp; invite
      </Button>
    </form>
  );
}

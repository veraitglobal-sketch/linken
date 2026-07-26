import { createMinimalCompany } from "@/features/company/minimal-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  next: string;
  defaultName?: string;
};

export function ConfirmCompanyForm({ next, defaultName = "" }: Props) {
  return (
    <form
      action={createMinimalCompany}
      className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7"
    >
      <input type="hidden" name="next" value={next} />
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Your company
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Quick company profile
      </h2>
      <p className="mt-2 text-[14px] text-ink-soft">
        Name and optional logo — enough to confirm as the client firm.
      </p>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">
          Company name
        </span>
        <Input
          name="name"
          required
          placeholder="Client company GmbH"
          defaultValue={defaultName}
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">
          Logo (optional)
        </span>
        <input
          type="file"
          name="logo"
          accept="image/*"
          className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-[#0e1f1c] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </label>

      <Button type="submit" className="mt-5 h-11 w-full">
        Continue to confirmation
      </Button>
    </form>
  );
}

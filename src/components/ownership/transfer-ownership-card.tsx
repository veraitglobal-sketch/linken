import {
  cancelOwnershipTransfer,
  requestOwnershipTransfer,
} from "@/features/ownership/actions";
import type { PendingOwnershipTransfer } from "@/features/ownership/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  companyId: string;
  companyName: string;
  pending: PendingOwnershipTransfer | null;
};

export function TransferOwnershipCard({
  companyId,
  companyName,
  pending,
}: Props) {
  return (
    <section className="rounded-[24px] border border-line bg-surface px-5 py-5">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Ownership
      </p>
      <h2 className="mt-2 font-display text-lg font-medium tracking-[-0.03em] text-ink">
        Transfer ownership
      </h2>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-soft">
        Hand {companyName} to a new owner. Confirmed references, partners, and
        trust level stay with the company. You become a team member until they
        remove you.
      </p>

      {pending ? (
        <div className="mt-4 rounded-2xl border border-line bg-paper/60 px-4 py-3">
          <p className="text-[13px] text-ink">
            Pending transfer to{" "}
            <span className="font-medium">{pending.inviteEmail}</span>
          </p>
          <form action={cancelOwnershipTransfer} className="mt-3">
            <input type="hidden" name="company_id" value={companyId} />
            <Button type="submit" variant="secondary" className="h-10">
              Cancel transfer
            </Button>
          </form>
        </div>
      ) : (
        <form action={requestOwnershipTransfer} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input type="hidden" name="company_id" value={companyId} />
          <label className="block min-w-0 flex-1">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              New owner email
            </span>
            <Input
              name="email"
              type="email"
              required
              placeholder="new.owner@company.com"
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="h-11">
              Send transfer link
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

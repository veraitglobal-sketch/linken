import { resendOperatorClaimInvite } from "@/features/partners/operator-claim";
import { Button } from "@/components/ui/button";

type Props = {
  creatorName: string;
  hasInviteEmail: boolean;
  companyId: string;
};

export function OperatorBranchBanner({
  creatorName,
  hasInviteEmail,
  companyId,
}: Props) {
  return (
    <div className="border-b border-amber-200/80 bg-amber-50 px-4 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] leading-relaxed text-amber-950">
          You&apos;re managing this branch until it&apos;s claimed.{" "}
          <span className="font-semibold">{creatorName}</span> created it —
          invite the person who runs it to claim ownership.
        </p>
        {hasInviteEmail ? (
          <form action={resendOperatorClaimInvite}>
            <input type="hidden" name="company_id" value={companyId} />
            <Button type="submit" variant="secondary" className="h-8 text-[11px]">
              Resend claim invite
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

import { checkPartnerCredits } from "@/features/credits/actions";
import { Button } from "@/components/ui/button";

type Props = {
  partnershipId?: string;
  label?: string;
  back?: string;
};

export function CheckCreditForm({
  partnershipId,
  label = "Check my site",
  back = "/dashboard/partners",
}: Props) {
  return (
    <form action={checkPartnerCredits}>
      {partnershipId ? (
        <input type="hidden" name="partnership_id" value={partnershipId} />
      ) : null}
      <input type="hidden" name="back" value={back} />
      <Button type="submit" variant="ghost" className="h-8 px-3 text-[11px]">
        {label}
      </Button>
    </form>
  );
}

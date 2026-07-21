import { requestPartnership } from "@/features/network/actions";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  companyName: string;
  disabledReason?: string | null;
  /** Safe redirect after send (/dashboard, /search, or /c/…). */
  back?: string;
};

/** Send partnership request to an existing claimed company. */
export function PartnerInviteButton({
  companySlug,
  companyName,
  disabledReason,
  back = "/dashboard/partners",
}: Props) {
  if (disabledReason) {
    return (
      <span className="shrink-0 rounded-lg border border-line bg-paper px-2.5 py-1.5 text-[11px] font-semibold text-muted">
        {disabledReason}
      </span>
    );
  }

  return (
    <form action={requestPartnership}>
      <input type="hidden" name="company_slug" value={companySlug} />
      <input type="hidden" name="back" value={back} />
      <Button
        type="submit"
        className="h-9 shrink-0 px-3 text-[12px] font-semibold"
        aria-label={`Request partnership with ${companyName}`}
        title="Send request — official only after they accept"
      >
        Request
      </Button>
    </form>
  );
}

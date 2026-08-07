import {
  confirmClientRequest,
  declineClientRequest,
} from "@/features/case-studies/actions";
import { ConfirmDepthFields } from "@/components/confirm/confirm-depth-fields";
import { Button } from "@/components/ui/button";
import type { ClientConfirmationView } from "@/types/client-confirmation";

type Props = {
  view: ClientConfirmationView;
  companyName: string;
};

export function ConfirmDecision({ view, companyName }: Props) {
  return (
    <div className="rounded-[24px] border border-line/80 bg-surface px-5 py-6 shadow-[0_12px_36px_rgba(8,20,18,0.05)] sm:px-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Client confirmation
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-medium tracking-[-0.035em] text-ink">
        {view.requesterName} says they delivered this project for you.
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        Confirm as <span className="font-semibold text-ink">{companyName}</span>{" "}
        that “{view.caseTitle}” ({view.caseYear}
        {view.caseLocation ? ` · ${view.caseLocation}` : ""}) was work done for
        your company.
      </p>
      <p className="mt-4 rounded-2xl bg-[#f7f8fa] px-4 py-3 text-[14px] text-ink-soft">
        {view.caseSummary}
      </p>

      <form action={confirmClientRequest} className="mt-6">
        <input type="hidden" name="token" value={view.token} />
        <ConfirmDepthFields />
        <Button type="submit" className="mt-6 h-11 w-full">
          Confirm project
        </Button>
      </form>
      <form action={declineClientRequest} className="mt-2">
        <input type="hidden" name="token" value={view.token} />
        <Button type="submit" variant="secondary" className="h-11 w-full">
          Decline
        </Button>
      </form>
      <p className="mt-3 text-center text-[13px] leading-relaxed text-muted">
        Something wrong in the project description? Decline and ask{" "}
        {view.requesterName} to send an updated confirmation.
      </p>
    </div>
  );
}

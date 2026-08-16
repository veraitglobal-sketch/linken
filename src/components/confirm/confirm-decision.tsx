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
    <div className="rounded-[20px] border border-line/80 bg-surface px-4 py-5 shadow-[0_10px_28px_rgba(8,20,18,0.045)] sm:px-5">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-ember uppercase">
        Client confirmation
      </p>
      <h2 className="mt-1.5 font-display text-[clamp(1.2rem,2.4vw,1.45rem)] font-medium tracking-[-0.03em] text-ink">
        {view.requesterName} says they delivered this project for you.
      </h2>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
        Confirm as <span className="font-semibold text-ink">{companyName}</span>{" "}
        that “{view.caseTitle}” ({view.caseYear}
        {view.caseLocation ? ` · ${view.caseLocation}` : ""}) was work done for
        your company.
      </p>
      <p className="mt-3 rounded-xl bg-[#f7f8fa] px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft">
        {view.caseSummary}
      </p>

      <form action={confirmClientRequest} className="mt-4">
        <input type="hidden" name="token" value={view.token} />
        <ConfirmDepthFields />
        <Button type="submit" className="mt-4 h-10 w-full text-[13px]">
          Confirm project
        </Button>
      </form>
      <form action={declineClientRequest} className="mt-1.5">
        <input type="hidden" name="token" value={view.token} />
        <Button
          type="submit"
          variant="secondary"
          className="h-10 w-full text-[13px]"
        >
          Decline
        </Button>
      </form>
      <p className="mt-2.5 text-center text-[12px] leading-relaxed text-muted">
        Something wrong in the project description? Decline and ask{" "}
        {view.requesterName} to send an updated confirmation.
      </p>
    </div>
  );
}

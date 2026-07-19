import { PostConfirmAssessment } from "@/components/assessments/post-confirm-assessment";
import { InviteAuth } from "@/components/auth/invite-auth";
import {
  confirmServiceReference,
  declineServiceReference,
} from "@/features/references/actions";
import type { ReferencePreview } from "@/features/references/queries";
import { Button } from "@/components/ui/button";

type Props = {
  preview: ReferencePreview;
  token: string;
  userId: string | null;
  companyName: string | null;
  error?: string;
  done?: string;
  assessed?: boolean;
  skipped?: boolean;
  alreadyAssessed?: boolean;
};

export function ConfirmReferencePanel({
  preview,
  token,
  userId,
  companyName,
  error,
  done,
  assessed = false,
  skipped = false,
  alreadyAssessed = false,
}: Props) {
  const next = `/confirm-reference/${token}`;
  const confirmed = done === "confirmed" || preview.status === "confirmed";

  if (confirmed) {
    return (
      <div className="space-y-4">
        {error ? (
          <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
        <PostConfirmAssessment
          sourceType="reference"
          sourceId={preview.id}
          providerName={preview.providerName}
          providerSlug={preview.providerSlug}
          returnTo={next}
          alreadyAssessed={alreadyAssessed}
          assessedJustNow={assessed}
          skipped={skipped}
        />
      </div>
    );
  }

  if (done === "declined" || preview.status === "declined") {
    return <Status title="Declined" body="This confirmation request was declined." />;
  }

  if (!userId) {
    return (
      <InviteAuth
        next={next}
        invitedEmail={preview.inviteEmail ?? undefined}
        title="Sign in to respond"
        description="Confirm as the company that receives this service."
      />
    );
  }

  if (!companyName) {
    return (
      <Status
        title="Company profile required"
        body="Create your company profile first, then return to this link to confirm."
      />
    );
  }

  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-7">
      {error ? (
        <p className="mb-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Service reference
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,1.9rem)] font-medium tracking-[-0.035em] text-ink">
        {preview.providerName} says they provide “{preview.service}” for your company
        {preview.startedYear ? ` since ${preview.startedYear}` : ""}.
      </h2>
      <p className="mt-3 text-[14px] text-ink-soft">
        Confirm as <span className="font-semibold text-ink">{companyName}</span>
        {preview.clientName ? ` (${preview.clientName})` : null}.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <form action={confirmServiceReference} className="flex-1">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" className="h-11 w-full">
            Confirm
          </Button>
        </form>
        <form action={declineServiceReference} className="flex-1">
          <input type="hidden" name="token" value={token} />
          <Button type="submit" variant="secondary" className="h-11 w-full">
            Decline
          </Button>
        </form>
      </div>
    </div>
  );
}

function Status({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
    </div>
  );
}

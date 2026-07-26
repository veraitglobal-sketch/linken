import { ConfirmContinueGate } from "@/components/auth/confirm-continue-gate";
import { claimCompanyProfile } from "@/features/partners/actions";
import type { ClaimPreview } from "@/features/partners/queries";
import { Button } from "@/components/ui/button";

type Props = {
  preview: ClaimPreview;
  token: string;
  userId: string | null;
  error?: string;
  checkEmail?: boolean;
  checkEmailAddress?: string;
};

export function ClaimPanel({
  preview,
  token,
  userId,
  error,
  checkEmail = false,
  checkEmailAddress,
}: Props) {
  const next = `/claim/${token}`;

  if (preview.claimed) {
    return (
      <Status
        title="Already claimed"
        body="This company profile has already been claimed."
      />
    );
  }

  if (!userId) {
    return (
      <ConfirmContinueGate
        next={next}
        invitedEmail={preview.inviteEmail ?? undefined}
        companyName={preview.companyName}
        inviterName={preview.inviterName}
        error={error}
        checkEmail={checkEmail}
        checkEmailAddress={checkEmailAddress}
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
        Ready
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Confirm partnership
      </h2>
      <p className="mt-2 text-[14px] text-ink-soft">
        Take ownership of {preview.companyName}
        {preview.inviterName
          ? ` and confirm the partnership with ${preview.inviterName}`
          : ""}
        .
      </p>
      <form action={claimCompanyProfile} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <Button type="submit" className="h-11 w-full">
          Confirm partnership
        </Button>
      </form>
    </div>
  );
}

function Status({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center sm:px-7">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
    </div>
  );
}

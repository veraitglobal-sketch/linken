import { ConfirmContinueGate } from "@/components/auth/confirm-continue-gate";
import { claimCompanyProfile } from "@/features/partners/actions";
import type { ClaimPreview } from "@/features/partners/queries";
import { Button } from "@/components/ui/button";
import { CLAIM_BENEFIT } from "@/features/growth/copy";
import { claimDomainMismatch } from "@/features/growth/match-company";

type Props = {
  preview: ClaimPreview;
  token: string;
  userId: string | null;
  error?: string;
  checkEmail?: boolean;
  checkEmailAddress?: string;
  companyWebsite?: string | null;
};

export function ClaimPanel({
  preview,
  token,
  userId,
  error,
  checkEmail = false,
  checkEmailAddress,
  companyWebsite = null,
}: Props) {
  const next = `/claim/${token}`;
  const domainWarn = claimDomainMismatch(preview.inviteEmail, companyWebsite);

  if (preview.claimed) {
    return (
      <Status
        title="Already claimed"
        body="This company profile has already been claimed. Ask an owner to invite you to the team, or contact Hansala if you believe this is an error."
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
      {domainWarn ? (
        <p className="mb-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          The invite email domain does not match this draft&apos;s website.
          Continue only if you are sure this is your company.
        </p>
      ) : null}
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Ready
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Claim {preview.companyName}
      </h2>
      <p className="mt-2 text-[14px] text-ink-soft">{CLAIM_BENEFIT}</p>
      {preview.inviterName ? (
        <p className="mt-2 text-[14px] text-ink-soft">
          Listed by {preview.inviterName}
          {preview.pendingPartnerships > 0
            ? " — claiming will confirm the pending partnership."
            : "."}
        </p>
      ) : null}
      <form action={claimCompanyProfile} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <Button type="submit" className="h-11 w-full">
          Claim profile
          {preview.pendingPartnerships > 0 ? " & confirm partnership" : ""}
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

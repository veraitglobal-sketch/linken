import { InviteAuth } from "@/components/auth/invite-auth";
import { claimCompanyProfile } from "@/features/partners/actions";
import type { ClaimPreview } from "@/features/partners/queries";
import { Button } from "@/components/ui/button";

type Props = {
  preview: ClaimPreview;
  token: string;
  userId: string | null;
  error?: string;
};

export function ClaimPanel({
  preview,
  token,
  userId,
  error,
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
      <InviteAuth
        next={next}
        invitedEmail={preview.inviteEmail ?? undefined}
        title="Sign in to claim this profile"
        description={`${preview.inviterName ?? "A partner"} drafted ${preview.companyName} for you. Sign in to take ownership.`}
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
        Ready to claim
      </p>
      <h2 className="mt-2 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        Take ownership of {preview.companyName}
      </h2>
      <p className="mt-2 text-[14px] text-ink-soft">
        Partnerships stay pending until you confirm them — claiming does not
        auto-verify anyone.
      </p>
      <form action={claimCompanyProfile} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <Button type="submit" className="h-11 w-full">
          Claim this profile
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

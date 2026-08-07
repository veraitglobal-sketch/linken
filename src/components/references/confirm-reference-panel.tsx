import { PostConfirmSuccess } from "@/components/confirm/post-confirm-success";
import { PostConfirmTestimonial } from "@/components/confirm/post-confirm-testimonial";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";
import { ConfirmDepthFields } from "@/components/confirm/confirm-depth-fields";
import {
  ConfirmErrorNote,
  ConfirmStatus,
  ConfirmSwitchAccount,
} from "@/components/confirm/confirm-status";
import { PostConfirmAssessment } from "@/components/assessments/post-confirm-assessment";
import { InviteAuth } from "@/components/auth/invite-auth";
import { ConfirmCompanyForm } from "@/components/confirm/confirm-company-form";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import {
  confirmServiceReference,
  declineServiceReference,
} from "@/features/references/confirm-actions";
import type { ReferencePreview } from "@/features/references/queries";
import { Button } from "@/components/ui/button";

type Props = {
  preview: ReferencePreview;
  token: string;
  userId: string | null;
  userEmail: string | null;
  company: { id: string; name: string; slug: string } | null;
  listings: ListingCompany[];
  suggestedWebsite: string;
  subject: PostConfirmSubject | null;
  testimonialUrl?: string | null;
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
  userEmail,
  company,
  listings,
  suggestedWebsite,
  subject,
  testimonialUrl,
  error,
  done,
  assessed = false,
  skipped = false,
  alreadyAssessed = false,
}: Props) {
  const next = `/confirm-reference/${token}`;
  const confirmed = done === "confirmed" || preview.status === "confirmed";
  const isProvider = Boolean(company && company.id === preview.providerId);
  const invite = preview.inviteEmail?.trim().toLowerCase() || null;
  const signedIn = userEmail?.trim().toLowerCase() || null;
  const wrongInbox = Boolean(
    invite && signedIn && invite !== signedIn && (isProvider || Boolean(company)),
  );

  if (confirmed) {
    return (
      <div className="space-y-4">
        {error ? <ConfirmErrorNote>{error}</ConfirmErrorNote> : null}
        {subject ? (
          <PostConfirmSuccess
            subject={subject}
            listings={listings}
            suggestedName={company?.name || preview.clientName}
            suggestedWebsite={suggestedWebsite}
          />
        ) : null}
        <PostConfirmTestimonial
          requesterName={preview.providerName}
          testimonialUrl={testimonialUrl ?? null}
        />
        <PostConfirmAssessment
          sourceType="reference"
          sourceId={preview.id}
          providerName={preview.providerName}
          providerSlug={preview.providerSlug}
          returnTo={next}
          alreadyAssessed={alreadyAssessed}
          assessedJustNow={assessed}
          skipped={skipped}
          hideConfirmedBanner
        />
      </div>
    );
  }

  if (done === "declined" || preview.status === "declined") {
    return (
      <ConfirmStatus
        title="Declined"
        body="This confirmation request was declined."
      />
    );
  }

  if (!userId) {
    return (
      <InviteAuth
        next={next}
        invitedEmail={preview.inviteEmail ?? undefined}
        title="Sign in to respond"
        description={`Use ${invite ?? "the invited email"} — confirm as ${preview.clientName}.`}
      />
    );
  }

  if (isProvider || wrongInbox) {
    return (
      <ConfirmSwitchAccount
        next={next}
        title={isProvider ? "Wrong account for this link" : "Sign in with the invite email"}
        body={
          isProvider
            ? `You’re signed in as ${signedIn ?? company?.name} (the sender). This invite went to ${invite ?? preview.clientName}. Sign out, then sign in with that inbox.`
            : `This invite was sent to ${invite}. You’re signed in as ${signedIn}. Switch accounts to confirm.`
        }
      />
    );
  }

  if (!company) {
    return <ConfirmCompanyForm next={next} defaultName={preview.clientName} />;
  }

  return (
    <div className="rounded-[24px] border border-line/80 bg-surface px-5 py-6 shadow-[0_12px_36px_rgba(8,20,18,0.05)] sm:px-7">
      {error ? <ConfirmErrorNote>{error}</ConfirmErrorNote> : null}
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Service reference
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,3vw,1.9rem)] font-medium tracking-[-0.035em] text-ink">
        {preview.providerName} says they provide “{preview.service}” for your company
        {preview.startedYear ? ` since ${preview.startedYear}` : ""}.
      </h2>
      <p className="mt-3 text-[14px] text-ink-soft">
        Confirm as <span className="font-semibold text-ink">{company.name}</span>.
      </p>
      <form action={confirmServiceReference} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <ConfirmDepthFields />
        <div className="mt-6">
          <Button type="submit" className="h-11 w-full">
            Confirm
          </Button>
        </div>
      </form>
      <form action={declineServiceReference} className="mt-2">
        <input type="hidden" name="token" value={token} />
        <Button type="submit" variant="secondary" className="h-11 w-full">
          Decline
        </Button>
      </form>
      <p className="mt-3 text-center text-[13px] leading-relaxed text-muted">
        Details wrong? Decline and ask {preview.providerName} to send an updated
        invite.
      </p>
    </div>
  );
}

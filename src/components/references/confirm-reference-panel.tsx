import { ConfirmReferenceDone } from "@/components/references/confirm-reference-done";
import { ConfirmDepthFields } from "@/components/confirm/confirm-depth-fields";
import {
  ConfirmErrorNote,
  ConfirmStatus,
  ConfirmSwitchAccount,
} from "@/components/confirm/confirm-status";
import { InviteAuth } from "@/components/auth/invite-auth";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import {
  confirmResponderGate,
  suggestedConfirmCompanyName,
} from "@/features/confirm/gate";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";
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

export function ConfirmReferencePanel(props: Props) {
  const { preview, token, userId, userEmail, company, error, done } = props;
  const next = `/confirm-reference/${token}`;
  const confirmed = done === "confirmed" || preview.status === "confirmed";
  const invite = preview.inviteEmail?.trim().toLowerCase() || null;
  const signedIn = userEmail?.trim().toLowerCase() || null;
  const asName = suggestedConfirmCompanyName(company?.name, preview.clientName);
  const gate = confirmResponderGate({
    userId,
    companyId: company?.id ?? null,
    senderCompanyId: preview.providerId,
  });

  if (confirmed) return <ConfirmReferenceDone {...props} next={next} />;
  if (done === "declined" || preview.status === "declined") {
    return (
      <ConfirmStatus
        title="Declined"
        body="This confirmation request was declined."
      />
    );
  }
  if (gate === "auth") {
    return (
      <InviteAuth
        next={next}
        invitedEmail={preview.inviteEmail ?? undefined}
        title="Sign in to respond"
        description={`Use ${invite ?? "the invited email"} — confirm as ${preview.clientName}.`}
      />
    );
  }
  if (gate === "sender") {
    return (
      <ConfirmSwitchAccount
        next={next}
        title="Wrong account for this link"
        body={`You’re signed in as ${signedIn ?? company?.name} (the sender). This invite went to ${invite ?? preview.clientName}. Sign out, then sign in with that inbox.`}
      />
    );
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
        Confirm as <span className="font-semibold text-ink">{asName}</span>.
      </p>
      {invite && signedIn && invite !== signedIn ? (
        <p className="mt-2 text-[13px] text-muted">
          Invite sent to {invite}. Confirming as {asName}.
        </p>
      ) : null}
      <form action={confirmServiceReference} className="mt-6">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="suggested_name" value={preview.clientName} />
        <ConfirmDepthFields />
        <div className="mt-6">
          <Button type="submit" className="h-11 w-full">
            Confirm
          </Button>
        </div>
      </form>
      <form action={declineServiceReference} className="mt-2">
        <input type="hidden" name="token" value={token} />
        <input type="hidden" name="suggested_name" value={preview.clientName} />
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

import { PostConfirmSuccess } from "@/components/confirm/post-confirm-success";
import { PostConfirmTestimonial } from "@/components/confirm/post-confirm-testimonial";
import { PostConfirmAssessment } from "@/components/assessments/post-confirm-assessment";
import { ConfirmAuth } from "@/components/confirm/confirm-auth";
import { ConfirmDecision } from "@/components/confirm/confirm-decision";
import {
  ConfirmErrorNote,
  ConfirmStatus,
  ConfirmSwitchAccount,
} from "@/components/confirm/confirm-status";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import {
  confirmResponderGate,
  suggestedConfirmCompanyName,
} from "@/features/confirm/gate";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";
import type { ClientConfirmationView } from "@/types/client-confirmation";

type ViewerCompany = { id: string; name: string; slug: string } | null;

type Props = {
  view: ClientConfirmationView;
  userId: string | null;
  company: ViewerCompany;
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

export function ConfirmPanel(props: Props) {
  const { view, userId, company, error, done } = props;
  const next = `/confirm/${view.token}`;
  const confirmed = done === "confirmed" || view.status === "confirmed";
  const asName = suggestedConfirmCompanyName(company?.name, view.email);
  const gate = confirmResponderGate({
    userId,
    companyId: company?.id ?? null,
    senderCompanyId: view.requestedByCompanyId,
  });

  if (confirmed) return <ConfirmedProject {...props} next={next} asName={asName} />;
  if (done === "declined" || view.status === "declined") {
    return (
      <ConfirmStatus
        title="Request declined"
        body="This confirmation request was declined."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? <ConfirmErrorNote>{error}</ConfirmErrorNote> : null}
      {gate === "auth" ? (
        <ConfirmAuth next={next} invitedEmail={view.email} />
      ) : gate === "sender" ? (
        <ConfirmSwitchAccount
          next={next}
          title="Wrong account for this link"
          body={`You’re signed in as the company that sent this. Sign out, then sign in as the client.`}
        />
      ) : (
        <ConfirmDecision
          view={view}
          companyName={asName}
          suggestedName={suggestedConfirmCompanyName(null, view.email)}
        />
      )}
    </div>
  );
}

function ConfirmedProject({
  view,
  company,
  listings,
  suggestedWebsite,
  subject,
  testimonialUrl,
  error,
  assessed = false,
  skipped = false,
  alreadyAssessed = false,
  next,
  asName,
}: Props & { next: string; asName: string }) {
  const suggestedName = view.confirmerName?.trim() || asName;
  return (
    <div className="space-y-4">
      {error ? <ConfirmErrorNote>{error}</ConfirmErrorNote> : null}
      {subject ? (
        <PostConfirmSuccess
          subject={subject}
          listings={listings}
          suggestedName={suggestedName}
          suggestedWebsite={suggestedWebsite}
        />
      ) : null}
      <PostConfirmTestimonial
        requesterName={view.requesterName}
        testimonialUrl={testimonialUrl ?? null}
      />
      <PostConfirmAssessment
        sourceType="confirmation"
        sourceId={view.id}
        providerName={view.requesterName}
        providerSlug={view.requesterSlug}
        returnTo={next}
        alreadyAssessed={alreadyAssessed}
        assessedJustNow={assessed}
        skipped={skipped}
        hideConfirmedBanner
      />
    </div>
  );
}

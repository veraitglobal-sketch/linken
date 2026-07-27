import { PostConfirmSuccess } from "@/components/confirm/post-confirm-success";
import { PostConfirmTestimonial } from "@/components/confirm/post-confirm-testimonial";
import { PostConfirmAssessment } from "@/components/assessments/post-confirm-assessment";
import { ConfirmAuth } from "@/components/confirm/confirm-auth";
import { ConfirmCompanyForm } from "@/components/confirm/confirm-company-form";
import { ConfirmDecision } from "@/components/confirm/confirm-decision";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";
import type { ClientConfirmationView } from "@/types/client-confirmation";

type ViewerCompany = {
  id: string;
  name: string;
  slug: string;
} | null;

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

export function ConfirmPanel({
  view,
  userId,
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
  const next = `/confirm/${view.token}`;
  const confirmed = done === "confirmed" || view.status === "confirmed";

  if (confirmed) {
    const suggestedName =
      view.confirmerName?.trim() ||
      company?.name ||
      view.email.split("@")[0] ||
      "Your company";

    return (
      <div className="space-y-4">
        {error ? (
          <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
            {error}
          </p>
        ) : null}
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

  if (done === "declined" || view.status === "declined") {
    return (
      <StatusCard
        title="Request declined"
        body="This confirmation request was declined."
      />
    );
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      {!userId ? (
        <ConfirmAuth next={next} invitedEmail={view.email} />
      ) : !company ? (
        <ConfirmCompanyForm next={next} />
      ) : (
        <ConfirmDecision view={view} companyName={company.name} />
      )}
    </div>
  );
}

function StatusCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center sm:px-7">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
    </div>
  );
}

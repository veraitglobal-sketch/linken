import { PostConfirmAssessment } from "@/components/assessments/post-confirm-assessment";
import { PostConfirmSuccess } from "@/components/confirm/post-confirm-success";
import { PostConfirmTestimonial } from "@/components/confirm/post-confirm-testimonial";
import { ConfirmErrorNote } from "@/components/confirm/confirm-status";
import type { ListingCompany } from "@/features/acquisition/listing-companies";
import type { PostConfirmSubject } from "@/features/confirm/post-confirm-subject";
import type { ReferencePreview } from "@/features/references/queries";

type Props = {
  preview: ReferencePreview;
  company: { id: string; name: string; slug: string } | null;
  listings: ListingCompany[];
  suggestedWebsite: string;
  subject: PostConfirmSubject | null;
  testimonialUrl?: string | null;
  error?: string;
  assessed?: boolean;
  skipped?: boolean;
  alreadyAssessed?: boolean;
  next: string;
};

export function ConfirmReferenceDone({
  preview,
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
}: Props) {
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

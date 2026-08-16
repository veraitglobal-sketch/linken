import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmPage } from "@/components/confirm/confirm-page";
import { ConfirmPanel } from "@/components/confirm/confirm-panel";
import {
  getCompaniesListingClient,
  suggestedWebsiteFromEmail,
} from "@/features/acquisition/listing-companies";
import { hasAssessmentForSource } from "@/features/assessments/queries";
import {
  getClientConfirmationByToken,
  getViewerCompany,
} from "@/features/case-studies/queries";
import { loadPostConfirmSubject } from "@/features/confirm/post-confirm-subject";
import { ensureTestimonialAfterConfirm } from "@/features/testimonials/post-confirm";

export const metadata: Metadata = {
  title: "Confirm project",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    error?: string;
    done?: string;
    assessed?: string;
    skipped?: string;
  }>;
};

export default async function ConfirmTokenPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error, done, assessed, skipped } = await searchParams;
  const view = await getClientConfirmationByToken(token);
  const { user, company } = await getViewerCompany();

  if (!view) {
    return (
      <section className="mx-auto max-w-lg py-10 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid link
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This confirmation link is invalid or has expired.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-semibold text-ink underline"
        >
          Back to Hansala
        </Link>
      </section>
    );
  }

  const confirmed = done === "confirmed" || view.status === "confirmed";
  const alreadyAssessed = confirmed
    ? await hasAssessmentForSource("confirmation", view.id)
    : false;

  const listings = confirmed
    ? await getCompaniesListingClient({
        clientCompanyId: view.confirmedByCompanyId ?? company?.id ?? null,
        clientName: view.confirmerName ?? company?.name ?? "",
        email: view.email,
      })
    : [];

  const subject = confirmed
    ? await loadPostConfirmSubject("case", token, {
        requesterName: view.requesterName,
        requesterSlug: view.requesterSlug,
        caseSlug: view.caseSlug,
        companyId: view.confirmedByCompanyId ?? company?.id ?? null,
        companyName: view.confirmerName ?? company?.name ?? null,
        companySlug: view.confirmerSlug ?? company?.slug ?? null,
      })
    : null;

  const testimonialUrl = confirmed
    ? await ensureTestimonialAfterConfirm({ token, source: "case_study" })
    : null;

  return (
    <ConfirmPage
      eyebrow="Hansala · Client confirmation"
      title="Project confirmation"
      subtitle={`From ${view.requesterName} · ${view.caseTitle}`}
      compact
    >
      <ConfirmPanel
        view={view}
        userId={user?.id ?? null}
        company={company}
        listings={listings}
        suggestedWebsite={suggestedWebsiteFromEmail(view.email)}
        subject={subject}
        error={error}
        done={done}
        assessed={assessed === "1"}
        skipped={skipped === "1"}
        alreadyAssessed={alreadyAssessed}
        testimonialUrl={testimonialUrl}
      />
    </ConfirmPage>
  );
}

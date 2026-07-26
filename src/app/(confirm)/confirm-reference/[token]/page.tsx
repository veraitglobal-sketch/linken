import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmPage } from "@/components/confirm/confirm-page";
import { ConfirmReferencePanel } from "@/components/references/confirm-reference-panel";
import { hasAssessmentForSource } from "@/features/assessments/queries";
import { getReferencePreview } from "@/features/references/queries";
import { getOwnedActiveCompany } from "@/features/workspace/require-owned";

export const metadata: Metadata = {
  title: "Confirm service reference",
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

export default async function ConfirmReferencePage({
  params,
  searchParams,
}: Props) {
  const { token } = await params;
  const { error, done, assessed, skipped } = await searchParams;
  const preview = await getReferencePreview(token);
  const { user, company } = await getOwnedActiveCompany();

  if (!preview) {
    return (
      <section className="mx-auto max-w-lg py-10 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid link
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This confirmation link is invalid or already resolved.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold underline">
          Back to Hansala
        </Link>
      </section>
    );
  }

  const alreadyAssessed =
    preview.status === "confirmed" || done === "confirmed"
      ? await hasAssessmentForSource("reference", preview.id)
      : false;

  return (
    <ConfirmPage
      eyebrow="Hansala · Reference confirmation"
      title="Confirm a service relationship"
      subtitle={`From ${preview.providerName}`}
    >
      <ConfirmReferencePanel
        preview={preview}
        token={token}
        userId={user?.id ?? null}
        userEmail={user?.email ?? null}
        company={company ? { id: company.id, name: company.name } : null}
        error={error}
        done={done}
        assessed={assessed === "1"}
        skipped={skipped === "1"}
        alreadyAssessed={alreadyAssessed}
      />
    </ConfirmPage>
  );
}

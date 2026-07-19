import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmReferencePanel } from "@/components/references/confirm-reference-panel";
import { getReferencePreview } from "@/features/references/queries";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";

export const metadata: Metadata = {
  title: "Confirm service reference",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; done?: string }>;
};

export default async function ConfirmReferencePage({
  params,
  searchParams,
}: Props) {
  const { token } = await params;
  const { error, done } = await searchParams;
  const preview = await getReferencePreview(token);
  const { user, company } = await viewerOwnsClaimedCompany();

  if (!preview) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid link
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This confirmation link is invalid or already resolved.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold underline">
          Back to Linken
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Linken · Reference confirmation
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Confirm a service relationship
      </h1>
      <p className="mt-2 text-[14px] text-ink-soft">
        From {preview.providerName}
      </p>
      <div className="mt-8">
        <ConfirmReferencePanel
          preview={preview}
          token={token}
          userId={user?.id ?? null}
          companyName={company?.name ?? null}
          error={error}
          done={done}
        />
      </div>
    </section>
  );
}

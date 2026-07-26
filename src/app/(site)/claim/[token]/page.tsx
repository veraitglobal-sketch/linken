import type { Metadata } from "next";
import Link from "next/link";
import { ClaimPanel } from "@/components/claim/claim-panel";
import {
  getClaimPreview,
  viewerOwnsClaimedCompany,
} from "@/features/partners/queries";

export const metadata: Metadata = {
  title: "Confirm partnership",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{
    error?: string;
    checkEmail?: string;
    email?: string;
  }>;
};

export default async function ClaimTokenPage({ params, searchParams }: Props) {
  const { token } = await params;
  const sp = await searchParams;
  const preview = await getClaimPreview(token);
  const { user } = await viewerOwnsClaimedCompany();

  if (!preview) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid or already claimed
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This link is invalid or the profile was already taken.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold underline">
          Back to Hansala
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Hansala · Partnership
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        {preview.companyName}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {preview.inviterName ? (
          <>
            <span className="font-semibold text-ink">{preview.inviterName}</span>{" "}
            listed you as a partner
            {preview.pendingPartnerships > 0 ? " · confirmation waiting" : null}.
          </>
        ) : (
          <>A draft company profile is ready for you.</>
        )}
      </p>
      <p className="mt-2 text-[13px] text-muted">
        {preview.companyCategory}
        {preview.companyCity ? ` · ${preview.companyCity}` : ""}
      </p>

      <div className="mt-8">
        <ClaimPanel
          preview={preview}
          token={token}
          userId={user?.id ?? null}
          error={sp.error}
          checkEmail={sp.checkEmail === "1"}
          checkEmailAddress={sp.email}
        />
      </div>
    </section>
  );
}

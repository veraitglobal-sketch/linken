import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmPanel } from "@/components/confirm/confirm-panel";
import {
  getClientConfirmationByToken,
  getViewerCompany,
} from "@/features/case-studies/queries";

export const metadata: Metadata = {
  title: "Confirm project",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; done?: string }>;
};

export default async function ConfirmTokenPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error, done } = await searchParams;
  const view = await getClientConfirmationByToken(token);
  const { user, company } = await getViewerCompany();

  if (!view) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid link
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This confirmation link is invalid or has expired.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm font-semibold text-ink underline">
          Back to Linken
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Linken · Client confirmation
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Project confirmation
      </h1>
      <p className="mt-2 text-[14px] text-ink-soft">
        From {view.requesterName} · {view.caseTitle}
      </p>

      <div className="mt-8">
        <ConfirmPanel
          view={view}
          userId={user?.id ?? null}
          company={company}
          error={error}
          done={done}
        />
      </div>
    </section>
  );
}

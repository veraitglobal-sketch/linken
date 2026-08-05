import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmPage } from "@/components/confirm/confirm-page";
import { PartnerRequestsPanel } from "@/components/partners/partner-requests-panel";
import { getPartnershipInbox } from "@/features/partners/inbox";
import { resolveActiveWorkspace } from "@/features/workspace/context";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Partnership requests",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{
    error?: string;
    accepted?: string;
    declined?: string;
    needVerify?: string;
    tm?: string;
  }>;
};

/** Lean page for email links — no workspace chrome (phone-friendly). */
export default async function PartnerRequestsPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Gate
        title="Sign in to respond"
        body="Open this link after signing in with the account that owns the company."
        href={`/login?next=${encodeURIComponent("/partners/requests")}`}
        cta="Sign in"
      />
    );
  }

  const workspace = await resolveActiveWorkspace();
  const company = workspace?.company;
  if (!company || company.role !== "owner") {
    return (
      <Gate
        title="Company required"
        body="Create or switch to your company workspace to accept partnership requests."
        href="/onboarding"
        cta="Create company"
      />
    );
  }

  const [{ data: full }, inbox] = await Promise.all([
    supabase
      .from("companies")
      .select("verified")
      .eq("id", company.id)
      .maybeSingle(),
    getPartnershipInbox(company.id),
  ]);

  const testimonialUrl =
    params.accepted === "1" && params.tm?.startsWith("/testimonial/")
      ? params.tm
      : null;

  return (
    <ConfirmPage
      eyebrow="Hansala · Partnership"
      title="Partnership requests"
      subtitle={`Responding as ${company.name}`}
    >
      <PartnerRequestsPanel
        incoming={inbox.incomingPending}
        verified={Boolean(full?.verified)}
        companySlug={company.slug}
        requesterName={null}
        testimonialUrl={testimonialUrl}
        error={params.error}
        accepted={params.accepted === "1"}
        declined={params.declined === "1"}
        needVerify={params.needVerify === "1"}
      />
    </ConfirmPage>
  );
}

function Gate({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <section className="mx-auto max-w-lg py-10 text-center">
      <h1 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h1>
      <p className="mt-3 text-[14px] text-ink-soft">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-white"
      >
        {cta}
      </Link>
    </section>
  );
}

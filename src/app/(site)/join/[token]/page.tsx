import type { Metadata } from "next";
import Link from "next/link";
import { JoinTeamPanel } from "@/components/team/join-team-panel";
import { getTeamInvitePreview } from "@/features/team/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Join team",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; declined?: string }>;
};

export default async function JoinTeamPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error, declined } = await searchParams;
  const preview = await getTeamInvitePreview(token);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!preview) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid or expired invite
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This team invite link is invalid or no longer available.
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
        Linken · Team
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        {preview.companyName}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
        {preview.inviterHint} invited you to join the team. You become a member
        only after you accept — and public visibility stays off unless you turn
        it on.
      </p>
      <div className="mt-8">
        <JoinTeamPanel
          preview={preview}
          token={token}
          userId={user?.id ?? null}
          error={error}
          declined={Boolean(declined)}
        />
      </div>
    </section>
  );
}

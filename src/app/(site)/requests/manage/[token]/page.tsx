import type { Metadata } from "next";
import Link from "next/link";
import { ManageRequestPanel } from "@/components/project-requests/manage-panel";
import {
  getManagedRequest,
  listManagedResponses,
} from "@/features/project-requests/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Manage project request",
  robots: { index: false, follow: false },
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; closed?: string }>;
};

export default async function ManageProjectRequestPage({
  params,
  searchParams,
}: Props) {
  const { token } = await params;
  const { error, closed } = await searchParams;
  const request = await getManagedRequest(token);

  if (!request) {
    return (
      <section className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-ink">
          Invalid link
        </h1>
        <p className="mt-3 text-[15px] text-ink-soft">
          This manage link is invalid or has expired.
        </p>
        <Link href="/requests/new" className="mt-6 inline-block text-sm font-semibold underline">
          Post a new request
        </Link>
      </section>
    );
  }

  const supabase = await createClient();
  await supabase.rpc("mark_manage_responses_seen", { p_token: token });
  const responses = await listManagedResponses(token);

  return (
    <section className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Hansala · Your request
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-medium tracking-[-0.04em] text-ink">
        Manage responses
      </h1>
      <p className="mt-2 text-[14px] text-ink-soft">
        Bookmark this page — it is the only way to track replies without an
        account.
      </p>

      <div className="mt-8">
        <ManageRequestPanel
          request={request}
          responses={responses}
          token={token}
          error={error}
          closed={closed === "1"}
        />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { acceptOwnershipTransfer } from "@/features/ownership/actions";
import { getOwnershipTransferPreview } from "@/features/ownership/queries";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section-title";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Accept ownership",
};

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function TransferPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { error } = await searchParams;
  const preview = await getOwnershipTransferPreview(token);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!preview) {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <SectionTitle
          eyebrow="Transfer"
          title="Link not valid"
          description="This ownership transfer link is missing or already used."
        />
      </div>
    );
  }

  if (preview.status !== "pending") {
    return (
      <div className="mx-auto max-w-lg px-5 py-16">
        <SectionTitle
          eyebrow="Transfer"
          title="Already resolved"
          description={`This transfer is ${preview.status}.`}
        />
        <Button href={`/c/${preview.companySlug}`} className="mt-6 h-11">
          View company
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-5 py-16">
      <SectionTitle
        eyebrow="Transfer"
        title={`Own ${preview.companyName}`}
        description="You are accepting ownership of this company profile. Confirmed evidence stays with the company. You must not already own another claimed company."
      />

      {error ? (
        <p className="mt-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <div className="mt-8 rounded-[24px] border border-line bg-surface px-5 py-6">
        <p className="text-[13px] text-ink-soft">
          Invited email:{" "}
          <span className="font-medium text-ink">{preview.inviteEmail}</span>
        </p>

        {!user ? (
          <p className="mt-4 text-sm text-ink-soft">
            <Link
              href={`/login?next=${encodeURIComponent(`/transfer/${token}`)}`}
              className="font-semibold underline"
            >
              Sign in
            </Link>{" "}
            with the invited account to accept.
          </p>
        ) : (
          <form action={acceptOwnershipTransfer} className="mt-5">
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="h-11 w-full">
              Accept ownership
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { addTeamMember } from "@/features/groups/actions";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Team",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    added?: string;
    invitedEmail?: string;
  }>;
};

export default async function DashboardTeamPage({ searchParams }: Props) {
  const { error, added, invitedEmail } = await searchParams;
  const { user, company } = await viewerOwnsClaimedCompany();

  let members: { user_id: string; role: string; created_at: string }[] = [];
  if (company) {
    try {
      const supabase = await createClient();
      const { data } = await supabase
        .from("company_members")
        .select("user_id, role, created_at")
        .eq("company_id", company.id)
        .order("created_at", { ascending: true });
      members = data ?? [];
    } catch {
      members = [];
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <SectionTitle
        eyebrow="Owner"
        title="Team members"
        description="Invite colleagues to the company dashboard. Ownership stays with you."
      />

      {error ? (
        <p className="mt-6 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {added ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Teammate added.
        </p>
      ) : null}
      {invitedEmail ? (
        <p className="mt-6 rounded-2xl border border-[#1f6b5c]/30 bg-[#1f6b5c]/10 px-4 py-3 text-sm text-ink">
          Invite email sent. Auto-link on registration is still TODO — re-add
          after they sign up if needed.
        </p>
      ) : null}

      {!user ? (
        <p className="mt-8 text-sm text-ink-soft">
          <Link href="/login?next=/dashboard/team" className="font-semibold underline">
            Sign in
          </Link>{" "}
          to manage teammates.
        </p>
      ) : null}

      {user && !company ? (
        <p className="mt-8 text-sm text-ink-soft">
          <Link href="/onboarding" className="font-semibold underline">
            Create your company
          </Link>{" "}
          first.
        </p>
      ) : null}

      {company ? (
        <div className="mt-8 space-y-4">
          <section className="rounded-[24px] border border-line bg-surface px-5 py-5">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
              Current members
            </p>
            <ul className="mt-3 space-y-2">
              {members.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-[13px]"
                >
                  <span className="font-mono text-[12px] text-ink-soft">
                    {m.user_id.slice(0, 8)}…
                  </span>
                  <span className="font-medium tracking-[0.06em] text-ink uppercase">
                    {m.role}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[24px] border border-line bg-surface px-5 py-6">
            <h2 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
              Invite by email
            </h2>
            <form action={addTeamMember} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input type="hidden" name="company_id" value={company.id} />
              <label className="block min-w-0 flex-1">
                <span className="mb-1.5 block text-[13px] font-medium text-ink">
                  Email
                </span>
                <Input
                  name="email"
                  type="email"
                  required
                  placeholder="colleague@company.com"
                />
              </label>
              <div className="flex items-end">
                <Button type="submit" className="h-11">
                  Add member
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}

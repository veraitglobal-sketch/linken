import Link from "next/link";

export const metadata = { title: "Admin · Access denied" };

const REASONS: Record<string, string> = {
  env: "Your email is not in PLATFORM_ADMIN_EMAILS on this deployment (or the env var is missing). Check Vercel → add jovica@verait.de → Redeploy.",
  service:
    "SUPABASE_SERVICE_ROLE_KEY is missing on this deployment — admin cannot read platform_staff.",
  table:
    "Could not read platform_staff (table missing or query error). Run the admin migrations.",
  staff:
    "No platform_staff row for this user (or role too low). Insert the owner row in Supabase SQL.",
};

type Props = { searchParams: Promise<{ reason?: string }> };

export default async function AdminAccessDeniedPage({ searchParams }: Props) {
  const { reason } = await searchParams;
  const detail = reason ? REASONS[reason] : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16 text-ink">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-ember-deep uppercase">
        Hansala · Platform
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
        Admin access denied
      </h1>
      {detail ? (
        <p className="mt-3 rounded-xl border border-line bg-surface px-4 py-3 text-[14px] text-ink">
          <span className="font-semibold">Failed check:</span> {reason}
          <br />
          <span className="text-ink-soft">{detail}</span>
        </p>
      ) : (
        <p className="mt-3 text-[14px] text-ink-soft">
          This account is not on the platform staff list.
        </p>
      )}
      <Link
        href="/admin"
        className="mt-8 text-[13px] font-semibold text-ember underline-offset-2 hover:underline"
      >
        Try /admin again →
      </Link>
    </div>
  );
}

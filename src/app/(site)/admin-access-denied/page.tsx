import Link from "next/link";

export const metadata = { title: "Admin · Access denied" };

export default function AdminAccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-16 text-ink">
      <p className="text-[10px] font-semibold tracking-[0.14em] text-ember uppercase">
        Hansala · Platform
      </p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-[-0.03em]">
        Admin access denied
      </h1>
      <p className="mt-3 text-[14px] text-ink-soft">
        This account is not on the platform staff list. Production access needs
        all three:
      </p>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] text-ink-soft">
        <li>
          Email in Vercel <code className="text-ink">PLATFORM_ADMIN_EMAILS</code>{" "}
          + a redeploy
        </li>
        <li>Admin migrations applied to Supabase</li>
        <li>
          A <code className="text-ink">platform_staff</code> row for your user
          id
        </li>
      </ol>
      <p className="mt-4 text-[13px] text-muted">
        See <code className="text-ink">docs/admin-bootstrap.md</code>.
      </p>
      <Link
        href="/"
        className="mt-8 text-[13px] font-semibold text-ember underline-offset-2 hover:underline"
      >
        ← Back to site
      </Link>
    </div>
  );
}

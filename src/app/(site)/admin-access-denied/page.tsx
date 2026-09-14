import Link from "next/link";
import { signOutTo } from "@/features/auth/actions";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/** Same copy for every failure. Do not explain which gate failed. */
export default function AdminAccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue uppercase">
        Staff
      </p>
      <h1 className="mt-4 font-display text-chapter text-ink">
        This account cannot open admin.
      </h1>
      <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
        Platform admin is limited to staff accounts.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Back to Hansala
        </Link>
        <form action={signOutTo}>
          <input type="hidden" name="next" value="/login?next=/admin" />
          <button
            type="submit"
            className="text-[13px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Sign in with a different account
          </button>
        </form>
      </div>
    </div>
  );
}

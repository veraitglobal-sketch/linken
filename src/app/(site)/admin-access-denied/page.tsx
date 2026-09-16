import Link from "next/link";
import { signOutTo } from "@/features/auth/actions";

export const metadata = {
  title: "Access",
  robots: { index: false, follow: false },
};

/** Same copy for every failure. Do not explain which gate failed. */
export default function AdminAccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-4 py-16">
      <h1 className="font-display text-chapter text-ink">
        This account cannot open that page.
      </h1>
      <p className="mt-5 max-w-[42ch] text-[15px] leading-relaxed text-ink-soft">
        Sign in with a different account, or return to the site.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Back to Hansala
        </Link>
        <form action={signOutTo}>
          <input type="hidden" name="next" value="/login" />
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

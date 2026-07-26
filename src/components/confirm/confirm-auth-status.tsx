import Link from "next/link";
import { signOutTo } from "@/features/auth/actions";
import { createClient } from "@/lib/supabase/server";

/** Clear signed-in / Sign in label for invite & confirm headers. */
export async function ConfirmAuthStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
      >
        Sign in
      </Link>
    );
  }

  const email = user.email ?? "Signed in";

  return (
    <div className="flex max-w-[min(100%,14rem)] flex-col items-end gap-0.5 sm:max-w-none sm:flex-row sm:items-center sm:gap-3">
      <p className="truncate text-[11px] text-muted" title={email}>
        Signed in as <span className="font-semibold text-ink">{email}</span>
      </p>
      <form action={signOutTo}>
        <input type="hidden" name="next" value="/login" />
        <button
          type="submit"
          className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

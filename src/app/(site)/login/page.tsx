import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { LoginPanel } from "@/components/auth/login-panel";
import { LoginStage } from "@/components/auth/login-stage";
import { signOutTo } from "@/features/auth/actions";
import { VERIFY_EMAIL_COOKIE } from "@/features/auth/verify-email-cookie";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your Hansala account.",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    verify?: string;
    resent?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, verify, resent, next } = await searchParams;
  const nextPath =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  // Prefer httpOnly cookie over ?email= (avoid history/referrer leak).
  const jar = await cookies();
  const email = jar.get(VERIFY_EMAIL_COOKIE)?.value?.trim() || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="flex flex-1 items-center px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[min(68vh,680px)] lg:grid-cols-[0.95fr_1.05fr]">
        <LoginStage />
        {user && verify !== "1" ? (
          <AlreadySignedIn email={user.email ?? "your account"} next={nextPath} />
        ) : (
          <LoginPanel
            error={error}
            verify={verify}
            email={email}
            resent={resent}
            next={next}
          />
        )}
      </div>
    </section>
  );
}

function AlreadySignedIn({ email, next }: { email: string; next: string }) {
  return (
    <div className="relative flex flex-col justify-center border-t border-line bg-[#fbfbfc] px-6 py-8 sm:px-9 sm:py-10 lg:border-t-0 lg:border-l lg:border-white/10">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-[#1a5c51] uppercase">
        Already signed in
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.035em] text-ink">
        You’re signed in
      </h1>
      <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
        Active account:{" "}
        <span className="font-semibold text-ink">{email}</span>. To confirm an
        invite sent to a different inbox, sign out first, then sign in with that
        email.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href={next} className="h-11 px-6">
          Continue
        </Button>
        <form action={signOutTo}>
          <input type="hidden" name="next" value={next} />
          <Button type="submit" variant="secondary" className="h-11 w-full px-6">
            Sign out and switch account
          </Button>
        </form>
      </div>
      <p className="mt-6 text-[13px] text-muted">
        Opened from Zoho or Mail? Use the same browser tab — or{" "}
        <Link href={next} className="font-semibold text-ink underline-offset-2 hover:underline">
          return to your invite link
        </Link>
        .
      </p>
    </div>
  );
}

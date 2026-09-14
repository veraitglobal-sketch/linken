import type { Metadata } from "next";
import { cookies } from "next/headers";
import { LoginAlreadySignedIn } from "@/components/auth/login-already-signed-in";
import { LoginPanel } from "@/components/auth/login-panel";
import { LoginStage } from "@/components/auth/login-stage";
import { isStaffLoginNext } from "@/features/auth/login-intent";
import { VERIFY_EMAIL_COOKIE } from "@/features/auth/verify-email-cookie";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    error?: string;
    verify?: string;
    resent?: string;
    next?: string;
  }>;
};

function loginNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { next } = await searchParams;
  if (isStaffLoginNext(loginNext(next))) {
    return {
      title: "Staff sign in",
      description: "Sign in with a staff account.",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: "Sign in",
    description: "Sign in or create your Hansala account.",
  };
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, verify, resent, next } = await searchParams;
  const nextPath = loginNext(next);
  const staff = isStaffLoginNext(nextPath);

  const jar = await cookies();
  const email = jar.get(VERIFY_EMAIL_COOKIE)?.value?.trim() || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="flex flex-1 items-center px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[min(68vh,680px)] lg:grid-cols-[0.95fr_1.05fr]">
        <LoginStage intent={staff ? "staff" : "company"} />
        {user && verify !== "1" ? (
          <LoginAlreadySignedIn
            email={user.email ?? "your account"}
            next={nextPath}
            staff={staff}
          />
        ) : (
          <LoginPanel
            error={error}
            verify={verify}
            email={email}
            resent={resent}
            next={next}
            intent={staff ? "staff" : "company"}
          />
        )}
      </div>
    </section>
  );
}

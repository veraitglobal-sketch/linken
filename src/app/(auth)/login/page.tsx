import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginAlreadySignedIn } from "@/components/auth/login-already-signed-in";
import { LoginPanel } from "@/components/auth/login-panel";
import { LoginStage } from "@/components/auth/login-stage";
import {
  isPlatformStaffUser,
  resolvePostLoginPath,
} from "@/features/admin/is-platform-staff";
import { VERIFY_EMAIL_COOKIE } from "@/features/auth/verify-email-cookie";
import { createClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<{
    error?: string;
    verify?: string;
    resent?: string;
    next?: string;
    email?: string;
  }>;
};

function loginNext(next: string | undefined) {
  return next && next.startsWith("/") && !next.startsWith("//")
    ? next
    : "/dashboard";
}

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your Hansala account.",
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, verify, resent, next, email: emailParam } = await searchParams;
  const nextPath = loginNext(next);

  const jar = await cookies();
  const email =
    jar.get(VERIFY_EMAIL_COOKIE)?.value?.trim() || emailParam?.trim() || undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && verify !== "1") {
    const staff = await isPlatformStaffUser(user.id, user.email);
    const dest = resolvePostLoginPath(staff, nextPath);
    return (
      <section className="grid min-h-dvh flex-1 lg:grid-cols-2">
        <LoginStage />
        <LoginAlreadySignedIn
          email={user.email ?? "your account"}
          next={dest}
        />
      </section>
    );
  }

  return (
    <section className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <LoginStage />
      <LoginPanel
        error={error}
        verify={verify}
        email={email}
        resent={resent}
        next={next}
      />
    </section>
  );
}

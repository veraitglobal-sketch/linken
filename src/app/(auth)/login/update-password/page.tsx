import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginStage } from "@/components/auth/login-stage";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "New password",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ error?: string }> };

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login/forgot");

  return (
    <section className="grid min-h-dvh flex-1 lg:grid-cols-2">
      <LoginStage />
      <UpdatePasswordForm error={error} />
    </section>
  );
}

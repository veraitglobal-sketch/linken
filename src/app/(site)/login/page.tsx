import type { Metadata } from "next";
import { LoginPanel } from "@/components/auth/login-panel";
import { LoginStage } from "@/components/auth/login-stage";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in or create your Hansala account.",
};

type Props = {
  searchParams: Promise<{
    error?: string;
    verify?: string;
    email?: string;
    resent?: string;
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error, verify, email, resent, next } = await searchParams;

  return (
    <section className="flex flex-1 items-center px-4 py-6">
      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[min(68vh,680px)] lg:grid-cols-[0.95fr_1.05fr]">
        <LoginStage />
        <LoginPanel
          error={error}
          verify={verify}
          email={email}
          resent={resent}
          next={next}
        />
      </div>
    </section>
  );
}

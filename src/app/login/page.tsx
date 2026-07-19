import type { Metadata } from "next";
import { signIn, signInWithGoogle, signUp } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";

export const metadata: Metadata = {
  title: "Sign in",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <SectionTitle
        title="Sign in"
        description="Company owners manage one firm profile and partner confirmations."
      />
      {error ? (
        <p className="mt-4 border border-[rgba(196,92,38,0.35)] bg-[rgba(196,92,38,0.08)] px-3 py-2 text-sm text-ink">
          {error}
        </p>
      ) : null}
      <form action={signInWithGoogle} className="mt-8">
        <Button type="submit" variant="secondary" className="w-full">
          Continue with Google
        </Button>
      </form>
      <div className="mt-4 flex items-center gap-3 text-xs text-ink/50">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
      <form action={signIn} className="mt-4 flex flex-col gap-3 border border-line bg-panel p-5">
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required minLength={6} />
        <Button type="submit" className="mt-2">
          Sign in
        </Button>
      </form>
      <form action={signUp} className="mt-4 flex flex-col gap-3 border border-line bg-panel p-5">
        <p className="text-sm font-medium text-ink">New here? Create an account</p>
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Password" required minLength={6} />
        <Button type="submit" variant="secondary">
          Create account
        </Button>
      </form>
    </div>
  );
}

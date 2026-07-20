"use client";

import { useState } from "react";
import { signIn, signInWithGoogle, signUp } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type Mode = "sign-in" | "create";

type Props = {
  error?: string;
};

export function LoginPanel({ error }: Props) {
  const [mode, setMode] = useState<Mode>("sign-in");
  const isCreate = mode === "create";

  return (
    <div className="relative flex flex-col justify-center border-t border-line bg-[#fbfbfc] px-6 py-8 sm:px-9 sm:py-10 lg:border-t-0 lg:border-l lg:border-white/10">
      <div className="animate-rise">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-[#1a5c51] uppercase">
          {isCreate ? "New account" : "Welcome back"}
        </p>
        <h1 className="mt-3 font-display text-[clamp(1.7rem,2.4vw,2.15rem)] font-medium tracking-[-0.035em] text-ink">
          {isCreate ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-2 max-w-md text-[14px] leading-relaxed text-ink-soft">
          {isCreate
            ? "Start here. Next you register the company profile and publish your link."
            : "Enter with the account that owns your company profile."}
        </p>
      </div>

      <div className="animate-rise-delay mt-5 grid grid-cols-2 gap-1 rounded-2xl border border-line bg-white p-1">
        <ModeButton
          active={!isCreate}
          onClick={() => setMode("sign-in")}
          label="Sign in"
        />
        <ModeButton
          active={isCreate}
          onClick={() => setMode("create")}
          label="Create account"
        />
      </div>

      {error ? (
        <p className="mt-4 rounded-2xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}

      <div className="animate-rise-late mt-6 space-y-4">
        <form action={signInWithGoogle}>
          <Button type="submit" variant="secondary" className="h-12 w-full">
            Continue with Google
          </Button>
        </form>

        <div className="flex items-center gap-3 text-[12px] text-muted">
          <span className="h-px flex-1 bg-line" />
          or email
          <span className="h-px flex-1 bg-line" />
        </div>

        <form
          action={isCreate ? signUp : signIn}
          className="flex flex-col gap-4"
        >
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Email
            </span>
            <Input
              type="email"
              name="email"
              placeholder="you@company.com"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">
              Password
            </span>
            <Input
              type="password"
              name="password"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </label>
          <Button type="submit" className="mt-1 h-12 w-full">
            {isCreate ? "Create account" : "Sign in"}
          </Button>
        </form>

        <p className="text-center text-[13px] text-ink-soft">
          {isCreate ? (
            <>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => setMode("sign-in")}
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New to Linken?{" "}
              <button
                type="button"
                onClick={() => setMode("create")}
                className="font-semibold text-ink underline-offset-2 hover:underline"
              >
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 rounded-xl text-[13px] font-semibold transition-colors",
        active
          ? "bg-[#0e1f1c] text-white"
          : "bg-transparent text-ink-soft hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

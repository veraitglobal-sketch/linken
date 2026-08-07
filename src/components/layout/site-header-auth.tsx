"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { focusableLinkClass } from "@/components/a11y/focus";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product-model";

type AuthState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "user"; companySlug: string | null; email: string };

export function SiteHeaderAuth() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("session");
        const json = (await res.json()) as {
          user: { email: string; companySlug: string | null } | null;
        };
        if (cancelled) return;
        if (!json.user) {
          setAuth({ status: "anon" });
          return;
        }
        setAuth({
          status: "user",
          companySlug: json.user.companySlug,
          email: json.user.email,
        });
      } catch (err) {
        console.error("[SiteHeaderAuth]", err);
        if (!cancelled) setAuth({ status: "anon" });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (auth.status === "loading") {
    return (
      <div
        className="h-11 w-[7.5rem]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">Loading account</span>
      </div>
    );
  }

  if (auth.status === "user") {
    const slug = auth.companySlug;
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <nav
          className="mr-1 hidden items-center gap-4 md:flex"
          aria-label="Account"
        >
          {slug ? (
            <>
              <Link href={`/c/${slug}`} className={focusableLinkClass()}>
                {PRODUCT.company.label}
              </Link>
              <Link href="/dashboard" className={focusableLinkClass()}>
                Dashboard
              </Link>
              <Link href="/dashboard/inbox" className={focusableLinkClass()}>
                {PRODUCT.inbox.label}
              </Link>
            </>
          ) : (
            <Link href="/dashboard" className={focusableLinkClass()}>
              Dashboard
            </Link>
          )}
          <Link href="/pricing" className={focusableLinkClass()}>
            Pricing
          </Link>
        </nav>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center px-2 text-[12px] font-semibold text-ink md:hidden"
        >
          Workspace
        </Link>
        <span
          className="hidden max-w-[11rem] truncate text-[11px] text-muted lg:inline"
          title={auth.email}
        >
          Signed in as {auth.email}
        </span>
        <form action={signOut}>
          <Button
            type="submit"
            variant="secondary"
            className="h-11 px-4 text-[12px]"
          >
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <nav className="mr-1 hidden items-center gap-4 md:flex" aria-label="Site">
        <Link href="/pricing" className={focusableLinkClass()}>
          Pricing
        </Link>
        <Link href="/dashboard" className={focusableLinkClass()}>
          Workspace
        </Link>
      </nav>
      <Button variant="ghost" href="/login" className="h-11 px-3 text-[12px]">
        Sign in
      </Button>
      <Button href="/onboarding" className="h-11 px-4 text-[12px]">
        Create company
      </Button>
    </div>
  );
}

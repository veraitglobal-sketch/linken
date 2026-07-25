"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product-model";

type AuthState =
  | { status: "loading" }
  | { status: "anon" }
  | { status: "user"; companySlug: string | null };

export function SiteHeaderAuth() {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          setAuth({ status: "anon" });
          return;
        }
        const { data: company } = await supabase
          .from("companies")
          .select("slug")
          .eq("owner_id", user.id)
          .eq("claimed", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();
        if (!cancelled) {
          setAuth({ status: "user", companySlug: company?.slug ?? null });
        }
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
    return <div className="h-9 w-[7.5rem]" aria-hidden />;
  }

  if (auth.status === "user") {
    const slug = auth.companySlug;
    return (
      <div className="flex items-center gap-2">
        <nav className="mr-2 hidden items-center gap-5 md:flex">
          {slug ? (
            <>
              <Link
                href={`/c/${slug}`}
                className="text-[13px] font-medium text-ink-soft hover:text-ink"
              >
                {PRODUCT.company.label}
              </Link>
              <Link
                href="/dashboard"
                className="text-[13px] font-medium text-ink-soft hover:text-ink"
              >
                {PRODUCT.map.label}
              </Link>
              <Link
                href="/dashboard/inbox"
                className="text-[13px] font-medium text-ink-soft hover:text-ink"
              >
                {PRODUCT.inbox.label}
              </Link>
            </>
          ) : (
            <Link
              href="/dashboard"
              className="text-[13px] font-medium text-ink-soft hover:text-ink"
            >
              Workspace
            </Link>
          )}
        </nav>
        <form action={signOut}>
          <Button
            type="submit"
            variant="secondary"
            className="h-9 px-4 text-[12px]"
          >
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <nav className="mr-2 hidden items-center gap-5 md:flex">
        <Link
          href="/dashboard"
          className="text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          Workspace
        </Link>
      </nav>
      <Button
        variant="ghost"
        href="/login"
        className="hidden h-9 px-3 sm:inline-flex"
      >
        Sign in
      </Button>
      <Button href="/onboarding" className="h-9 px-4 text-[12px]">
        Create company
      </Button>
    </div>
  );
}

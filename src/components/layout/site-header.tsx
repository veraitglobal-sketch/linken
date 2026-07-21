import Link from "next/link";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";
import { getDashboardSession } from "@/features/dashboard/session";
import { PRODUCT } from "@/lib/product-model";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { company } = user ? await getDashboardSession() : { company: null };
  const slug = company?.slug;

  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="glass-nav mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 rounded-2xl px-4">
        <Link href="/" className="inline-flex items-center gap-2.5 text-ink">
          <NetworkMark size={26} className="text-navy" />
          <span className="font-display text-[1.2rem] leading-none font-semibold tracking-[-0.035em]">
            Hansala
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {slug ? (
            <>
              <Link
                href={`/c/${slug}`}
                className="text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {PRODUCT.company.label}
              </Link>
              <Link
                href="/dashboard"
                className="text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {PRODUCT.map.label}
              </Link>
              <Link
                href="/dashboard/inbox"
                className="text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                {PRODUCT.inbox.label}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/search"
                className="text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Directory
              </Link>
              <Link
                href="/dashboard"
                className="text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
              >
                Workspace
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <form action={signOut}>
              <Button
                type="submit"
                variant="secondary"
                className="h-9 px-4 text-[12px]"
              >
                Sign out
              </Button>
            </form>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}

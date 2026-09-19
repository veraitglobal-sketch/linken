import Link from "next/link";
import { focusableLinkClass } from "@/components/a11y/focus";
import { SiteHeaderAnon } from "@/components/layout/site-header-anon";
import { signOut } from "@/features/auth/actions";
import type { HeaderAuth } from "@/features/auth/header-session";
import { Button } from "@/components/ui/button";
import { PRODUCT } from "@/lib/product-model";

export function SiteHeaderAuth({ auth }: { auth: HeaderAuth }) {
  if (auth.status !== "user") return <SiteHeaderAnon />;

  const slug = auth.companySlug;
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <nav
        className="mr-1 hidden items-center gap-4 md:flex"
        aria-label="Account"
      >
        <Link href="/search" className={focusableLinkClass()}>
          Search companies
        </Link>
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

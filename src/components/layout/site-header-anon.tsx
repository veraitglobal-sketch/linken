import Link from "next/link";
import { focusableLinkClass } from "@/components/a11y/focus";
import { Button } from "@/components/ui/button";

export function SiteHeaderAnon({ staff }: { staff?: boolean }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {staff ? null : (
        <nav className="mr-1 hidden items-center gap-4 md:flex" aria-label="Site">
          <Link href="/pricing" className={focusableLinkClass()}>
            Pricing
          </Link>
          <Link href="/dashboard" className={focusableLinkClass()}>
            Workspace
          </Link>
        </nav>
      )}
      <Button
        variant="ghost"
        href={staff ? "/login?next=/admin" : "/login"}
        className="h-11 px-3 text-[12px]"
      >
        Sign in
      </Button>
      {staff ? null : (
        /* Two labels: "Create company" does not fit a phone. Measured at 375px
           the full label overflowed and `Button` is shrink-0, so the page
           scrolled sideways. Same pattern as Search / Search companies. */
        <Button href="/onboarding" className="h-11 px-4 text-[12px]">
          <span className="sm:hidden">Create</span>
          <span className="hidden sm:inline">Create company</span>
        </Button>
      )}
    </div>
  );
}

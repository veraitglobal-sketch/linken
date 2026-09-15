import Link from "next/link";
import { focusableLinkClass } from "@/components/a11y/focus";
import { Button } from "@/components/ui/button";

export function SiteHeaderAnon({ staff }: { staff?: boolean }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {staff ? null : (
        /* Centred in the bar from lg, the way Thrivea's is: brand left, the
           site in the middle, the account on the right. */
        <nav
          className="mr-1 hidden items-center gap-6 md:flex lg:absolute lg:left-1/2 lg:mr-0 lg:-translate-x-1/2 lg:gap-8"
          aria-label="Site"
        >
          <Link href="/search" className={focusableLinkClass("text-[14px] text-ink")}>
            Search companies
          </Link>
          <Link href="/pricing" className={focusableLinkClass("text-[14px] text-ink")}>
            Pricing
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
        <Button href="/onboarding" className="h-11 !rounded-full !bg-navy px-4 text-[12px] hover:!bg-navy-deep">
          <span className="sm:hidden">Create</span>
          <span className="hidden sm:inline">Create company</span>
        </Button>
      )}
    </div>
  );
}

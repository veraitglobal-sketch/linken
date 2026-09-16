import Link from "next/link";
import { focusableLinkClass } from "@/components/a11y/focus";
import { Button } from "@/components/ui/button";

export function SiteHeaderAnon() {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
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
      <Button variant="ghost" href="/login" className="h-11 px-3 text-[12px]">
        Sign in
      </Button>
      <Button
        href="/onboarding"
        className="h-11 !rounded-full !bg-navy px-4 text-[12px] hover:!bg-navy-deep"
      >
        <span className="sm:hidden">Create</span>
        <span className="hidden sm:inline">Create company</span>
      </Button>
    </div>
  );
}

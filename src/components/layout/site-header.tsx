import Link from "next/link";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";
import { createClient } from "@/lib/supabase/server";

const links = [
  { href: "/search", label: "Directory" },
  { href: "/c/acme-architecture", label: "Example" },
  { href: "/dashboard", label: "Workspace" },
];

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 rounded-2xl border border-[#e6eaf0] bg-white px-4 shadow-[0_10px_36px_rgba(10,20,18,0.07)]">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[#141210]">
          <NetworkMark size={26} className="text-[#10231f]" />
          <span className="font-display text-[1.2rem] leading-none font-semibold tracking-[-0.03em]">
            Linken
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex h-9 items-center text-[13px] leading-none font-medium text-[#4a453f] transition-colors hover:text-[#141210]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button
                variant="ghost"
                href="/dashboard"
                className="hidden h-9 px-3 sm:inline-flex"
              >
                Dashboard
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="secondary" className="h-9 px-4 text-[12px]">
                  Sign out
                </Button>
              </form>
            </>
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

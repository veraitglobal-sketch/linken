import Link from "next/link";
import { Button } from "@/components/ui/button";

const links = [
  { label: "Directory", href: "/search" },
  { label: "Developers", href: "/developers" },
  { label: "Sign in", href: "/login" },
];

/** Static footer — no auth/DB so marketing pages can stay cached. */
export function SiteFooter() {
  return (
    <footer className="px-4 pb-8">
      <div className="mx-auto max-w-6xl rounded-[28px] bg-navy px-8 py-10 shadow-[0_22px_56px_rgba(8,20,18,0.18)]">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="text-white">
            <p className="font-display text-3xl tracking-[-0.035em]">Hansala</p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/58">
              Company profile. Case studies. Partners confirmed by both sides.
            </p>
          </div>
          <Button href="/onboarding" variant="light" className="h-11 px-6">
            Create company
          </Button>
        </div>
        <div className="mt-9 flex flex-col gap-3 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <nav className="flex flex-wrap gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/45 transition-colors hover:text-white/85"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-white/35">© 2026 Hansala</p>
        </div>
      </div>
    </footer>
  );
}

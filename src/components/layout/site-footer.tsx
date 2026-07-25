import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

const product = [
  { label: "Directory", href: "/search" },
  { label: "Developers", href: "/developers" },
  { label: "Demo", href: "/demo" },
];

const account = [
  { label: "Sign in", href: "/login" },
  { label: "Create company", href: "/onboarding" },
];

/** Static footer — no auth/DB so marketing pages can stay cached. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-line bg-navy text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_0.8fr] lg:gap-16">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white"
            >
              <NetworkMark size={22} className="text-blue-soft" animate={false} />
              <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.035em]">
                Hansala
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
              Company profiles, case studies, and partners — public only after
              both sides confirm.
            </p>
            <Button
              href="/onboarding"
              variant="light"
              className="mt-7 h-11 px-5"
            >
              Create company
            </Button>
          </div>

          <nav aria-label="Product">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
              Product
            </p>
            <ul className="mt-4 space-y-3">
              {product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/58 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Account">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
              Account
            </p>
            <ul className="mt-4 space-y-3">
              {account.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-white/58 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© {year} Hansala. All rights reserved.</p>
          <p>Mutually confirmed project networks.</p>
        </div>
      </div>
    </footer>
  );
}

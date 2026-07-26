import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

const product = [
  { label: "Developers", href: "/developers" },
  { label: "Changelog", href: "/changelog" },
  { label: "Status", href: "/status" },
  { label: "Demo", href: "/demo" },
];

const developers = [
  { label: "API docs", href: "/developers" },
  { label: "OpenAPI", href: "/api/v1/openapi" },
  { label: "Webhooks", href: "/developers/webhooks" },
  { label: "API Terms", href: "/developers/api-terms" },
];

const legal = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Security", href: "/security" },
  { label: "Contact", href: "mailto:developers@hansala.com" },
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
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr] lg:gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 text-white">
              <NetworkMark size={22} className="text-blue-soft" animate={false} />
              <span className="font-display text-[1.35rem] font-semibold leading-none tracking-[-0.035em]">
                Hansala
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/55">
              Company profiles, case studies, and partners — public only after
              both sides confirm.
            </p>
            <Button href="/onboarding" variant="light" className="mt-7 h-11 px-5">
              Create company
            </Button>
          </div>

          <FooterNav title="Product" links={product} />
          <FooterNav title="Developers" links={developers} />
          <FooterNav title="Legal" links={[...legal, ...account]} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-5 text-[12px] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>© {year} Hansala. All rights reserved.</p>
          <p>
            <a
              href="mailto:developers@hansala.com"
              className="text-white/45 transition-colors hover:text-white"
            >
              developers@hansala.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
        {title}
      </p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href + link.label}>
            {link.href.startsWith("mailto:") ? (
              <a
                href={link.href}
                className="text-[14px] text-white/58 transition-colors hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-[14px] text-white/58 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

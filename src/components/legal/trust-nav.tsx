import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/company", label: "Company" },
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/data-deletion", label: "Data deletion" },
  { href: "/subprocessors", label: "Subprocessors" },
  { href: "/disclosure", label: "Disclosure" },
] as const;

/** Cross-links at the bottom of trust / legal pages. */
export function TrustNav({ current }: { current?: string }) {
  return (
    <nav aria-label="Trust and legal" className="mt-12 border-t border-line pt-8">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        Trust &amp; legal
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {LINKS.filter((l) => l.href !== current).map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

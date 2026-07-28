"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/testimonials", label: "Testimonials" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto mt-3 flex max-w-6xl gap-1 overflow-x-auto">
      {LINKS.map((item) => {
        const on =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
              on ? "bg-navy text-paper" : "text-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/companies", label: "Companies" },
  { href: "/admin/duplicates", label: "Duplicates" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/disputes", label: "Disputes" },
  { href: "/admin/email", label: "Email" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/audit", label: "Audit" },
] as const;

export function AdminNav({ orientation = "row" }: { orientation?: "row" | "col" }) {
  const pathname = usePathname();
  const col = orientation === "col";

  return (
    <nav
      className={cn(
        col
          ? "flex flex-col gap-0.5"
          : "flex gap-1 overflow-x-auto px-4 py-2 lg:hidden",
      )}
    >
      {LINKS.map((item) => {
        const on =
          "exact" in item && item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 text-[13px] font-medium transition-colors",
              col
                ? "relative flex h-9 items-center rounded-xl px-2.5"
                : "rounded-full px-3 py-1.5",
              on
                ? col
                  ? "bg-navy/[0.06] font-semibold text-ink"
                  : "bg-navy text-on-navy"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {col && on ? (
              <span
                className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-full bg-navy"
                aria-hidden
              />
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

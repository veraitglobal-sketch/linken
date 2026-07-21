"use client";

import Link from "next/link";
import { PRODUCT } from "@/lib/product-model";
import { cn } from "@/lib/cn";

type Props = {
  pathname: string;
  companySlug?: string | null;
};

export function WorkspaceMobileNav({ pathname, companySlug }: Props) {
  const items = [
    ...(companySlug
      ? [[`/c/${companySlug}`, PRODUCT.company.label] as const]
      : []),
    ["/dashboard", PRODUCT.map.label] as const,
    ["/dashboard/inbox", PRODUCT.inbox.label] as const,
  ];

  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line/70 bg-[#f7f8f6] px-3 py-2 lg:hidden">
      {items.map(([href, label]) => {
        const on =
          href === "/dashboard"
            ? pathname === href
            : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
              on
                ? "bg-navy font-semibold text-white"
                : "text-muted hover:text-ink",
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}

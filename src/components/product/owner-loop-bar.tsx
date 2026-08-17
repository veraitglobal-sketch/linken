import Link from "next/link";
import { PRODUCT } from "@/lib/product-model";
import { cn } from "@/lib/cn";

type Props = {
  companySlug: string;
  /** Which of the three you’re on. */
  active: "company" | "map" | "inbox";
  /** Floating chip style for the full-bleed Map. */
  overlay?: boolean;
};

const ITEMS = [
  {
    id: "company" as const,
    label: PRODUCT.company.label,
    href: (s: string) => `/c/${s}`,
  },
  {
    id: "map" as const,
    label: PRODUCT.map.label,
    href: () => "/dashboard",
  },
  {
    id: "inbox" as const,
    label: PRODUCT.inbox.label,
    href: () => "/dashboard/inbox",
  },
];

/** Same three places everywhere — so Company / Map / Inbox feel like one app. */
export function OwnerLoopBar({
  companySlug,
  active,
  overlay = false,
}: Props) {
  const chips = (
    <div className="flex flex-wrap items-center gap-1">
      {ITEMS.map((item) => {
        const on = active === item.id;
        return (
          <Link
            key={item.id}
            href={item.href(companySlug)}
            className={cn(
              "inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold transition-colors",
              on
                ? "bg-navy text-white"
                :                 overlay
                  ? "bg-surface text-ink ring-1 ring-line hover:bg-paper"
                  : "text-ink hover:bg-paper",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );

  if (overlay) return chips;

  return (
    <div className="mx-auto mt-4 max-w-6xl px-4 md:hidden">
      <div className="rounded-2xl border border-line bg-surface px-3 py-3 sm:px-4">
        {chips}
        <p className="mt-2.5 px-1 text-[12px] leading-relaxed text-muted">
          {PRODUCT.oneLiner}
        </p>
      </div>
    </div>
  );
}

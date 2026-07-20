import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = "leads" | "requests";

type Props = {
  active: Tab;
  leadsCount?: number;
  requestsCount?: number;
};

export function RadarTabs({
  active,
  leadsCount = 0,
  requestsCount = 0,
}: Props) {
  const tabs: { id: Tab; label: string; href: string; meta?: string }[] = [
    {
      id: "leads",
      label: "Company leads",
      href: "/dashboard/radar?tab=leads",
      meta: leadsCount > 0 ? String(leadsCount) : undefined,
    },
    {
      id: "requests",
      label: "Project requests",
      href: "/dashboard/radar?tab=requests",
      meta: requestsCount > 0 ? String(requestsCount) : undefined,
    },
  ];

  return (
    <div className="flex gap-1 rounded-xl border border-line bg-paper/60 p-1">
      {tabs.map((tab) => {
        const on = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-semibold transition-colors",
              on
                ? "bg-navy text-white shadow-sm"
                : "text-ink hover:bg-surface",
            )}
          >
            {tab.label}
            {tab.meta ? (
              <span
                className={cn(
                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                  on
                    ? "bg-white/15 text-white"
                    : "bg-surface text-ink ring-1 ring-line",
                )}
              >
                {tab.meta}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

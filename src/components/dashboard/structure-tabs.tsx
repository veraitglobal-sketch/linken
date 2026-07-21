import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = "tree" | "grow";

type Props = {
  active: Tab;
  hasGroup: boolean;
  confirmed: number;
  pending: number;
};

export function StructureTabs({
  active,
  hasGroup,
  confirmed,
  pending,
}: Props) {
  const tabs: { id: Tab; label: string; href: string; meta?: string; show: boolean }[] =
    [
      {
        id: "tree",
        label: "Tree",
        href: "/dashboard/structure?tab=tree",
        meta: confirmed > 0 ? String(confirmed) : undefined,
        show: true,
      },
      {
        id: "grow",
        label: hasGroup ? "Add firms" : "Create group",
        href: "/dashboard/structure?tab=grow",
        meta: pending > 0 ? String(pending) : undefined,
        show: true,
      },
    ];

  return (
    <div className="flex gap-1 rounded-xl border border-line bg-paper/60 p-1">
      {tabs
        .filter((t) => t.show)
        .map((tab) => {
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

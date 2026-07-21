import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = "people" | "invite" | "you";

type Props = {
  active: Tab;
  membersCount: number;
  pendingCount: number;
  showInvite: boolean;
  showYou: boolean;
  youNeedsSetup?: boolean;
};

export function TeamTabs({
  active,
  membersCount,
  pendingCount,
  showInvite,
  showYou,
  youNeedsSetup,
}: Props) {
  const tabs: {
    id: Tab;
    label: string;
    href: string;
    meta?: string;
    show: boolean;
  }[] = [
    {
      id: "people",
      label: "People",
      href: "/dashboard/team?tab=people",
      meta: membersCount > 0 ? String(membersCount) : undefined,
      show: true,
    },
    {
      id: "invite",
      label: "Invite",
      href: "/dashboard/team?tab=invite",
      meta: pendingCount > 0 ? String(pendingCount) : undefined,
      show: showInvite,
    },
    {
      id: "you",
      label: youNeedsSetup ? "Your card" : "You",
      href: "/dashboard/team?tab=you",
      meta: youNeedsSetup ? "!" : undefined,
      show: showYou,
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
                      : tab.meta === "!"
                        ? "bg-ember/15 text-ember ring-1 ring-ember/25"
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

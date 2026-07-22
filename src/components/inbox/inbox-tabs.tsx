import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = "inquiries" | "intros" | "partners" | "requests";

type Props = {
  active: Tab;
  inquiryNew?: number;
  introsCount?: number;
  partnersCount?: number;
  requestsCount?: number;
};

export function InboxTabs({
  active,
  inquiryNew = 0,
  introsCount = 0,
  partnersCount = 0,
  requestsCount = 0,
}: Props) {
  const tabs: { id: Tab; label: string; href: string; meta?: string }[] = [
    {
      id: "inquiries",
      label: "Inquiries",
      href: "/dashboard/inbox",
      meta: inquiryNew > 0 ? String(inquiryNew) : undefined,
    },
    {
      id: "partners",
      label: "Partner requests",
      href: "/dashboard/inbox?tab=partners",
      meta: partnersCount > 0 ? String(partnersCount) : undefined,
    },
    {
      id: "requests",
      label: "Requests",
      href: "/dashboard/inbox?tab=requests",
      meta: requestsCount > 0 ? String(requestsCount) : undefined,
    },
    {
      id: "intros",
      label: "Intros",
      href: "/dashboard/inbox?tab=intros",
      meta: introsCount > 0 ? String(introsCount) : undefined,
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
                  on ? "bg-white/15 text-white" : "bg-surface text-ink ring-1 ring-line",
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

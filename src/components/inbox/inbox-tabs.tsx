import Link from "next/link";
import { cn } from "@/lib/cn";

type Tab = "inquiries" | "intros";

type Props = {
  active: Tab;
};

export function InboxTabs({ active }: Props) {
  const tabs: { id: Tab; label: string; href: string }[] = [
    { id: "inquiries", label: "Inquiries", href: "/dashboard/inbox" },
    { id: "intros", label: "Intros", href: "/dashboard/inbox?tab=intros" },
  ];

  return (
    <div className="mb-6 flex gap-1 border-b border-line pb-px">
      {tabs.map((tab) => {
        const on = active === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-[13px] font-medium transition-colors",
              on
                ? "border-ink text-ink"
                : "border-transparent text-[#64748b] hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

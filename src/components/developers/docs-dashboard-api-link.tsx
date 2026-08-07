import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

export function DocsDashboardApiLink({ children, className }: Props) {
  return (
    <Link
      href="/dashboard/api"
      className={cn(
        "font-semibold text-ink underline underline-offset-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { NetworkMark } from "@/components/marketing/network-mark";

/** Lean shell for email confirmation links opened on phones. */
export default function ConfirmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#f4f5f3] text-ink">
      <header className="flex h-12 shrink-0 items-center px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-ink transition-opacity hover:opacity-75"
        >
          <NetworkMark size={18} className="text-navy" />
          <span className="font-display text-[15px] font-semibold tracking-[-0.04em]">
            Hansala
          </span>
        </Link>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { SkipLink } from "@/components/a11y/skip-link";
import { ConfirmAuthStatus } from "@/components/confirm/confirm-auth-status";
import { NetworkMark } from "@/components/marketing/network-mark";

/** Lean shell for email confirmation — same calm paper as marketing. */
export default function ConfirmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-paper text-ink">
      <SkipLink />
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-line/70 bg-surface/90 px-4 backdrop-blur-sm sm:px-5">
        <Link
          href="/"
          className="inline-flex min-h-10 shrink-0 items-center gap-2 text-ink transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-soft)]"
        >
          <NetworkMark size={16} className="text-navy" />
          <span className="font-display text-[14px] font-semibold tracking-[-0.04em]">
            Hansala
          </span>
        </Link>
        <ConfirmAuthStatus />
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-5 sm:py-6"
      >
        {children}
      </main>
    </div>
  );
}

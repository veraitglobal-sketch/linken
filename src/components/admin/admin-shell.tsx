import type { ReactNode } from "react";
import Link from "next/link";
import { SkipLink } from "@/components/a11y/skip-link";
import { AdminNav } from "@/components/admin/admin-nav";
import { NetworkMark } from "@/components/marketing/network-mark";
import { signOutTo } from "@/features/auth/actions";
import type { PlatformStaffRole } from "@/features/admin/roles";

type Props = {
  email: string;
  role: PlatformStaffRole;
  children: ReactNode;
};

export function AdminShell({ email, role, children }: Props) {
  return (
    <div className="flex min-h-dvh bg-mute text-ink">
      <SkipLink />
      <aside className="hidden w-[240px] shrink-0 flex-col border-r border-line/55 bg-surface lg:flex">
        <div className="flex h-14 items-center gap-2.5 px-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2.5 text-ink transition-opacity hover:opacity-75"
          >
            <NetworkMark size={19} className="text-navy" />
            <span className="font-display text-[15px] font-semibold tracking-[-0.045em]">
              Staff
            </span>
          </Link>
        </div>
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <AdminNav orientation="col" />
          <div className="mt-auto border-t border-line/70 pt-3">
            <p className="truncate px-2.5 font-label text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
              {role}
            </p>
            <p className="mt-1 truncate px-2.5 text-[12px] text-ink-soft">{email}</p>
            <form action={signOutTo} className="mt-2 px-2.5">
              <input type="hidden" name="next" value="/" />
              <button
                type="submit"
                className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 sm:px-7">
          <Link href="/admin" className="inline-flex items-center gap-2 text-ink lg:hidden">
            <NetworkMark size={18} className="text-navy" />
            <span className="font-display text-[15px] font-semibold tracking-[-0.045em]">
              Staff
            </span>
          </Link>
          <p className="hidden font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase lg:block">
            Platform
          </p>
          <p className="ml-auto truncate text-[12px] text-muted lg:hidden">{role}</p>
          <Link
            href="/"
            className="ml-auto hidden text-[12px] font-semibold text-ink underline-offset-2 hover:underline lg:inline"
          >
            View site
          </Link>
        </header>
        <AdminNav />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-7"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

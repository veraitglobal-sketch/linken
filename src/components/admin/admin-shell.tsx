import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import type { PlatformStaffRole } from "@/features/admin/roles";

type Props = {
  email: string;
  role: PlatformStaffRole;
  children: ReactNode;
};

export function AdminShell({ email, role, children }: Props) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="border-b border-line bg-surface px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.14em] text-ember uppercase">
              Hansala · Platform
            </p>
            <h1 className="font-display text-lg font-semibold tracking-[-0.03em]">
              Admin
            </h1>
          </div>
          <p className="hidden truncate text-[12px] text-muted sm:block">
            {email}
            <span className="ml-2 text-ink-soft">· {role}</span>
          </p>
        </div>
        <AdminNav />
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}

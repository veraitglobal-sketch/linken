import type { ReactNode } from "react";

/** Quiet app shell — forest paper, not slate SaaS grey. */
export default function WorkspaceRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#f0f2f0] text-ink">
      {children}
    </div>
  );
}

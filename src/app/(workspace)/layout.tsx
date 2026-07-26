import type { ReactNode } from "react";

/** Quiet app shell — same forest paper as marketing. */
export default function WorkspaceRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-paper text-ink">
      {children}
    </div>
  );
}

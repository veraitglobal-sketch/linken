import type { ReactNode } from "react";

/** Clean light app shell — modern SaaS, not marketing mesh. */
export default function WorkspaceRootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#f5f6f8] text-ink">
      {children}
    </div>
  );
}

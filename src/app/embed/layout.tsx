import type { ReactNode } from "react";

/** Minimal chrome — widgets sit in customer iframes. */
export default function EmbedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="m-0 min-h-full bg-transparent p-0">{children}</div>
  );
}

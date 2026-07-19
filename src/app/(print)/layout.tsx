import type { ReactNode } from "react";

/** Minimal shell — no site header/footer (one-pager / print documents). */
export default function PrintLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-full bg-[#f7f8fa]">{children}</div>;
}

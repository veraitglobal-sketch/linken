import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type Props = {
  children: ReactNode;
};

export function PageShell({ children }: Props) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-navy px-4 py-2.5 text-[13px] font-semibold text-white focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex min-h-0 flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

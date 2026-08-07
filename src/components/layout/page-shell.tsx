import { SkipLink } from "@/components/a11y/skip-link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

type Props = {
  children: React.ReactNode;
};

export function PageShell({ children }: Props) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SkipLink />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

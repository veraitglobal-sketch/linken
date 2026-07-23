import Link from "next/link";
import { PRODUCT } from "@/lib/product-model";

type Props = {
  companySlug: string;
};

const links = (slug: string) =>
  [
    { label: PRODUCT.company.label, href: `/c/${slug}`, hint: "Public page" },
    { label: PRODUCT.map.label, href: "/dashboard", hint: "Your network" },
    { label: "Case studies", href: "/dashboard/cases", hint: "Portfolio" },
    { label: "Verification", href: "/dashboard/verification", hint: "Domain" },
    { label: "Widgets", href: "/dashboard/widgets", hint: "Embed badge" },
    { label: PRODUCT.inbox.label, href: "/dashboard/inbox", hint: "Requests" },
  ] as const;

export function WelcomeQuickLinks({ companySlug }: Props) {
  return (
    <section className="mt-10 rounded-[28px] border border-line bg-surface px-6 py-6 sm:px-8">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
        Jump to
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {links(companySlug).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-xl border border-line bg-paper px-4 py-3 transition-colors hover:border-blue/25 hover:bg-surface"
          >
            <span>
              <span className="block text-[14px] font-semibold text-ink">
                {item.label}
              </span>
              <span className="block text-[12px] text-muted">{item.hint}</span>
            </span>
            <span className="text-muted">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

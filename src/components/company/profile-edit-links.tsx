import Link from "next/link";
import { HowHansalaWorks } from "@/components/product/how-linken-works";
import { PRODUCT } from "@/lib/product-model";

const LINKS = [
  {
    href: (s: string) => `/c/${s}?add=1#add-partner`,
    title: "Partners",
    body: PRODUCT.partners.job,
  },
  {
    href: (s: string) => `/dashboard/team?from=${s}`,
    title: "Team",
    body: "Invite people and choose who appears on the public profile.",
  },
  {
    href: (s: string) => `/c/${s}#references`,
    title: "References",
    body: "Client evidence — stays on this company profile.",
  },
  {
    href: (s: string) => `/c/${s}#testimonials`,
    title: "Testimonials",
    body: "Client-written words — appear here after they confirm and publish.",
  },
  {
    href: (_s: string) => `/dashboard/cases`,
    title: "Case studies",
    body: "Create in dashboard — email the client for confirmation in one step.",
  },
] as const;

type Props = { slug: string };

export function ProfileEditLinks({ slug }: Props) {
  return (
    <div className="space-y-4">
      <HowHansalaWorks />
      <section className="rounded-2xl border border-line bg-surface px-5 py-5 sm:px-6">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
          Add on company
        </p>
        <p className="mt-1 text-[13px] text-muted">{PRODUCT.company.job}</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {LINKS.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href(slug)}
                className="block rounded-xl border border-line bg-paper/50 px-3.5 py-3 transition-colors hover:bg-paper"
              >
                <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-muted">
                  {item.body}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

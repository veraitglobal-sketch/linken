import Link from "next/link";
import { DashboardCtaLink } from "@/components/dashboard/home/dashboard-cta-link";

type Props = {
  companyId: string;
  companySlug: string;
  showDeveloperLinks: boolean;
  proofShared: boolean;
};

export function HomeQuickLinks({
  companyId,
  companySlug,
  showDeveloperLinks,
  proofShared,
}: Props) {
  const links = [
    {
      id: "open_map",
      href: "/dashboard/map",
      label: "Open network map",
    },
    {
      id: "open_one_pager",
      href: `/c/${companySlug}/one-pager`,
      label: "Export one-pager for proposals",
    },
    {
      id: "share_proof",
      href: "/dashboard/widgets",
      label: proofShared ? "Manage embeds" : "Add embed to your website",
    },
  ];

  return (
    <section className="rounded-[20px] border border-line bg-surface px-5 py-5">
      <h2 className="font-display text-[16px] font-medium text-ink">
        Useful actions
      </h2>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.id}>
            <DashboardCtaLink
              companyId={companyId}
              ctaId={l.id}
              href={l.href}
              className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
            >
              {l.label} →
            </DashboardCtaLink>
          </li>
        ))}
        {showDeveloperLinks ? (
          <li>
            <Link
              href="/dashboard/api"
              className="text-[13px] font-medium text-ink underline-offset-2 hover:underline"
            >
              Agent API &amp; webhooks →
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

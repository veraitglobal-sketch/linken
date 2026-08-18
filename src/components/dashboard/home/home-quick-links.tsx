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
    { id: "open_map", href: "/dashboard/map", label: "Map" },
    {
      id: "open_one_pager",
      href: `/c/${companySlug}/one-pager`,
      label: "One-pager",
    },
    {
      id: "share_proof",
      href: "/dashboard/widgets",
      label: proofShared ? "Embeds" : "Embed",
    },
  ];

  return (
    <section className="rounded-tile border border-line bg-surface px-5 py-5">
      <h2 className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
        Open
      </h2>
      <ul className="mt-3 divide-y divide-line/80">
        {links.map((l) => (
          <li key={l.id}>
            <DashboardCtaLink
              companyId={companyId}
              ctaId={l.id}
              href={l.href}
              className="flex h-10 items-center text-[13px] font-medium text-ink"
            >
              {l.label}
            </DashboardCtaLink>
          </li>
        ))}
        {showDeveloperLinks ? (
          <li>
            <Link
              href="/dashboard/api"
              className="flex h-10 items-center text-[13px] font-medium text-ink"
            >
              API & MCP
            </Link>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GroupProfile } from "@/components/groups/group-profile";
import { NetworkMapSection } from "@/components/network/network-map-section";
import { getGroupBySlug } from "@/features/groups/queries";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getGroupBySlug(slug);
  if (!page) return { title: "Group not found" };

  const url = `${getSiteUrl()}/g/${page.group.slug}`;
  return {
    title: page.group.name,
    description:
      page.group.description ||
      `${page.companyCount} companies in the ${page.group.name} group on Linken.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${page.group.name} · Linken`,
      description: page.group.description || "Company group on Linken",
      url,
    },
  };
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const page = await getGroupBySlug(slug);
  if (!page) notFound();

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: page.group.name,
    url: `${siteUrl}/g/${page.group.slug}`,
    description: page.group.description || undefined,
    sameAs: page.group.website || undefined,
    subOrganization: page.members.map((m) => ({
      "@type": "Organization",
      name: m.name,
      url: `${siteUrl}/c/${m.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GroupProfile
        page={page}
        networkMap={
          page.members.length >= 1 ? (
            <NetworkMapSection
              scope={{ type: "group", slug: page.group.slug }}
              title="Network map"
              minHeightClass="h-[70vh]"
            />
          ) : null
        }
      />
    </>
  );
}

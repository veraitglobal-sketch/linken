import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminCompanyOps } from "@/components/admin/admin-company-ops";
import { AdminFactTiles } from "@/components/admin/admin-fact-tiles";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getAdminCompanyDetail } from "@/features/admin/company-detail";
import type { DuplicateCandidate } from "@/features/admin/duplicates";
import { isPlatformStaffUser } from "@/features/admin/is-platform-staff";
import { requirePlatformStaff } from "@/features/admin/require-platform-admin";
import { roleMeetsMinimum } from "@/features/admin/roles";
import { listSameDomainPeers } from "@/features/admin/same-domain-peers";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const detail = await getAdminCompanyDetail(id);
  return { title: detail ? `Admin · ${detail.name}` : "Admin · Company" };
}

export default async function AdminCompanyDetailPage({ params }: Props) {
  const { role } = await requirePlatformStaff("support");
  const { id } = await params;
  const detail = await getAdminCompanyDetail(id);
  if (!detail) notFound();

  const canWrite = roleMeetsMinimum(role, "admin");
  const canRemove = roleMeetsMinimum(role, "owner");
  const lastCheck = detail.verification?.lastCheck
    ? new Date(detail.verification.lastCheck).toLocaleDateString("en-GB")
    : "—";

  const sameDomain = await listSameDomainPeers(detail.id, detail.website);
  const mergeCompanies: DuplicateCandidate[] | null = sameDomain
    ? [
        {
          id: detail.id,
          name: detail.name,
          slug: detail.slug,
          website: detail.website,
          claimed: detail.claimed,
          verified: detail.verified,
          createdAt: detail.createdAt,
        },
        ...sameDomain.peers,
      ]
    : null;

  const ownerIsStaff =
    detail.ownerId && detail.ownerEmail
      ? await isPlatformStaffUser(detail.ownerId, detail.ownerEmail)
      : false;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={detail.name}
        back={{ href: "/admin/companies", label: "← Companies" }}
        note={
          <>
            /{detail.slug}
            {detail.website ? ` · ${detail.website}` : ""}
            {" · "}
            <Link
              href={`/c/${detail.slug}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Public profile
            </Link>
            {" · "}
            <Link
              href={`/admin/companies/${detail.id}/support`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Support view
            </Link>
          </>
        }
      />

      <AdminFactTiles
        items={[
          [
            "Status",
            `${detail.claimed ? "Claimed" : "Unclaimed"}${detail.verified ? " · Verified" : ""}${detail.staffHiddenAt ? " · Hidden" : ""}`,
          ],
          [
            "Plan",
            `${detail.plan ?? "free"}${detail.staffPlanLock ? " · locked" : ""}`,
          ],
          ["Credits", String(detail.creditsBalance)],
          ["Radar", detail.radar ? "On" : "Off"],
          ["Owner", detail.ownerEmail ?? "—"],
          ["Partners", String(detail.partnersCount)],
          ["Testimonials", String(detail.testimonialsCount)],
          ["Case studies", String(detail.casesCount)],
        ]}
      />

      <AdminCompanyOps
        detail={detail}
        canWrite={canWrite}
        canRemove={canRemove}
        lastCheck={lastCheck}
        ownerIsStaff={Boolean(ownerIsStaff)}
        sameDomain={sameDomain}
        mergeCompanies={mergeCompanies}
      />
    </div>
  );
}

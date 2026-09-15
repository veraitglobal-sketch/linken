import type { Metadata } from "next";
import Link from "next/link";
import { SwitchCompanyNotice } from "@/components/dashboard/switch-company-notice";
import { WorkspaceCard, WorkspacePage } from "@/components/dashboard/workspace-page";
import { AddBranchForm } from "@/components/relationships/add-branch-form";
import { AddJointForm } from "@/components/relationships/add-joint-form";
import { AddKindPicker } from "@/components/relationships/add-kind-picker";
import { AddPartnerPanel } from "@/components/relationships/add-partner-panel";
import { AddRecordFlash } from "@/components/relationships/add-record-flash";
import { AddReferenceForm } from "@/components/references/add-reference-form";
import { searchCompanies } from "@/features/companies/queries";
import { getPartnershipInbox } from "@/features/partners/inbox";
import { parseRelationshipKind } from "@/features/relationships/kinds";
import { assertCompanySection } from "@/features/workspace/company-gate";

export const metadata: Metadata = { title: "Add a record" };

type Props = {
  searchParams: Promise<{
    kind?: string;
    q?: string;
    error?: string;
    created?: string;
    invited?: string;
    subsidiary?: string;
    refAdded?: string;
    proposed?: string;
  }>;
};

export default async function DashboardAddPage({ searchParams }: Props) {
  const sp = await searchParams;
  const kind = parseRelationshipKind(sp.kind);
  const { company, needsCompanySwitch } = await assertCompanySection("network", {
    loginNext: "/dashboard/add",
  });

  if (needsCompanySwitch) {
    return <SwitchCompanyNotice title="Add a record" />;
  }

  if (!company) {
    return (
      <WorkspacePage title="Add a record" description="One place for every business link.">
        <p className="text-[14px] text-muted">
          <Link href="/onboarding" className="font-semibold text-ink underline">
            Create your company
          </Link>{" "}
          first.
        </p>
      </WorkspacePage>
    );
  }

  const q = (sp.q ?? "").trim();
  const inbox = await getPartnershipInbox(company.id);
  const statusBySlug = new Map<string, string>();
  for (const row of inbox.accepted) statusBySlug.set(row.other.slug, "Official");
  for (const row of inbox.outgoingPending) statusBySlug.set(row.other.slug, "Pending");
  for (const row of inbox.incomingPending) statusBySlug.set(row.other.slug, "Incoming");

  const results =
    kind === "partner" && q ? await searchCompanies(q, { includeUnclaimed: true }) : [];

  return (
    <WorkspacePage
      wide
      title="Add a record"
      description="Partner, client, branch, or joint company. Public after they confirm — except a branch you own."
    >
      <div className="space-y-6">
        <AddRecordFlash
          error={sp.error}
          created={sp.created}
          invited={sp.invited}
          subsidiary={sp.subsidiary}
          refAdded={sp.refAdded}
          proposed={sp.proposed}
        />
        <AddKindPicker active={kind} />
        {kind ? (
          <WorkspaceCard>
            {kind === "partner" ? (
              <AddPartnerPanel
                q={q}
                results={results.filter((c) => c.id !== company.id)}
                verified={company.verified}
                statusBySlug={statusBySlug}
                companySlug={company.slug}
              />
            ) : null}
            {kind === "client" ? (
              <AddReferenceForm
                companySlug={company.slug}
                startOpen
                back="/dashboard/add?kind=client"
              />
            ) : null}
            {kind === "branch" ? (
              <AddBranchForm category={company.category} city={company.city} />
            ) : null}
            {kind === "joint" ? (
              <AddJointForm
                partners={inbox.accepted.map((r) => ({
                  id: r.other.id,
                  name: r.other.name,
                }))}
                category={company.category}
                city={company.city}
              />
            ) : null}
          </WorkspaceCard>
        ) : (
          <p className="text-[13px] text-muted">Pick what this is, then fill the form.</p>
        )}
      </div>
    </WorkspacePage>
  );
}

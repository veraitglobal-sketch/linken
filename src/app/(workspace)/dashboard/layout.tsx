import type { ReactNode } from "react";
import { OperatorBranchBanner } from "@/components/dashboard/operator-branch-banner";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { getActivationChecklist } from "@/features/activation/checklist";
import { companyHasReferrals } from "@/features/commissions/queries";
import { getDashboardSession } from "@/features/dashboard/session";
import { getCompanyVerification } from "@/features/verification/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, active, contexts, company } = await getDashboardSession();

  let verified = false;
  let checklist = null;
  let showDeveloperNav = false;
  let operatorBanner = null as ReactNode;

  if (company) {
    const [verification, activation, hasReferrals] = await Promise.all([
      getCompanyVerification(company.id),
      company.role === "owner" || company.role === "operator"
        ? getActivationChecklist(company.id)
        : Promise.resolve(null),
      companyHasReferrals(company.id),
    ]);
    verified = Boolean(verification?.verified);
    checklist =
      activation && !activation.complete ? activation : null;
    showDeveloperNav = hasReferrals;

    if (company.role === "operator" && company.claimed === false) {
      const supabase = await createClient();
      const { data: banner } = await supabase.rpc("get_operator_branch_banner", {
        p_company_id: company.id,
      });
      const row = Array.isArray(banner) ? banner[0] : banner;
      if (row) {
        operatorBanner = (
          <OperatorBranchBanner
            companyId={company.id}
            creatorName={(row.creator_name as string) || "The parent company"}
            hasInviteEmail={Boolean(row.has_invite_email)}
          />
        );
      }
    }
  }

  const allowedSections =
    company?.role === "member" ? (company.permissions ?? []) : null;

  return (
    <WorkspaceShell
      signedIn={Boolean(user)}
      active={active}
      contexts={contexts}
      verified={verified}
      checklist={checklist}
      allowedSections={allowedSections}
      showDeveloperNav={showDeveloperNav}
      operatorBanner={operatorBanner}
    >
      {children}
    </WorkspaceShell>
  );
}

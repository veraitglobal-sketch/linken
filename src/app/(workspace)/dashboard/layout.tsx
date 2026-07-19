import type { ReactNode } from "react";
import { WorkspaceShell } from "@/components/dashboard/workspace-shell";
import { getDashboardSession } from "@/features/dashboard/session";
import { companyDisplayLogoUrl } from "@/features/logo/display-url";
import { getCompanyVerification } from "@/features/verification/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { company } = await getDashboardSession();

  let logoUrl: string | null = null;
  let website: string | null = null;
  let verified = false;

  if (company) {
    const supabase = await createClient();
    const [{ data: full }, verification] = await Promise.all([
      supabase
        .from("companies")
        .select("logo_url, website")
        .eq("id", company.id)
        .maybeSingle(),
      getCompanyVerification(company.id),
    ]);
    website = full?.website ?? null;
    logoUrl = companyDisplayLogoUrl({
      logoUrl: full?.logo_url,
      website,
    });
    verified = Boolean(verification?.verified);
  }

  return (
    <WorkspaceShell
      company={
        company
          ? {
              name: company.name,
              slug: company.slug,
              logoUrl,
              website,
              verified,
            }
          : null
      }
    >
      {children}
    </WorkspaceShell>
  );
}

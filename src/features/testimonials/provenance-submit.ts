import "server-only";

import { resolveAuthorProvenance } from "@/features/testimonials/provenance";
import { createClient } from "@/lib/supabase/server";

export async function resolveSubmitProvenance(input: {
  authorCompanyId: string | null;
  storedAuthorEmail: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email =
    user?.email?.trim().toLowerCase() ||
    input.storedAuthorEmail?.trim().toLowerCase() ||
    null;

  let authorCompanyWebsite: string | null = null;
  let authorCompanyVerified = false;
  let authorCompanyClaimed = false;

  const companyId = input.authorCompanyId;
  if (companyId) {
    const { data: company } = await supabase
      .from("companies")
      .select("website, verified, claimed, owner_id")
      .eq("id", companyId)
      .maybeSingle();
    authorCompanyWebsite = (company?.website as string | null) ?? null;
    authorCompanyVerified = Boolean(company?.verified);
    authorCompanyClaimed = Boolean(company?.claimed && company?.owner_id);
  }

  const provenance = resolveAuthorProvenance({
    email,
    authorCompanyWebsite,
    authorCompanyVerified,
    authorCompanyClaimed,
  });

  return { email, ...provenance };
}

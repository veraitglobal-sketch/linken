import "server-only";

import { downloadBestLogo } from "@/features/logo/fetch-logo";
import type { FetchLogoResult } from "@/features/logo/fetch-logo";
import { extractDomain } from "@/features/verification/domain";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Pull group logo from website → company-logos/group/{groupId}/auto.{ext}.
 * Never overwrites logo_source = 'manual'.
 */
export async function fetchAndStoreGroupLogo(
  groupId: string,
): Promise<FetchLogoResult> {
  const admin = createAdminClient();
  if (!admin) {
    return { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY is required." };
  }

  const { data: group, error: loadError } = await admin
    .from("company_groups")
    .select("id, website, logo_url, logo_source")
    .eq("id", groupId)
    .maybeSingle();

  if (loadError || !group) {
    return { ok: false, error: loadError?.message ?? "Group not found." };
  }

  if (group.logo_source === "manual") {
    return { ok: false, error: "Manual logo is not overwritten.", skipped: true };
  }

  const domain = extractDomain(group.website ?? "");
  if (!domain) {
    return { ok: false, error: "Group has no valid website domain." };
  }

  const stored = await downloadBestLogo(domain);
  if (!stored.ok) return stored;

  const path = `group/${groupId}/auto.${stored.ext}`;
  const { error: uploadError } = await admin.storage
    .from("company-logos")
    .upload(path, stored.image, {
      upsert: true,
      contentType: stored.uploadType,
      cacheControl: "3600",
    });

  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = admin.storage.from("company-logos").getPublicUrl(path);
  const logoUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await admin
    .from("company_groups")
    .update({ logo_url: logoUrl, logo_source: "auto" })
    .eq("id", groupId)
    .or("logo_source.is.null,logo_source.eq.auto");

  if (updateError) return { ok: false, error: updateError.message };
  return { ok: true, logoUrl };
}

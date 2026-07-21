import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * When a company changes its handle, old links (QR codes, embeds on other
 * sites, printed one-pagers) must keep working. Call this on notFound()
 * before giving up — returns the current slug if the requested one is a
 * known old handle, else null.
 */
export async function resolveCompanySlugRedirect(
  slug: string,
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc(
      "resolve_company_slug_redirect",
      { p_old_slug: slug },
    );
    if (error || !data) return null;
    return data as string;
  } catch {
    return null;
  }
}

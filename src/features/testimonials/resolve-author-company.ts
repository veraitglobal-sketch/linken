import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  extractDomain,
  isPublicEmailProvider,
} from "@/features/verification/domain";

/**
 * Resolve a claimed Hansala company from website/domain.
 * Strict: exact host or parent — never a subdomain of the site.
 */
export async function resolveAuthorCompanyByWebsite(
  supabase: SupabaseClient,
  website: string,
): Promise<{ id: string; name: string; slug: string } | null> {
  const domain = extractDomain(website);
  if (!domain || isPublicEmailProvider(domain)) return null;

  const { data: rows } = await supabase
    .from("companies")
    .select("id, name, slug, website, claimed")
    .eq("claimed", true)
    .not("website", "is", null)
    .limit(200);

  for (const row of rows ?? []) {
    const site = extractDomain(String(row.website ?? ""));
    if (!site) continue;
    // Exact host or company site is parent of invite domain (invite is subdomain)
    // Matching rule: exact OR invite-domain is under company site? AGENTS:
    // "exact host or a parent, never a subdomain of the site"
    // = company domain equals invite OR company is parent of invite host
    if (site === domain || domain.endsWith(`.${site}`)) {
      return {
        id: row.id as string,
        name: row.name as string,
        slug: row.slug as string,
      };
    }
  }
  return null;
}

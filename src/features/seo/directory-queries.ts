import "server-only";

import { listedCompanies } from "@/features/companies/listed";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

const DIRECTORY_CAP = 3_000;
/** Columns granted to anon — never staff_hidden_at. */
const DIRECTORY_COLUMNS = "slug, name, city, country";

export type DirectoryCompany = {
  slug: string;
  name: string;
  city: string;
  country: string;
};

function mapRows(data: unknown[] | null): DirectoryCompany[] {
  return (data ?? [])
    .map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        slug: String(row.slug ?? "").trim(),
        name: String(row.name ?? "").trim(),
        city: String(row.city ?? "").trim(),
        country: String(row.country ?? "").trim(),
      };
    })
    .filter((row) => row.slug && row.name);
}

async function listPublicDirectory(): Promise<DirectoryCompany[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("companies")
    .select(DIRECTORY_COLUMNS)
    .order("name", { ascending: true })
    .limit(DIRECTORY_CAP);
  if (error) throw new Error(`[directory] ${error.message}`);
  return mapRows(data);
}

/** One catalog for HTML, sitemap letters, and llms-full. Throws on query error. */
export async function listDirectoryCatalog(): Promise<DirectoryCompany[]> {
  const supabase = createAdminClient();
  if (!supabase) return listPublicDirectory();

  const { data, error } = await listedCompanies(
    supabase
      .from("companies")
      .select(DIRECTORY_COLUMNS)
      .order("name", { ascending: true })
      .limit(DIRECTORY_CAP),
  );
  if (error) throw new Error(`[directory catalog] ${error.message}`);
  return mapRows(data);
}

/** HTML directory — same rows as the sitemap letter hubs. */
export async function listDirectoryCompanies(): Promise<DirectoryCompany[]> {
  return listDirectoryCatalog();
}

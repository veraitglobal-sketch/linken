import "server-only";
import { createClient } from "@/lib/supabase/server";

export type HeaderAuth =
  | { status: "anon" }
  | { status: "user"; email: string; companySlug: string | null };

/** Header-only: email + first owned slug. No plan lookups. */
export async function getHeaderAuth(): Promise<HeaderAuth> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { status: "anon" };

    const { data: company } = await supabase
      .from("companies")
      .select("slug")
      .eq("owner_id", user.id)
      .eq("claimed", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    return {
      status: "user",
      email: user.email ?? "account",
      companySlug: company?.slug ?? null,
    };
  } catch {
    return { status: "anon" };
  }
}

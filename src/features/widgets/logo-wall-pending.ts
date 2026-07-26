export type LogoWallPendingInvite = {
  companyId: string;
  partnershipId: string;
  name: string;
  slug: string;
  inviteEmail: string | null;
  website: string | null;
  logoUrl: string | null;
};

export type LogoWallLabel = "none" | "partners" | "clients" | "both";

export function parseLogoWallLabel(raw: string | undefined): LogoWallLabel {
  if (
    raw === "none" ||
    raw === "partners" ||
    raw === "clients" ||
    raw === "both"
  ) {
    return raw;
  }
  return "both";
}

export function logoWallLabelText(label: LogoWallLabel): string | null {
  switch (label) {
    case "none":
      return null;
    case "partners":
      return "Our verified partners";
    case "clients":
      return "Trusted by";
    case "both":
    default:
      return "Verified partners & clients";
  }
}

export async function getLogoWallPendingInvites(
  companyId: string,
): Promise<LogoWallPendingInvite[]> {
  if (!companyId) return [];
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("partnerships")
      .select(
        `
        id,
        recipient:companies!recipient_id(
          id, slug, name, website, logo_url, claimed
        )
      `,
      )
      .eq("requester_id", companyId)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const out: LogoWallPendingInvite[] = [];
    for (const row of data ?? []) {
      const raw = row.recipient;
      const c = Array.isArray(raw) ? raw[0] : raw;
      if (!c) continue;
      out.push({
        companyId: c.id as string,
        partnershipId: row.id as string,
        name: c.name as string,
        slug: c.slug as string,
        inviteEmail: null,
        website: (c.website as string | null) ?? null,
        logoUrl: (c.logo_url as string | null) ?? null,
      });
    }
    return out;
  } catch {
    return [];
  }
}

import "server-only";

import { createClient } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type RelationshipKind = "partnership" | "client_reference";

export type ConfirmedRelationship = {
  kind: RelationshipKind;
  confirmedAt: string | null;
  other: {
    id: string;
    name: string;
    slug: string;
    verified: boolean;
  };
  /** When true, do not name `other` publicly. */
  undisclosed: boolean;
};

function isUuid(raw: string): boolean {
  return UUID_RE.test(raw.trim());
}

function formatConfirmDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export { formatConfirmDate };

/**
 * Resolve a visitor `?rel=` counterparty only when a confirmed relationship
 * exists with the profile company. Invalid / unconfirmed → null (no banner).
 */
export async function resolveConfirmedRelationship(
  profileCompanyId: string,
  relRaw: string | undefined | null,
): Promise<ConfirmedRelationship | null> {
  const relId = (relRaw ?? "").trim();
  if (!profileCompanyId || !relId || !isUuid(relId) || relId === profileCompanyId) {
    return null;
  }

  const supabase = await createClient();

  const { data: partnership } = await supabase
    .from("partnerships")
    .select(
      `
      responded_at,
      requester_id,
      recipient_id,
      requester:companies!requester_id(id, name, slug, verified),
      recipient:companies!recipient_id(id, name, slug, verified)
    `,
    )
    .eq("status", "accepted")
    .or(
      `and(requester_id.eq.${profileCompanyId},recipient_id.eq.${relId}),and(requester_id.eq.${relId},recipient_id.eq.${profileCompanyId})`,
    )
    .maybeSingle();

  if (partnership) {
    const outgoing = partnership.requester_id === profileCompanyId;
    const otherRaw = outgoing ? partnership.recipient : partnership.requester;
    const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;
    if (other?.id && other.slug && other.name) {
      return {
        kind: "partnership",
        confirmedAt: (partnership.responded_at as string | null) ?? null,
        undisclosed: false,
        other: {
          id: other.id as string,
          name: other.name as string,
          slug: other.slug as string,
          verified: Boolean(other.verified),
        },
      };
    }
  }

  const { data: refs } = await supabase
    .from("service_references")
    .select(
      `
      confirmed_at,
      disclosure,
      provider_company_id,
      client_company_id,
      provider:companies!provider_company_id(id, name, slug, verified),
      client:companies!client_company_id(id, name, slug, verified)
    `,
    )
    .eq("status", "confirmed")
    .or(
      `and(provider_company_id.eq.${profileCompanyId},client_company_id.eq.${relId}),and(provider_company_id.eq.${relId},client_company_id.eq.${profileCompanyId})`,
    )
    .limit(1);

  const ref = refs?.[0];
  if (!ref) return null;

  const providerIsProfile = ref.provider_company_id === profileCompanyId;
  const otherRaw = providerIsProfile ? ref.client : ref.provider;
  const other = Array.isArray(otherRaw) ? otherRaw[0] : otherRaw;
  if (!other?.id || !other.slug || !other.name) return null;

  const undisclosed = (ref.disclosure as string | null) === "undisclosed";

  return {
    kind: "client_reference",
    confirmedAt: (ref.confirmed_at as string | null) ?? null,
    undisclosed,
    other: {
      id: other.id as string,
      name: other.name as string,
      slug: other.slug as string,
      verified: Boolean(other.verified),
    },
  };
}

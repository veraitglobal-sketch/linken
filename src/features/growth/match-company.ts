import {
  emailDomain,
  extractDomain,
  isPublicEmailProvider,
} from "@/features/verification/domain";

export type MatchCandidate = {
  id: string;
  name: string;
  website: string | null;
  claimed: boolean;
};

export type MatchInput = {
  clientCompanyId: string | null;
  clientName: string;
  inviteEmail: string | null;
  candidates: MatchCandidate[];
};

export type MatchResult =
  | { status: "matched"; companyId: string; reason: "id" | "name" | "domain" }
  | { status: "none" }
  | { status: "domain_mismatch"; companyId: string };

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Safe matching for invited companies.
 * Prefer explicit company id; then exact claimed name; then exact website domain.
 * Public email domains never match. Domain mismatch when email domain ≠ site.
 */
export function matchInvitedCompany(input: MatchInput): MatchResult {
  if (input.clientCompanyId) {
    const hit = input.candidates.find((c) => c.id === input.clientCompanyId);
    if (hit) return { status: "matched", companyId: hit.id, reason: "id" };
  }

  const mail = input.inviteEmail ? emailDomain(input.inviteEmail) : null;
  const inviteDomain =
    mail && !isPublicEmailProvider(mail) ? mail : null;

  const nameKey = normalizeName(input.clientName);
  if (nameKey.length >= 2) {
    const byName = input.candidates.filter(
      (c) => c.claimed && normalizeName(c.name) === nameKey,
    );
    if (byName.length === 1) {
      const site = extractDomain(byName[0].website ?? "");
      if (inviteDomain && site && site !== inviteDomain) {
        return { status: "domain_mismatch", companyId: byName[0].id };
      }
      return { status: "matched", companyId: byName[0].id, reason: "name" };
    }
  }

  if (inviteDomain) {
    const byDomain = input.candidates.filter((c) => {
      if (!c.claimed) return false;
      return extractDomain(c.website ?? "") === inviteDomain;
    });
    if (byDomain.length === 1) {
      return { status: "matched", companyId: byDomain[0].id, reason: "domain" };
    }
  }

  return { status: "none" };
}

/** Claim email vs draft website — warn when both exist and disagree. */
export function claimDomainMismatch(
  inviteEmail: string | null | undefined,
  website: string | null | undefined,
): boolean {
  const mail = inviteEmail ? emailDomain(inviteEmail) : null;
  if (!mail || isPublicEmailProvider(mail)) return false;
  const site = extractDomain(website ?? "");
  if (!site) return false;
  return site !== mail;
}

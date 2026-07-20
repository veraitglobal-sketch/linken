import type { WorkspaceContext } from "@/features/workspace/types";

/**
 * Deterministic default when cookie is missing/invalid.
 * Owner companies (oldest) → admin/member companies → groups.
 */
export function pickDefaultWorkspace(
  contexts: WorkspaceContext[],
): WorkspaceContext | null {
  if (contexts.length === 0) return null;

  const owners = contexts.filter(
    (c) => c.type === "company" && c.role === "owner",
  );
  if (owners.length > 0) return owners[0] ?? null;

  const members = contexts.filter(
    (c) => c.type === "company" && (c.role === "admin" || c.role === "member"),
  );
  if (members.length > 0) return members[0] ?? null;

  const operators = contexts.filter(
    (c) => c.type === "company" && c.role === "operator",
  );
  if (operators.length > 0) return operators[0] ?? null;

  const groups = contexts.filter((c) => c.type === "group");
  return groups[0] ?? null;
}

const ROLE_RANK: Record<string, number> = {
  owner: 0,
  admin: 1,
  member: 2,
  operator: 3,
  creator: 4,
};

/** Stable sort for switcher lists and default picking. */
export function sortWorkspaceContexts(
  contexts: WorkspaceContext[],
): WorkspaceContext[] {
  return [...contexts].sort((a, b) => {
    if (a.type !== b.type) return a.type === "company" ? -1 : 1;
    const ra = ROLE_RANK[a.role] ?? 9;
    const rb = ROLE_RANK[b.role] ?? 9;
    if (ra !== rb) return ra - rb;
    const byDate = a.createdAt.localeCompare(b.createdAt);
    if (byDate !== 0) return byDate;
    return a.id.localeCompare(b.id);
  });
}

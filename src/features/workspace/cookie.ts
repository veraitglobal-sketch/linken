import type { WorkspaceContextType } from "@/features/workspace/types";

export const WORKSPACE_COOKIE = "linken-workspace";

/** Cookie value: `company:<uuid>` or `group:<uuid>`. */
export function serializeWorkspaceCookie(
  type: WorkspaceContextType,
  id: string,
): string {
  return `${type}:${id}`;
}

export function parseWorkspaceCookie(
  raw: string | undefined,
): { type: WorkspaceContextType; id: string } | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  const sep = trimmed.indexOf(":");
  if (sep <= 0) return null;
  const type = trimmed.slice(0, sep);
  const id = trimmed.slice(sep + 1).trim();
  if ((type !== "company" && type !== "group") || !id) return null;
  return { type, id };
}

/** Workspace nav sections for member permissions. */
export const WORKSPACE_SECTIONS = [
  "network",
  "structure",
  "partners",
  "team",
  "verification",
  "widgets",
  "api",
  "insights",
  "inbox",
  "radar",
  "settings",
] as const;

export type WorkspaceSection = (typeof WORKSPACE_SECTIONS)[number];

export const WORKSPACE_SECTION_LABELS: Record<WorkspaceSection, string> = {
  network: "Map",
  structure: "Branches",
  partners: "Partners",
  team: "Team access",
  verification: "Verification",
  widgets: "Widgets",
  api: "API",
  insights: "Insights",
  inbox: "Inbox",
  radar: "Radar",
  settings: "Company",
};

export const SECTION_BY_HREF: Record<string, WorkspaceSection> = {
  "/dashboard": "network",
  "/dashboard/structure": "structure",
  "/dashboard/partners": "partners",
  "/dashboard/team": "team",
  "/dashboard/verification": "verification",
  "/dashboard/widgets": "widgets",
  "/dashboard/api": "api",
  "/dashboard/insights": "insights",
  "/dashboard/inbox": "inbox",
  "/dashboard/radar": "radar",
  "/dashboard/settings": "settings",
};

export function parseSectionPermissions(raw: unknown): WorkspaceSection[] {
  if (!Array.isArray(raw)) return [];
  const allowed = new Set<string>(WORKSPACE_SECTIONS);
  const out: WorkspaceSection[] = [];
  for (const item of raw) {
    const s = String(item).trim().toLowerCase();
    if (allowed.has(s) && !out.includes(s as WorkspaceSection)) {
      out.push(s as WorkspaceSection);
    }
  }
  return out;
}

export function permissionsFromFormData(formData: FormData): WorkspaceSection[] {
  const values = formData.getAll("permissions").map((v) => String(v));
  return parseSectionPermissions(values);
}

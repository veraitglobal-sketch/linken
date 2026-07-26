import "server-only";

import { getDashboardSession } from "@/features/dashboard/session";
import { assertSectionAccess } from "@/features/workspace/section-access";
import type { WorkspaceSection } from "@/features/workspace/sections";

/** True when the active workspace is a company (not a group). */
export async function assertCompanyWorkspace() {
  const session = await getDashboardSession();
  const isGroup = session.active?.type === "group";
  return {
    ...session,
    needsCompanySwitch: Boolean(session.user && isGroup),
  };
}

const SECTION_LOGIN: Record<WorkspaceSection, string> = {
  network: "/dashboard",
  structure: "/dashboard/structure",
  partners: "/dashboard/partners",
  team: "/dashboard/team",
  verification: "/dashboard/verification",
  widgets: "/dashboard/widgets",
  api: "/dashboard/api",
  insights: "/dashboard/insights",
  inbox: "/dashboard/inbox",
  radar: "/dashboard/radar",
  settings: "/dashboard/settings",
};

/** Company workspace + member section permission (server-side). */
export async function assertCompanySection(
  section: WorkspaceSection,
  opts?: { loginNext?: string },
) {
  const gated = await assertCompanyWorkspace();
  if (gated.needsCompanySwitch || !gated.company) return gated;
  await assertSectionAccess(section, {
    loginNext: opts?.loginNext ?? SECTION_LOGIN[section],
  });
  return gated;
}

import type { ComponentType } from "react";
import type { WorkspaceSection } from "@/features/workspace/sections";

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  match?: "exact" | "prefix";
  companyOnly?: boolean;
  section?: WorkspaceSection;
  locked?: boolean;
  lockedHint?: string;
};

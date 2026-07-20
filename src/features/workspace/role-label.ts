import type { WorkspaceContext } from "@/features/workspace/types";

/** True when access is only via unclaimed-branch operator chain. */
export function isDraftWorkspace(ctx: WorkspaceContext) {
  return ctx.type === "company" && ctx.claimed === false;
}

export function workspaceRoleLabel(ctx: WorkspaceContext) {
  if (ctx.type === "group") return "Group";
  if (isDraftWorkspace(ctx) || ctx.role === "operator") {
    return "Managing · Unclaimed";
  }
  if (ctx.role === "owner") return "Owner";
  if (ctx.role === "admin") return "Admin";
  if (ctx.role === "member") return "Member";
  if (ctx.role === "creator") return "Creator";
  return "Member";
}

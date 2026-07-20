import "server-only";

import { cookies } from "next/headers";
import {
  serializeWorkspaceCookie,
  WORKSPACE_COOKIE,
} from "@/features/workspace/cookie";
import type { WorkspaceContextType } from "@/features/workspace/types";

/** Preference cookie only — never authorizes access. */
export async function setWorkspacePreference(
  type: WorkspaceContextType,
  id: string,
) {
  const jar = await cookies();
  jar.set(WORKSPACE_COOKIE, serializeWorkspaceCookie(type, id), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

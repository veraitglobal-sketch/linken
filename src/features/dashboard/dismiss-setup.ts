"use server";

import { cookies } from "next/headers";
import { logActivationEvent } from "@/features/activation/events";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

const COOKIE = "hansala_setup_dismissed";

export async function isSetupDismissed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "1";
}

/** Dismiss setup for the signed-in operator — never trust client companyId. */
export async function dismissSetupGuidance(_ignoredClientCompanyId?: string) {
  const jar = await cookies();
  jar.set(COOKIE, "1", {
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
    sameSite: "lax",
    httpOnly: true,
  });
  const { user, company } = await getOperatorActiveCompany();
  if (user && company) {
    void logActivationEvent(company.id, "dashboard_cta_clicked", "dismiss_setup");
  }
}

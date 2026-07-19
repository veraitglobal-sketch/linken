import "server-only";

import { after } from "next/server";
import { fetchAndStoreCompanyLogo } from "@/features/logo/fetch-logo";

/** Fire-and-forget logo fetch after the response — never blocks the main flow. */
export function scheduleCompanyLogoFetch(companyId: string) {
  after(() => {
    void fetchAndStoreCompanyLogo(companyId).catch((err) => {
      console.error("[logo-fetch]", companyId, err);
    });
  });
}

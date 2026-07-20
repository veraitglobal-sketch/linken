import "server-only";

import { after } from "next/server";
import { classifyLogoFetchFailure } from "@/features/logo/classify-failure";
import { fetchAndStoreCompanyLogo } from "@/features/logo/fetch-logo";
import { fetchAndStoreGroupLogo } from "@/features/logo/fetch-group-logo";

function logFetchFailure(kind: "company" | "group", id: string, error: string) {
  const reason = classifyLogoFetchFailure(error);
  console.error(`[logo-fetch] ${kind}`, id, reason, error);
}

/** Fire-and-forget company logo fetch after the response. */
export function scheduleCompanyLogoFetch(companyId: string) {
  after(() => {
    void fetchAndStoreCompanyLogo(companyId)
      .then((result) => {
        if (!result.ok && !result.skipped) {
          logFetchFailure("company", companyId, result.error);
        }
      })
      .catch((err) => {
        logFetchFailure(
          "company",
          companyId,
          err instanceof Error ? err.message : String(err),
        );
      });
  });
}

/** Fire-and-forget group logo fetch after the response. */
export function scheduleGroupLogoFetch(groupId: string) {
  after(() => {
    void fetchAndStoreGroupLogo(groupId)
      .then((result) => {
        if (!result.ok && !result.skipped) {
          logFetchFailure("group", groupId, result.error);
        }
      })
      .catch((err) => {
        logFetchFailure(
          "group",
          groupId,
          err instanceof Error ? err.message : String(err),
        );
      });
  });
}

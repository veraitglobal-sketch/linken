import "server-only";

import { after } from "next/server";
import { submitIndexNow } from "@/features/seo/indexnow-submit";
import {
  companyIndexNowUrls,
  partnershipIndexNowUrls,
} from "@/features/seo/indexnow-urls";

function ping(urls: string[], label: string) {
  if (urls.length === 0) return;
  after(() => {
    void submitIndexNow(urls)
      .then((result) => {
        if (!result.ok && !result.skipped) {
          console.error("[indexnow]", label, result.error);
        }
      })
      .catch((err) => {
        console.error(
          "[indexnow]",
          label,
          err instanceof Error ? err.message : String(err),
        );
      });
  });
}

/** Fire-and-forget IndexNow ping after the response. */
export function scheduleCompanyIndexNow(slug: string) {
  ping(companyIndexNowUrls(slug), slug);
}

export function schedulePartnershipIndexNow(left: string, right: string) {
  ping(partnershipIndexNowUrls(left, right), `${left}+${right}`);
}

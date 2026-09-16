import "server-only";

import { after } from "next/server";
import { submitIndexNow } from "@/features/seo/indexnow-submit";
import { companyIndexNowUrls } from "@/features/seo/indexnow-urls";

/** Fire-and-forget IndexNow ping after the response. */
export function scheduleCompanyIndexNow(slug: string) {
  const urls = companyIndexNowUrls(slug);
  if (urls.length === 0) return;

  after(() => {
    void submitIndexNow(urls)
      .then((result) => {
        if (!result.ok && !result.skipped) {
          console.error("[indexnow]", slug, result.error);
        }
      })
      .catch((err) => {
        console.error(
          "[indexnow]",
          slug,
          err instanceof Error ? err.message : String(err),
        );
      });
  });
}

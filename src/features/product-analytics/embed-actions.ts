"use server";

import { trackEngagement } from "@/features/product-analytics/helpers";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

/** Fired when an operator copies an embed snippet — not on every preview. */
export async function trackEmbedCreated(variant?: string) {
  const { company } = await getOperatorActiveCompany();
  if (!company) return;
  await trackEngagement("embed_created", company.id, {
    variant: (variant ?? "unknown").slice(0, 64),
    surface: "web",
  });
}

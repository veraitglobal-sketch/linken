"use server";

import { revalidatePath } from "next/cache";
import {
  parseLogoMotion,
  parseLogoSize,
  type LogoMotion,
  type LogoSize,
} from "@/features/widgets/logo-motion";
import { mergePlacementsPatch } from "@/features/widgets/placements-merge";
import { getOperatorActiveCompany } from "@/features/workspace/require-operator";

async function savePlacements(
  patch: Parameters<typeof mergePlacementsPatch>[1],
) {
  const { supabase, user, company } = await getOperatorActiveCompany();
  if (!user || !company) return { ok: false as const, error: "Not signed in." };

  const next = mergePlacementsPatch(company.widget_settings, patch);
  const { error } = await supabase
    .from("companies")
    .update({ widget_settings: next })
    .eq("id", company.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/widgets");
  revalidatePath(`/embed/${company.slug}`);
  return { ok: true as const };
}

export async function saveFooterPlacement(input: { limit: number }) {
  return savePlacements({ footer: { limit: input.limit } });
}

export async function savePartnersPlacement(input: {
  motion?: LogoMotion;
  size?: LogoSize;
  limit?: number;
}) {
  return savePlacements({
    partners: {
      motion:
        typeof input.motion === "string"
          ? parseLogoMotion(input.motion)
          : undefined,
      size:
        typeof input.size === "string" ? parseLogoSize(input.size) : undefined,
      limit: input.limit,
    },
  });
}

export async function saveCasesPlacement(input: { limit: number }) {
  return savePlacements({ cases: { limit: input.limit } });
}

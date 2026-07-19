import { cache } from "react";
import { viewerOwnsClaimedCompany } from "@/features/partners/queries";

/** One fetch per request for all dashboard routes. */
export const getDashboardSession = cache(viewerOwnsClaimedCompany);

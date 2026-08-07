import { PRODUCT } from "@/lib/product-model";

export const WORKSPACE_PAGE_META: Record<
  string,
  { title: string; description?: string; actionHref?: string; actionLabel?: string }
> = {
  "/dashboard": {
    title: PRODUCT.home.label,
    description: PRODUCT.home.job,
  },
  "/dashboard/map": {
    title: PRODUCT.map.label,
    description: PRODUCT.map.job,
  },
  "/dashboard/structure": {
    title: PRODUCT.structure.label,
    description: PRODUCT.structure.job,
  },
  "/dashboard/verification": {
    title: "Verification",
    description: "Prove your domain for the Verified badge.",
  },
  "/dashboard/insights": {
    title: "Insights",
    description: "Visits and inquiries on your Company page.",
  },
  "/dashboard/inbox": {
    title: PRODUCT.inbox.label,
    description: PRODUCT.inbox.job,
  },
  "/dashboard/radar": {
    title: "Radar",
    description: "Project requests in your market.",
  },
  "/dashboard/cases": {
    title: "Case studies",
    description: "Create a project and email the client for confirmation.",
  },
  "/dashboard/partners": {
    title: PRODUCT.partners.label,
    description: PRODUCT.partners.job,
  },
  "/dashboard/settings": {
    title: "Edit company",
    description: PRODUCT.company.job,
  },
  "/dashboard/group": {
    title: "Group",
    description: PRODUCT.structure.job,
  },
  "/dashboard/team": {
    title: "Team access",
    description: "Who can work in this workspace. Public team is on Company.",
  },
  "/dashboard/widgets": {
    title: "Widgets",
    description: "Embed Hansala on your website.",
  },
  "/dashboard/api": {
    title: "API",
    description: "Agent keys for your company.",
  },
  "/dashboard/integrations": {
    title: "Integrations",
    description: "Connect Calendly or Cal.com for booking.",
  },
};

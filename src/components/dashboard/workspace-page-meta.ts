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
    description: "Domain proof for the badge.",
  },
  "/dashboard/insights": {
    title: "Insights",
    description: "Visits and inquiries.",
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
    description: "Write the project. The client confirms.",
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
    description: "Who can work here. Public team is on Company.",
  },
  "/dashboard/widgets": {
    title: "Widgets",
    description: "Embed on your site.",
  },
  "/dashboard/api": {
    title: "API",
    description: "Keys act as your company.",
  },
  "/dashboard/integrations": {
    title: "Integrations",
    description: "Calendly, Cal.com, Slack.",
  },
  "/dashboard/developer": {
    title: "Earnings",
    description: "10% of paid invoices you referred.",
  },
  "/dashboard/billing": {
    title: "Billing",
    description: "Your Hansala plan.",
  },
};

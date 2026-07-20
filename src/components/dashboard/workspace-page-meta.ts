export const WORKSPACE_PAGE_META: Record<
  string,
  { title: string; description?: string; actionHref?: string; actionLabel?: string }
> = {
  "/dashboard": {
    title: "Network",
    description: "Map firms, subsidiaries, and partners.",
  },
  "/dashboard/structure": {
    title: "Structure",
    description: "Ownership tree for your company group.",
  },
  "/dashboard/verification": {
    title: "Verification",
    description: "Evidence that backs public trust.",
  },
  "/dashboard/insights": {
    title: "Insights",
    description: "Visits and inquiries on your public profile.",
  },
  "/dashboard/inbox": {
    title: "Inbox",
    description: "Profile inquiries and Radar intros — separate tabs.",
  },
  "/dashboard/radar": {
    title: "Radar",
    description: "Project requests and signals for your market.",
  },
  "/dashboard/partners": {
    title: "Partners",
    description: "Invite firms and grow confirmed relationships.",
  },
  "/dashboard/settings": {
    title: "Company settings",
    description: "Edit the details on your public profile.",
  },
  "/dashboard/group": {
    title: "Company group",
    description: "Members, invites, and hierarchy.",
  },
  "/dashboard/team": {
    title: "Team",
    description: "People who can operate this workspace.",
  },
  "/dashboard/widgets": {
    title: "Widgets",
    description: "Embed Linken on your website.",
  },
  "/dashboard/api": {
    title: "API",
    description: "Agent keys and activity for your company.",
  },
};

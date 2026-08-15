/** Only integrations Hansala actually ships today. */

export type IntegrationId =
  | "calendly"
  | "calcom"
  | "slack"
  | "claude"
  | "cursor";

export type IntegrationTile = {
  id: IntegrationId;
  name: string;
  href: string;
  /** What it actually does — four logos alone say nothing. */
  kind: string;
  /** Brand colour: a visitor scanning the row recognises the mark by it. */
  color: string;
};

export const HOME_INTEGRATIONS: IntegrationTile[] = [
  {
    id: "calendly",
    name: "Calendly",
    href: "https://calendly.com",
    kind: "Bookings",
    color: "#006BFF",
  },
  {
    id: "calcom",
    name: "Cal.com",
    href: "https://cal.com",
    kind: "Bookings",
    color: "#111111",
  },
  {
    id: "slack",
    name: "Slack",
    href: "/dashboard/integrations",
    kind: "Alerts",
    color: "#4A154B",
  },
  {
    id: "claude",
    name: "Claude",
    href: "/developers",
    kind: "MCP",
    color: "#D97757",
  },
  {
    id: "cursor",
    name: "Cursor",
    href: "/developers",
    kind: "MCP",
    color: "#0D1210",
  },
];

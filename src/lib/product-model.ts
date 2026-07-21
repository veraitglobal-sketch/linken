/**
 * The whole product in three words.
 * Everything else is secondary (More).
 */
export const PRODUCT = {
  oneLiner: "Company is you. Map is who you’re linked to. Inbox is requests.",
  company: {
    label: "Company",
    job: "Your page — add partners, team, and proof here.",
  },
  map: {
    label: "Map",
    job: "Who you’re connected to. Confirmed links only.",
  },
  inbox: {
    label: "Inbox",
    job: "Requests and messages.",
  },
  /** @deprecated alias — use company */
  profile: {
    label: "Company",
    job: "Your page — add partners, team, and proof here.",
  },
  /** @deprecated alias — use map */
  network: {
    label: "Map",
    job: "Who you’re connected to. Confirmed links only.",
  },
  partners: {
    label: "Partners",
    job: "Add on your Company page. They show on the Map after both confirm.",
  },
  structure: {
    label: "Branches",
    job: "Optional — country firms under one group. Advanced.",
  },
  operate: {
    label: "More",
    job: "Verification, team access, and tools.",
  },
} as const;

export const HOW_IT_WORKS = [
  {
    n: "1",
    title: "Company",
    body: "Fill your page. Add partners and proof here.",
  },
  {
    n: "2",
    title: "Confirm",
    body: "Links count only when the other side accepts.",
  },
  {
    n: "3",
    title: "Map",
    body: "See your connections. That’s it.",
  },
] as const;

/** Operator firms only — mirrors real workspace, never invented cast. */

export const FLOW_HUB = {
  name: "Vera IT",
  domain: "verait.de",
  initials: "VI",
  logo: "/logos/showcase/vera.png",
} as const;

export const FLOW_TARGET = {
  name: "Dienstemarkt",
  domain: "dienstemarkt.de",
  initials: "DM",
  logo: "/logos/showcase/dienstemarkt-mark.png" as string | null,
} as const;

export const FLOW_DOMAIN = FLOW_TARGET.domain;

/** Design canvas size — UI is drawn full-size then scaled. */
export const FLOW_DESIGN_W = 1180;
export const FLOW_DESIGN_H = 740;

/** 0 idle → 8 back on the map */
export const FLOW_DURATIONS = [
  1200, 1500, 1300, 1800, 1300, 1600, 1700, 1200, 2600,
];
export const FLOW_LAST_STEP = FLOW_DURATIONS.length - 1;
export const FLOW_DONE_STEP = 8;

export const FLOW_STEPS = [
  {
    label: "You add them",
    body: "Search a domain. They land on your map as pending — only you see it.",
    from: 0,
    to: 5,
  },
  {
    label: "They confirm",
    body: "One email, one button. There is no other way to create the record.",
    from: 6,
    to: 7,
  },
  {
    label: "It becomes public",
    body: "Profile, map, and embeds update — nowhere in between.",
    from: 8,
    to: 8,
  },
] as const;

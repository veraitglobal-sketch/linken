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

/**
 * Design canvas size — UI is drawn full-size then scaled.
 *
 * Height was 740 while the two nodes the screen exists to show occupied a band
 * of 154: nearly 5:1 empty canvas to content, most of it dead space below the
 * cards. 560 crops that without touching the map itself. The sidebar had to
 * lose its lower rows first — twelve of them were what held the window tall.
 */
export const FLOW_DESIGN_W = 1180;
export const FLOW_DESIGN_H = 560;

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

/** Product principles — from AGENTS.md; not marketing slogans. */

export const MISSION =
  "Hansala is a record of who works with whom, confirmed by both sides. A company cannot state who it worked for — only the other side can confirm it.";

export const PRINCIPLES = [
  {
    title: "Public shows confirmed only",
    body: "Visitors never see pending or self-reported claims about another company. Two companies must confirm before a record is public.",
  },
  {
    title: "Author text is immutable",
    body: "A testimonial body, author name, and role cannot be edited by the receiving company or through the API — only by the author.",
  },
  {
    title: "Show provenance, do not gate",
    body: "Weakly sourced records are displayed with the evidence stated as fact. We record; we do not adjudicate quality.",
  },
  {
    title: "Verified is domain proof",
    body: "Verified means the company controls its business domain or approved identity. It does not mean Hansala guarantees the quality of its services.",
  },
  {
    title: "Never invent customers or quotes",
    body: "Where content does not exist, the element is removed. Placeholders must never reach a visitor as if they were real.",
  },
] as const;

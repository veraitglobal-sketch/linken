export const ASSURANCE_FACTS = [
  {
    title: "Two confirmations, or private",
    body: "Nothing about another company goes public until that company confirms it. Pending stays visible only to you.",
  },
  {
    title: "Verification is domain proof",
    body: "Verified means the company controls its business domain or approved identity — not that Hansala guarantees service quality.",
  },
  {
    title: "Author text is locked",
    body: "What a client writes cannot be edited by the company that receives it — not from the dashboard, not through the API.",
  },
  {
    title: "Disputes come off the record",
    body: "A disputed record leaves public view while both sides resolve it privately. Nothing negative is ever published.",
  },
] as const;

export const TRUST_LINKS = [
  { href: "/about", label: "About" },
  { href: "/company", label: "Company" },
  { href: "/security", label: "Security" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
  { href: "/data-deletion", label: "Data deletion" },
  { href: "/subprocessors", label: "Subprocessors" },
  { href: "/disclosure", label: "Disclosure" },
] as const;

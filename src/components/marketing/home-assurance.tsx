import Link from "next/link";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

const FACTS = [
  {
    title: "Two confirmations, or private",
    body: "Nothing about another company goes public until that company confirms it. Pending records are visible only to you.",
  },
  {
    title: "Verification is domain proof",
    body: "Verified means the company controls its business domain or approved identity. It does not mean Hansala guarantees the quality of its services.",
  },
  {
    title: "Author text is locked",
    body: "What a client writes cannot be edited by the company that receives it — not from the dashboard, not through the API.",
  },
  {
    title: "Disputes come off the record",
    body: "A disputed record is removed from public view while both sides resolve it privately. Nothing negative is ever published.",
  },
];

const TRUST_LINKS = [
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

/** Security & privacy summary + trust directory. */
export function HomeAssurance() {
  return (
    <HomeSection tone="tight">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-line bg-[#eef0ee] px-7 py-10 sm:px-10 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <HomeEyebrow>Trust</HomeEyebrow>
            <h2 className="mt-5 max-w-[16ch] font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.035em] text-ink text-balance">
              The record protects both sides.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-ink-soft">
              Policies and company identity are public — the same standard we
              ask of every profile on Hansala.
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {FACTS.map((fact) => (
              <div key={fact.title}>
                <dt className="font-display text-[15px] font-medium tracking-[-0.015em] text-ink">
                  {fact.title}
                </dt>
                <dd className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                  {fact.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <nav
          aria-label="Trust pages"
          className="mt-10 border-t border-line/80 pt-6"
        >
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {TRUST_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[13px] font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </HomeSection>
  );
}

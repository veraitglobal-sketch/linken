import Link from "next/link";
import {
  ASSURANCE_FACTS,
  TRUST_LINKS,
} from "@/components/marketing/home-assurance-data";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/** Homepage §8a — product rules as trust facts + policy directory. */
export function HomeAssurance() {
  return (
    <HomeSection tone="tight" className="!pb-12 sm:!pb-16">
      <div className="mx-auto max-w-6xl rounded-chapter border border-line bg-mute px-7 py-10 sm:px-10 sm:py-12 lg:rounded-hero">
        <div className="reveal-late grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <HomeEyebrow>Trust</HomeEyebrow>
            <h2 className="reveal mt-5 max-w-[16ch] font-display text-section text-ink text-balance">
              The record protects both sides.
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              Policies and company identity are public — the same standard we
              ask of every profile on Hansala.
            </p>
          </div>
          <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {ASSURANCE_FACTS.map((fact) => (
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

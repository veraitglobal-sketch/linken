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
    <HomeSection>
      <div className="stage-falloff relative mx-auto max-w-6xl overflow-hidden rounded-chapter bg-mute px-7 py-12 sm:px-10 sm:py-14 lg:rounded-hero">
        {/* Same device as the dark stages, dialled right down: the orb reads
            as light falling on the plane rather than a painted tint, and the
            border comes off — the references carry none. */}
        <span
          aria-hidden
          className="orb -top-28 right-[-6rem] h-[340px] w-[420px] bg-signal/10"
        />
        <div className="relative z-10">
        <div className="reveal-late grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <HomeEyebrow>Trust</HomeEyebrow>
            <h2 className="reveal mt-5 max-w-[16ch] font-display text-chapter text-ink text-balance">
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
          className="mt-10 pt-6"
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
      </div>
    </HomeSection>
  );
}

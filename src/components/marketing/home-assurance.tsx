import Link from "next/link";
import { NetworkMark } from "@/components/marketing/network-mark";
import {
  ASSURANCE_FACTS,
  TRUST_LINKS,
} from "@/components/marketing/home-assurance-data";
import {
  Accent,
  HomeHeading,
  HomeSection,
} from "@/components/marketing/home-section";

/**
 * Trust — a deep-green chapter, centred.
 *
 * Thrivea closes its argument with a dark "trust" block and a grid of
 * assurances. Ours is `--blue`, not navy: the page already has navy at the
 * mark chapter and the close, and a third navy slab would flatten the rhythm.
 * Text uses the soft on-navy value — the muted one does not clear AA on green.
 */
export function HomeAssurance() {
  return (
    <HomeSection className="!py-6 sm:!py-10">
      <div className="relative mx-auto max-w-6xl overflow-hidden grad-teal rounded-hero px-6 py-14 text-on-navy shadow-chapter sm:px-12 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(126,184,164,0.28),transparent_70%)]"
          aria-hidden
        />
        <div className="relative">
          <div className="mx-auto mb-6 grid size-12 place-items-center rounded-2xl bg-navy text-blue-soft ring-1 ring-white/15">
            <NetworkMark size={20} animate={false} />
          </div>
          <HomeHeading
            onDark
            title={
              <>
                The record protects <Accent onDark>both sides.</Accent>
              </>
            }
            lead="Policies and company identity are public — the same standard we ask of every profile on Hansala."
          />

          <dl className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ASSURANCE_FACTS.map((fact) => (
              <div
                key={fact.title}
                className="lift rounded-card bg-white/[0.08] p-6 ring-1 ring-white/20 backdrop-blur-sm"
              >
                <dt className="font-display text-[16px] leading-snug font-medium tracking-[-0.02em] text-on-navy">
                  {fact.title}
                </dt>
                <dd className="mt-2.5 text-[13.5px] leading-relaxed text-on-navy/90">
                  {fact.body}
                </dd>
              </div>
            ))}
          </dl>

          <nav aria-label="Trust pages" className="mt-10">
            <ul className="m-0 flex list-none flex-wrap justify-center gap-2 p-0">
              {TRUST_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex h-11 items-center rounded-full px-4 text-[13px] font-medium text-on-navy ring-1 ring-white/25 transition-[background-color] duration-200 hover:bg-white/10"
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

import Image from "next/image";
import Link from "next/link";
import { SectionPlate } from "@/components/marketing/section-plate";
import {
  ASSURANCE_FACTS,
  TRUST_LINKS,
} from "@/components/marketing/home-assurance-data";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

/**
 * Trust — light outer plate; hero photo + glass inside.
 * Text hierarchy matches dark stages (hero / close): title → soft → muted.
 * Panel sets `color` so links inherit on-navy when utilities are soft.
 */
export function HomeAssurance() {
  return (
    <HomeSection>
      <SectionPlate tone="light" className="mx-auto max-w-6xl !p-3 sm:!p-4 lg:!p-5">
        <div className="relative min-h-[420px] overflow-hidden rounded-[20px] sm:min-h-[480px] sm:rounded-chapter">
          <Image
            src="/images/hero-plate.webp"
            alt=""
            fill
            quality={75}
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 1100px"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-navy/40"
            aria-hidden
          />

          <div className="relative m-3 sm:m-4 lg:m-5">
            <div
              className="rounded-[18px] border border-white/28 bg-white/[0.08] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-xl sm:rounded-[22px] sm:p-9 lg:p-11"
              style={{ color: "var(--on-navy)" }}
            >
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                <div>
                  <HomeEyebrow onDark>Trust</HomeEyebrow>
                  <h2 className="mt-5 max-w-[16ch] font-display text-chapter text-balance">
                    The record protects both sides.
                  </h2>
                  <p
                    className="mt-4 max-w-sm text-[14px] leading-relaxed"
                    style={{ color: "var(--on-navy-soft)" }}
                  >
                    Policies and company identity are public — the same
                    standard we ask of every profile on Hansala.
                  </p>
                </div>
                <dl className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  {ASSURANCE_FACTS.map((fact) => (
                    <div key={fact.title}>
                      <dt className="font-display text-[15px] font-medium tracking-[-0.015em]">
                        {fact.title}
                      </dt>
                      <dd
                        className="mt-2 text-[13.5px] leading-relaxed"
                        style={{ color: "var(--on-navy-muted)" }}
                      >
                        {fact.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <nav
                aria-label="Trust pages"
                className="mt-10 border-t border-white/15 pt-6"
                style={{ color: "var(--on-navy-soft)" }}
              >
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {TRUST_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[13px] font-medium underline decoration-white/30 underline-offset-4 transition-[color,text-decoration-color] duration-200 hover:decoration-white/55"
                        style={{ color: "var(--on-navy-soft)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </SectionPlate>
    </HomeSection>
  );
}

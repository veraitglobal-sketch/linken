import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

/** Full-bleed first viewport: brand, one line, one sentence, CTAs, image plane. */
export function HomeHero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-4.75rem)] overflow-hidden bg-navy">
      <Image
        src="/images/hero-partner.jpg"
        alt="Architecture firm partner reviewing plans outside a project site"
        fill
        priority
        fetchPriority="high"
        quality={74}
        className="hero-media object-cover object-[72%_42%]"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(8,20,18,0.94) 0%, rgba(14,31,28,0.78) 38%, rgba(14,31,28,0.35) 62%, rgba(14,31,28,0.18) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 18% 78%, rgba(126,184,164,0.16), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-4.75rem)] w-full max-w-6xl flex-col justify-between px-6 py-10 sm:px-8 sm:py-12 lg:px-10">
        <div className="animate-rise flex items-center gap-2.5 text-white/50">
          <NetworkMark size={17} animate={false} />
          <p className="text-[13px] font-medium tracking-[-0.01em]">
            Mutually confirmed project networks
          </p>
        </div>

        <div className="max-w-2xl py-10 sm:py-14">
          <p className="animate-rise font-display text-[clamp(3.6rem,9vw,6.6rem)] leading-[0.88] font-medium tracking-[-0.055em] text-white">
            Hansala
          </p>
          <h1 className="animate-rise-delay mt-6 max-w-xl font-display text-[clamp(1.65rem,3.4vw,2.55rem)] leading-[1.16] font-medium tracking-[-0.032em] text-white/[0.92]">
            The company page that shows who you build with — only after they
            confirm.
          </h1>
          <p className="animate-rise-delay mt-5 max-w-md text-[15px] leading-relaxed text-white/58">
            Profiles, case studies, and partners. Public only with two yeses.
          </p>
        </div>

        <div className="animate-rise-late flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            href="/onboarding"
            variant="light"
            className="h-12 min-w-[168px] px-6"
          >
            Create company
          </Button>
          <Button
            href="/search"
            variant="onDark"
            className="h-12 min-w-[168px] px-6"
          >
            Browse directory
          </Button>
        </div>
      </div>
    </section>
  );
}

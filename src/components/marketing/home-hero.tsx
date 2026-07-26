import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

export function HomeHero() {
  return (
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4 pt-2 pb-2 sm:pt-3">
      <div className="hero-live relative mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[28px] shadow-[0_32px_100px_rgba(8,20,18,0.32)] ring-1 ring-black/10 lg:min-h-[min(84vh,760px)] lg:grid-cols-[1.12fr_0.88fr] lg:rounded-[32px]">
        <div className="pointer-events-none absolute inset-0 z-[1] stage-grain opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -left-24 top-[-20%] z-[1] h-[70%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(126,184,164,0.16),transparent_68%)]"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col justify-between px-7 py-9 sm:px-11 sm:py-12 lg:py-14">
          <div className="animate-rise flex items-center gap-3 text-white/55">
            <NetworkMark size={18} className="text-blue-soft" animate={false} />
            <span className="h-3 w-px bg-white/20" aria-hidden />
            <p className="text-[12px] font-medium tracking-[0.02em] sm:text-[13px]">
              Mutually confirmed project networks
            </p>
          </div>

          <div className="max-w-2xl py-14 sm:py-16">
            <p className="animate-rise font-display text-[clamp(3.6rem,9vw,6.5rem)] leading-[0.88] font-medium tracking-[-0.055em] text-white">
              Hansala
            </p>
            <h1 className="animate-rise-delay mt-7 max-w-xl font-display text-[clamp(1.65rem,3.2vw,2.55rem)] leading-[1.16] font-medium tracking-[-0.032em] text-white/[0.9]">
              The company page that shows who you build with — only after they
              confirm.
            </h1>
            <p className="animate-rise-delay mt-5 max-w-md text-[15px] leading-relaxed text-white/55 sm:text-[16px]">
              Profiles, case studies, and partners. Public only with two yeses.
            </p>
          </div>

          <div className="animate-rise-late flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/onboarding"
              variant="light"
              className="h-12 min-w-[176px] px-6 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
            >
              Create company
            </Button>
            <Button
              href="/demo"
              variant="onDark"
              className="h-12 min-w-[176px] px-6"
            >
              See an example
            </Button>
          </div>
        </div>

        <div className="relative min-h-[300px] overflow-hidden lg:min-h-0">
          <Image
            src="/images/hero-partner-v3.jpg"
            alt="Architecture firm partner reviewing plans outside a project site"
            fill
            priority
            fetchPriority="high"
            unoptimized
            className="hero-media object-cover object-[center_28%]"
            sizes="(max-width: 1024px) 100vw, 900px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,var(--navy)_0%,rgba(14,31,28,0.55)_22%,transparent_48%)] max-lg:bg-[linear-gradient(180deg,transparent_55%,rgba(14,31,28,0.55)_100%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,transparent_40%,rgba(8,20,18,0.28)_100%)]"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4 pt-1">
      <div className="mesh-stage relative mx-auto grid w-full max-w-6xl min-h-[82vh] overflow-hidden rounded-[32px] shadow-[0_28px_90px_rgba(8,20,18,0.28)] lg:grid-cols-[1.12fr_0.88fr]">
        <div className="stage-grain absolute inset-0 z-[1]" />

        <div className="relative z-10 flex flex-col justify-between px-7 py-9 sm:px-11 sm:py-12">
          <div className="animate-rise flex items-center gap-3">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-soft shadow-[0_0_0_3px_rgba(126,184,164,0.16)]" />
            <p className="text-[11px] font-semibold tracking-[0.18em] text-white/58 uppercase">
              Mutually confirmed project networks
            </p>
          </div>

          <div className="animate-rise-delay max-w-xl py-12">
            <p className="font-display text-[clamp(3.2rem,7.5vw,5.2rem)] leading-[0.9] font-medium tracking-[-0.055em] text-white">
              Linken
            </p>
            <h1 className="mt-6 font-display text-[clamp(1.7rem,3.5vw,2.7rem)] leading-[1.14] font-medium tracking-[-0.032em] text-white/[0.92]">
              The company page that shows who you build with — only after they
              confirm.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/58">
              Profiles, case studies, and partners. Public only with two yeses.
            </p>
          </div>

          <div className="animate-rise-late flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/onboarding" variant="light" className="h-12 min-w-[180px] px-6">
              Create company link
            </Button>
            <Button
              href="/search"
              variant="onDark"
              className="h-12 min-w-[180px] px-6"
            >
              Browse directory
            </Button>
          </div>
        </div>

        <div className="group relative min-h-[260px] overflow-hidden lg:min-h-full">
          <Image
            src="/images/hero-network.jpg"
            alt="Teams delivering a real project"
            fill
            priority
            quality={90}
            className="media-zoom object-cover object-[42%_42%]"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/58 via-black/8 to-black/18 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-[rgba(7,15,13,0.62)]" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/14 bg-[#081412]/48 px-4 py-3 shadow-[0_10px_32px_rgba(0,0,0,0.28)] backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-blue-soft uppercase">
              On this network
            </p>
            <p className="mt-1 text-sm font-medium tracking-[-0.01em] text-white/95">
              Architecture · Construction · Electrical
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

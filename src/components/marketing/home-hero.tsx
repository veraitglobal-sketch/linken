import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4">
      <div className="mesh-stage relative mx-auto grid w-full max-w-6xl min-h-[82vh] overflow-hidden rounded-[32px] lg:grid-cols-[1.12fr_0.88fr]">
        <div className="stage-grain absolute inset-0 z-[1]" />

        <div className="relative z-10 flex flex-col justify-between px-7 py-9 sm:px-11 sm:py-12">
          <div className="animate-rise flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5ec4a8]" />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              Mutually confirmed project networks
            </p>
          </div>

          <div className="animate-rise-delay max-w-xl py-12">
            <p className="font-display text-[clamp(3.2rem,7.5vw,5.2rem)] leading-[0.9] font-medium tracking-[-0.05em] text-white">
              Linken
            </p>
            <h1 className="mt-6 font-display text-[clamp(1.7rem,3.5vw,2.7rem)] leading-[1.12] font-medium tracking-[-0.03em] text-white/93">
              The company page that shows who you build with — only after they
              confirm.
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/65">
              Profiles, case studies, and partners. Public only with two yeses.
            </p>
          </div>

          <div className="animate-rise-late flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href="/onboarding" variant="light" className="h-12 min-w-[180px] px-6">
              Create company link
            </Button>
            <Button
              href="/c/acme-architecture"
              variant="onDark"
              className="h-12 min-w-[180px] px-6"
            >
              Open example profile
            </Button>
          </div>
        </div>

        <div className="group relative min-h-[260px] overflow-hidden lg:min-h-full">
          <Image
            src="/images/site-work.jpg"
            alt="Teams delivering a real project"
            fill
            priority
            className="media-zoom object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-[rgba(10,20,18,0.45)]" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-black/35 px-4 py-3 backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-[#5ec4a8] uppercase">
              On this network
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              Architecture · Construction · Electrical
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

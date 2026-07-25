import Image from "next/image";
import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";

export function HomeHero() {
  return (
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4 pt-1">
      <div className="hero-live relative mx-auto grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-[32px] shadow-[0_28px_90px_rgba(8,20,18,0.28)] lg:min-h-[82vh] lg:grid-cols-[1.15fr_0.85fr]">
        <div
          className="pointer-events-none absolute inset-0 z-[1] hidden opacity-60 lg:block"
          style={{
            background:
              "radial-gradient(ellipse 50% 65% at 58% 68%, rgba(217,165,92,0.12), transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between px-7 py-9 sm:px-11 sm:py-12">
          <div className="animate-rise flex items-center gap-2.5 text-white/50">
            <NetworkMark size={17} animate={false} />
            <p className="text-[13px] font-medium tracking-[-0.01em]">
              Mutually confirmed project networks
            </p>
          </div>

          <div className="max-w-2xl py-12">
            <p className="animate-rise font-display text-[clamp(3.4rem,8.5vw,6.2rem)] leading-[0.9] font-medium tracking-[-0.055em] text-white">
              Hansala
            </p>
            <h1 className="animate-rise-delay mt-6 font-display text-[clamp(1.7rem,3.5vw,2.7rem)] leading-[1.14] font-medium tracking-[-0.032em] text-white/[0.92]">
              The company page that shows who you build with — only after
              they confirm.
            </h1>
            <p className="animate-rise-delay mt-5 max-w-md text-[15px] leading-relaxed text-white/58">
              Profiles, case studies, and partners. Public only with two
              yeses.
            </p>
          </div>

          <div className="animate-rise-late flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/onboarding"
              variant="light"
              className="h-12 min-w-[180px] px-6"
            >
              Create company
            </Button>
            <Button
              href="/demo"
              variant="onDark"
              className="h-12 min-w-[180px] px-6"
            >
              See an example
            </Button>
          </div>
        </div>

        <div className="relative min-h-[280px]">
          <Image
            src="/images/hero-partner.jpg"
            alt="Architecture firm partner reviewing plans outside a project site"
            fill
            priority
            fetchPriority="high"
            quality={72}
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, var(--navy) 0%, rgba(14,31,28,0.72) 25%, rgba(14,31,28,0.4) 42%, rgba(14,31,28,0.12) 58%, transparent 72%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

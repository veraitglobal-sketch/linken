import { Button } from "@/components/ui/button";
import { IndustryMark } from "@/components/marketing/industry-mark";
import { NetworkMark } from "@/components/marketing/network-mark";

const INDUSTRIES = [
  { key: "architecture", label: "Architecture" },
  { key: "construction", label: "Construction" },
  { key: "electrical", label: "Electrical" },
] as const;

export function HomeHero() {
  return (
    <section className="flex min-h-[calc(100svh-4.75rem)] items-center px-4 pt-1">
      <div className="hero-live relative mx-auto flex w-full max-w-6xl min-h-[82vh] flex-col justify-between overflow-hidden rounded-[32px] px-7 py-9 shadow-[0_28px_90px_rgba(8,20,18,0.28)] sm:px-11 sm:py-12">
        <div className="stage-grain absolute inset-0 z-[1]" />

        <div className="animate-rise relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-white/50">
            <NetworkMark size={17} animate={false} />
            <p className="text-[13px] font-medium tracking-[-0.01em]">
              Mutually confirmed project networks
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INDUSTRIES.map((industry) => (
              <span
                key={industry.key}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/14 bg-[#081412]/48 px-3 py-1.5 text-[12px] font-medium text-white/75 backdrop-blur-md"
              >
                <IndustryMark type={industry.key} size={13} />
                {industry.label}
              </span>
            ))}
          </div>
        </div>

        <div className="animate-rise-delay relative z-10 max-w-2xl py-12">
          <p className="font-display text-[clamp(3.4rem,8.5vw,6.2rem)] leading-[0.9] font-medium tracking-[-0.055em] text-white">
            Hansala
          </p>
          <h1 className="mt-6 font-display text-[clamp(1.7rem,3.5vw,2.7rem)] leading-[1.14] font-medium tracking-[-0.032em] text-white/[0.92]">
            The company page that shows who you build with — only after they
            confirm.
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/58">
            Profiles, case studies, and partners. Public only with two yeses.
          </p>
        </div>

        <div className="animate-rise-late relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center">
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
    </section>
  );
}

import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Company } from "@/types/company";

type Props = {
  company: Company;
};

export function CompanyHeroBand({ company }: Props) {
  return (
    <section className="px-4 pt-3">
      <div className="mesh-stage relative mx-auto grid max-w-6xl overflow-hidden rounded-[32px] lg:min-h-[560px] lg:grid-cols-[1.15fr_0.85fr]">
        <div className="stage-grain absolute inset-0 z-[1]" />

        <div className="relative z-10 flex flex-col justify-between px-6 py-8 text-white sm:px-10 sm:py-11">
          <div className="animate-rise flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
            <p className="text-[11px] font-semibold tracking-[0.16em] text-white/70 uppercase">
              {company.category} · {company.city}, {company.country}
            </p>
            {company.verified ? (
              <span className="rounded-full border border-[#5ec4a8]/35 bg-[#5ec4a8]/12 px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em] text-[#5ec4a8] uppercase">
                Verified company
              </span>
            ) : null}
          </div>

          <div className="animate-rise-delay max-w-xl py-10">
            <p className="font-display text-[clamp(0.95rem,1.4vw,1.1rem)] tracking-[0.04em] text-white/40 uppercase">
              Public company page
            </p>
            <h1 className="mt-3 font-display text-[clamp(2.4rem,5.5vw,4rem)] leading-[0.94] font-medium tracking-[-0.045em]">
              {company.name}
            </h1>
            <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
              {company.tagline}
            </p>
          </div>

          <div className="animate-rise-late space-y-4">
            <div className="rounded-2xl border border-white/12 bg-black/25 px-4 py-3 backdrop-blur-md">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/40 uppercase">
                Shareable address
              </p>
              <p className="mt-1 font-display text-lg tracking-[-0.03em] text-white sm:text-xl">
                linken.com/
                <span className="text-[#5ec4a8]">{company.slug}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Button
                href={company.website}
                variant="light"
                className="h-11 min-w-[150px] px-5"
              >
                Website
              </Button>
              <Button variant="onDark" className="h-11 min-w-[150px] px-5">
                Share profile
              </Button>
            </div>
          </div>
        </div>

        <div className="group relative min-h-[220px] overflow-hidden lg:min-h-full">
          <Image
            src="/images/site-work.jpg"
            alt=""
            fill
            priority
            className="media-zoom object-cover"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-[rgba(10,20,18,0.5)]" />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/15 bg-black/40 px-4 py-3.5 backdrop-blur-md">
            <p className="text-[11px] font-semibold tracking-[0.12em] text-ember uppercase">
              On Linken
            </p>
            <p className="mt-1 text-sm font-medium text-white">
              Profile · Case studies · Mutual partners
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

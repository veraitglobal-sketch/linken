import { Button } from "@/components/ui/button";
import { NetworkMark } from "@/components/marketing/network-mark";
import { HomeSection } from "@/components/marketing/home-section";

/** Final calm CTA — closes the homepage composition. */
export function HomeClose() {
  return (
    <HomeSection tone="tight" className="!pb-24 sm:!pb-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-navy px-8 py-14 text-white shadow-[0_28px_80px_rgba(8,20,18,0.22)] sm:px-12 sm:py-16 lg:rounded-[32px]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(126,184,164,0.14), transparent 55%), radial-gradient(ellipse 50% 60% at 100% 0%, rgba(26,92,81,0.25), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-0 stage-grain opacity-30" aria-hidden />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 text-blue-soft">
              <NetworkMark size={18} animate={false} />
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase">
                Start
              </p>
            </div>
            <h2 className="mt-5 font-display text-[clamp(2rem,4.2vw,3.1rem)] font-medium leading-[1.1] tracking-[-0.042em]">
              Put your confirmed network on the record.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/55">
              Create your company profile. Invite partners. Publish only what
              both sides confirm.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              href="/onboarding"
              variant="light"
              className="h-12 min-w-[168px] px-6"
            >
              Create company
            </Button>
            <Button
              href="/demo"
              variant="onDark"
              className="h-12 min-w-[168px] px-6"
            >
              See an example
            </Button>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}

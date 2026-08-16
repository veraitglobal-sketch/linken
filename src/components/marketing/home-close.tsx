import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AmbientPlate } from "@/components/marketing/ambient-plate";
import { NetworkMark } from "@/components/marketing/network-mark";
import { HomeSection } from "@/components/marketing/home-section";

/** Homepage §8c — dark close stage; bookend with Hero. */
export function HomeClose() {
  return (
    <HomeSection>
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-hero bg-navy px-8 py-14 text-on-navy shadow-hero sm:px-12 sm:py-16">
        {/* The loop lives here rather than in the hero: deep below the fold,
            so 3.2 MB never touches first paint, and it turns the last thing a
            visitor sees from a flat slab into a moment. */}
        <AmbientPlate
          poster="/images/hero-plate.webp"
          src="/videos/hero-plate.mp4"
          className="absolute inset-0 opacity-55"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-navy/45"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 0% 50%, rgba(126,184,164,0.14), transparent 55%), radial-gradient(ellipse 50% 60% at 100% 0%, rgba(26,92,81,0.25), transparent 50%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 stage-grain opacity-30"
          aria-hidden
        />

        <div className="relative flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5 text-blue-soft">
              <NetworkMark size={18} animate={false} />
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase">
                Start
              </p>
            </div>
            <h2 className="reveal mt-5 font-display text-chapter text-balance">
              Put your confirmed network on the record.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-on-navy-soft/80">
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
              Create your free profile
            </Button>
            <Button
              href="/demo"
              variant="onDark"
              className="h-12 min-w-[168px] px-6"
            >
              See a live example
            </Button>
          </div>
        </div>

        <p className="relative mt-10 border-t border-white/10 pt-6 text-[13px] text-on-navy-muted">
          Agency or studio? See the{" "}
          <Link
            href="/developers/partners"
            className="font-medium text-on-navy-soft underline decoration-white/25 underline-offset-4 hover:text-on-navy"
          >
            developer partner program
          </Link>
          . Building on the API?{" "}
          <Link
            href="/developers"
            className="font-medium text-on-navy-soft underline decoration-white/25 underline-offset-4 hover:text-on-navy"
          >
            Developer docs
          </Link>
          .
        </p>
      </div>
    </HomeSection>
  );
}

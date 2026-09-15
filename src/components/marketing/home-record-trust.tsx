import Image from "next/image";
import { FLOW_STEPS } from "@/components/marketing/product-flow-data";
import {
  HomeBand,
  HomeTitle,
} from "@/components/marketing/home-section";

/** What protects both sides, each shown as the state the product displays. */
const PROTECTIONS = [
  { label: "Private until confirmed", state: "Pending · only you see it" },
  { label: "Identity is domain proof", state: "Domain verified" },
  { label: "Author text is locked", state: "Edited only by the author" },
  { label: "Disputes come off the record", state: "Removed from view while resolved" },
  { label: "Staff hide, never rewrite", state: "Every change audited with a reason" },
  { label: "Nothing negative is published", state: "Confirmed facts only" },
] as const;

/**
 * Homepage §9 — the process beside the product doing it, running straight
 * into the dark trust block beneath it.
 */
export function HomeRecordTrust() {
  return (
    <HomeBand>
      <div className="relative">
        {/* Process on the left, a photograph of the work on the right. */}
        <div className="relative z-10 grid items-center gap-10 overflow-hidden rounded-[32px] bg-[#16302a] px-8 py-14 text-on-navy sm:rounded-[60px] sm:px-20 sm:py-16 lg:min-h-[620px] lg:grid-cols-[1fr_1fr]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(205,239,132,0.4) 1px, transparent 1.2px)",
              backgroundSize: "24px 24px",
              maskImage: "linear-gradient(90deg, transparent 35%, black)",
            }}
          />
          <div className="relative">
            <HomeTitle onDark>Nobody writes their own record.</HomeTitle>
            <p className="mt-8 max-w-[44ch] text-[16px] leading-relaxed">
              One side adds, the other decides. Nothing reaches a visitor in
              between.
            </p>
            <p className="mt-8 text-[16px] font-bold">How a record is made:</p>
            <ul className="mt-4 list-none space-y-3 p-0">
              {FLOW_STEPS.map((s) => (
                <li key={s.label} className="flex gap-3 text-[16px]">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-lime text-navy">
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="m2.5 6.5 2.2 2.2L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <span className="font-semibold">{s.label}</span> →{" "}
                    <span className="text-on-navy-soft">{s.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-h-[380px] overflow-hidden rounded-3xl ring-1 ring-white/10 lg:h-full lg:min-h-[480px]">
            <Image
              src="/images/lookup-wide-a1.jpg"
              alt="A small team in conversation around a table in a workshop"
              fill
              quality={75}
              className="object-cover object-[60%_center]"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
        </div>

        <div className="-mt-28 rounded-[32px] bg-navy px-4 pt-[180px] pb-20 text-center sm:rounded-[60px] sm:pt-[198px] sm:pb-[94px]">
          <HomeTitle onDark>The record protects both sides.</HomeTitle>
          <p className="mx-auto mt-6 max-w-[62ch] text-[16px] leading-relaxed text-on-navy">
            Policies and company identity are public — the same standard we ask
            of every profile on Hansala.
          </p>
          <ul className="mx-auto mt-14 grid max-w-[1040px] list-none gap-x-8 gap-y-12 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {PROTECTIONS.map((p) => (
              <li key={p.label} className="flex flex-col items-center">
                <span className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 text-[13px] font-semibold text-lime">
                  <span className="size-2 rounded-full bg-lime" />
                  {p.state}
                </span>
                <span className="mt-4 text-[16px] font-semibold text-on-navy">
                  {p.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HomeBand>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";
import {
  FREE_HIGHLIGHTS,
  FREE_PLAN_PRICE,
  PRO_HIGHLIGHTS,
  PRO_PLAN_LABEL,
  PRO_PLAN_PRICE,
} from "@/features/plan/pricing";

/** Free vs Pro preview — same source as /pricing. */
export function HomePlans() {
  return (
    <HomeSection tone="tight">
      <div className="mx-auto max-w-6xl">
        <HomeEyebrow>Plans</HomeEyebrow>
        <h2 className="mt-5 max-w-2xl font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.08] tracking-[-0.042em] text-ink">
          The record is free. Pro is reach.
        </h2>
        <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
          Verification is never for sale — the badge is domain proof, not a
          paid tier. See the full comparison on{" "}
          <Link
            href="/pricing"
            className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink"
          >
            Pricing
          </Link>
          .
        </p>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <PlanCard
            name="Free"
            price={FREE_PLAN_PRICE}
            features={[...FREE_HIGHLIGHTS]}
            cta="Create your free profile"
            href="/onboarding"
          />
          <PlanCard
            name={PRO_PLAN_LABEL}
            price={PRO_PLAN_PRICE}
            features={[...PRO_HIGHLIGHTS]}
            note="Everything in Free, plus:"
            cta="See pricing"
            href="/pricing"
            dark
          />
        </div>
      </div>
    </HomeSection>
  );
}

function PlanCard({
  name,
  price,
  features,
  note,
  cta,
  href,
  dark,
}: {
  name: string;
  price: string;
  features: string[];
  note?: string;
  cta: string;
  href: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-[24px] p-7 sm:p-9 ${
        dark
          ? "bg-navy text-white shadow-[0_24px_60px_rgba(8,20,18,0.2)]"
          : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className={`font-display text-[22px] font-medium tracking-[-0.025em] ${dark ? "text-white" : "text-ink"}`}
        >
          {name}
        </h3>
        <p
          className={`font-display text-[17px] font-medium tracking-[-0.02em] ${dark ? "text-white/85" : "text-ink-soft"}`}
        >
          {price}
        </p>
      </div>
      {note ? (
        <p className={`mt-5 text-[13px] ${dark ? "text-white/50" : "text-muted"}`}>
          {note}
        </p>
      ) : null}
      <ul className={`${note ? "mt-3" : "mt-6"} flex-1 space-y-3`}>
        {features.map((feature) => (
          <li
            key={feature}
            className={`flex gap-3 text-[13.5px] leading-relaxed ${dark ? "text-white/75" : "text-ink-soft"}`}
          >
            <span
              className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7eb8a4]"
              aria-hidden
            />
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-8">
        <Button
          href={href}
          variant={dark ? "light" : "secondary"}
          className="h-11 w-full sm:w-auto sm:min-w-[220px]"
        >
          {cta}
        </Button>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  companyName: string;
  domainVerified: boolean;
  from?: "claim" | "confirm" | "onboarding";
};

/**
 * Post-claim / post-confirm — shortest path for invitees to become an active node.
 */
export function WelcomeSetup({
  companySlug,
  companyName,
  domainVerified,
  from = "claim",
}: Props) {
  const heading =
    from === "confirm"
      ? "You’re on Linken"
      : from === "onboarding"
        ? "Your company link is live"
        : "Welcome to Linken";

  const sub =
    from === "confirm"
      ? `You confirmed a relationship. Finish two steps so ${companyName} can grow its own network — not only appear on someone else’s.`
      : `Two steps make ${companyName} an active, trusted node.`;

  return (
    <section className="mx-auto max-w-lg px-5 py-14 sm:py-20">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Getting started
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-[-0.04em] text-ink">
        {heading}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{sub}</p>

      <ol className="mt-8 space-y-3">
        <li className="rounded-2xl border border-line bg-white px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
            Step 1
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink">
            Verify your domain
          </p>
          <p className="mt-1 text-[13px] text-[#64748b]">
            {domainVerified
              ? "Already verified — you’re set."
              : "Required before partnerships become official."}
          </p>
          {!domainVerified ? (
            <Button
              href="/dashboard/verification"
              className="mt-3 h-10 px-4 text-[13px]"
            >
              Verify domain
            </Button>
          ) : null}
        </li>
        <li className="rounded-2xl border border-line bg-white px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#94a3b8] uppercase">
            Step 2
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink">
            Add your first reference
          </p>
          <p className="mt-1 text-[13px] text-[#64748b]">
            A confirmed client relationship is the strongest signal on Linken.
          </p>
          <Button
            href={`/c/${companySlug}#references`}
            variant="secondary"
            className="mt-3 h-10 px-4 text-[13px]"
          >
            Add a reference
          </Button>
        </li>
      </ol>

      <p className="mt-8 text-center text-[13px]">
        <Link
          href="/dashboard"
          className="font-semibold text-[#64748b] underline-offset-2 hover:text-ink hover:underline"
        >
          Go to network graph
        </Link>
      </p>
    </section>
  );
}

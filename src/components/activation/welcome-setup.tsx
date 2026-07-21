import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
  companyName: string;
  domainVerified: boolean;
  hasPartnership?: boolean;
  from?: "claim" | "confirm" | "onboarding";
};

/**
 * Post-claim / onboarding — shortest path to an active network node:
 * verify domain → invite first partner.
 */
export function WelcomeSetup({
  companySlug,
  companyName,
  domainVerified,
  hasPartnership = false,
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
      ? `You confirmed a relationship. Finish setup so ${companyName} can grow its own network.`
      : `Two steps make ${companyName} an active node on the network.`;

  return (
    <section className="mx-auto max-w-lg px-5 py-14 sm:py-20">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        Getting started
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.75rem,4vw,2.35rem)] font-medium tracking-[-0.04em] text-ink">
        {heading}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{sub}</p>

      <ol className="mt-8 space-y-3">
        <li className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
            Step 1
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink">
            Verify your domain
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {domainVerified
              ? "Verified — partnerships can become official."
              : "Required before partner requests become official."}
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
        <li className="rounded-2xl border border-line bg-surface px-4 py-4">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-muted uppercase">
            Step 2
          </p>
          <p className="mt-1 text-[15px] font-semibold text-ink">
            Invite your first partner
          </p>
          <p className="mt-1 text-[13px] text-muted">
            {hasPartnership
              ? "Partner request started — they appear on Network after they accept."
              : "Search a firm or send a draft invite. Confirmed partners show on your graph."}
          </p>
          {!hasPartnership ? (
            <Button
              href={
                domainVerified
                  ? "/dashboard/partners"
                  : "/dashboard/verification"
              }
              variant={domainVerified ? "primary" : "secondary"}
              className="mt-3 h-10 px-4 text-[13px]"
            >
              {domainVerified ? "Invite a partner" : "Verify first"}
            </Button>
          ) : (
            <Button
              href="/dashboard"
              variant="secondary"
              className="mt-3 h-10 px-4 text-[13px]"
            >
              Open network
            </Button>
          )}
        </li>
      </ol>

      <p className="mt-8 text-center text-[13px] text-muted">
        Later: add a{" "}
        <Link
          href={`/c/${companySlug}#references`}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          confirmed reference
        </Link>{" "}
        ·{" "}
        <Link
          href="/dashboard"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Network graph
        </Link>
      </p>
    </section>
  );
}

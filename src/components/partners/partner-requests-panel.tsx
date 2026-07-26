import type { ReactNode } from "react";
import Link from "next/link";
import { respondPartnership } from "@/features/network/actions";
import type { PartnershipRow } from "@/features/partners/inbox";
import { Button } from "@/components/ui/button";

const BACK = "/partners/requests";

type Props = {
  incoming: PartnershipRow[];
  verified: boolean;
  companySlug: string;
  error?: string;
  accepted?: boolean;
  declined?: boolean;
  needVerify?: boolean;
};

export function PartnerRequestsPanel({
  incoming,
  verified,
  companySlug,
  error,
  accepted,
  declined,
  needVerify,
}: Props) {
  if (accepted) {
    return (
      <Status
        title="Partnership confirmed"
        body="You’re official partners. The link appears on both public profiles and the network map."
        href="/dashboard"
        cta="Open network map"
      />
    );
  }

  if (declined) {
    return (
      <Status
        title="Request declined"
        body="No partnership was created."
        href={`/c/${companySlug}`}
        cta="Back to company"
      />
    );
  }

  return (
    <div className="space-y-4">
      {!verified || needVerify ? (
        <Note tone="warn">
          Verify your domain before accepting.{" "}
          <Link
            href="/dashboard/verification"
            className="font-semibold underline-offset-2 hover:underline"
          >
            Verify domain
          </Link>
        </Note>
      ) : null}

      {error ? <Note tone="error">{error}</Note> : null}

      {incoming.length === 0 ? (
        <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center">
          <p className="text-[14px] text-ink-soft">No open partnership requests.</p>
          <Link
            href="/dashboard/partners"
            className="mt-4 inline-block text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Open full Partners inbox
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {incoming.map((row) => (
            <li
              key={row.id}
              className="rounded-[24px] border border-line bg-surface px-5 py-5"
            >
              <p className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
                {row.other.name}
              </p>
              <p className="mt-1 text-[13px] text-muted">
                {[row.other.category, row.other.city].filter(Boolean).join(" · ") ||
                  "Partnership request"}
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <form action={respondPartnership} className="flex-1">
                  <input type="hidden" name="partnership_id" value={row.id} />
                  <input type="hidden" name="decision" value="accepted" />
                  <input type="hidden" name="back" value={BACK} />
                  <Button type="submit" className="h-11 w-full" disabled={!verified}>
                    Accept partnership
                  </Button>
                </form>
                <form action={respondPartnership} className="flex-1">
                  <input type="hidden" name="partnership_id" value={row.id} />
                  <input type="hidden" name="decision" value="declined" />
                  <input type="hidden" name="back" value={BACK} />
                  <Button type="submit" variant="secondary" className="h-11 w-full">
                    Decline
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Note({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "warn" | "error";
}) {
  const cls =
    tone === "error"
      ? "border-ember/35 bg-ember/10"
      : "border-line bg-[#f7f8fa]";
  return (
    <p className={`rounded-2xl border px-4 py-3 text-[13px] text-ink ${cls}`}>
      {children}
    </p>
  );
}

function Status({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="rounded-[24px] border border-line bg-surface px-5 py-8 text-center sm:px-7">
      <h2 className="font-display text-2xl font-medium tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-md text-[14px] text-ink-soft">{body}</p>
      <Link
        href={href}
        className="mt-6 inline-flex h-11 items-center rounded-full bg-navy px-5 text-[13px] font-semibold text-white"
      >
        {cta}
      </Link>
    </div>
  );
}

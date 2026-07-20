import {
  markIntroNotRelevant,
  setReceiveIntros,
} from "@/features/intros/actions";
import { IntroProof } from "@/components/intros/intro-proof";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { IntroInboxItem } from "@/types/intro";

type Props = {
  intros: IntroInboxItem[];
  receiveIntros: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DashboardIntros({ intros, receiveIntros }: Props) {
  return (
    <section className="rounded-[28px] border border-line bg-white px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
        Intros · via Linken Radar
      </p>
      <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {intros.length} received
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        Outbound firm-to-firm notes. Never mixed with profile inquiries — reply
        by email.
      </p>

      <form action={setReceiveIntros} className="mt-4 flex flex-wrap items-center gap-2">
        <input type="hidden" name="enabled" value={receiveIntros ? "0" : "1"} />
        <Button type="submit" variant="secondary" className="h-9 px-3 text-[13px]">
          {receiveIntros ? "Pause receiving intros" : "Accept intros again"}
        </Button>
        <span className="text-[12px] text-ink-soft">
          Currently {receiveIntros ? "accepting" : "not accepting"} intros
        </span>
      </form>

      {intros.length === 0 ? (
        <p className="mt-5 text-sm text-muted">No intros yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
          {intros.map((intro) => (
            <li
              key={intro.id}
              className="rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3.5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <IntroProof
                  name={intro.peerName}
                  slug={intro.peerSlug}
                  verified={intro.peerVerified}
                  trustLevel={intro.peerTrustLevel}
                  wouldWorkAgain={intro.wouldWorkAgain}
                />
                <Badge tone="neutral">{intro.status}</Badge>
              </div>
              <p className="mt-2 text-[13px] font-medium text-ink">
                Offer: {intro.offer}
              </p>
              <p className="mt-1 text-[12px] text-ink-soft">
                Why relevant: {intro.whyRelevant}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink whitespace-pre-wrap">
                {intro.message}
              </p>
              <p className="mt-2 text-[11px] text-[#94a3b8]">
                {formatDate(intro.createdAt)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {intro.replyEmail ? (
                  <a
                    href={`mailto:${intro.replyEmail}?subject=${encodeURIComponent(`Re: ${intro.offer} (Linken)`)}`}
                    className="rounded-md border border-line bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink"
                  >
                    Reply by email
                  </a>
                ) : null}
                {intro.status !== "not_relevant" ? (
                  <form action={markIntroNotRelevant}>
                    <input type="hidden" name="intro_id" value={intro.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-ink-soft"
                    >
                      Not relevant
                    </button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

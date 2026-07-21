import { markIntroNotRelevant } from "@/features/intros/actions";
import { IntroProof } from "@/components/intros/intro-proof";
import { Badge } from "@/components/ui/badge";
import type { IntroInboxItem } from "@/types/intro";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  if (status === "not_relevant") return "Not relevant";
  if (status === "seen") return "Seen";
  if (status === "sent") return "New";
  return status;
}

export function IntroRow({
  intro,
  index = 0,
}: {
  intro: IntroInboxItem;
  index?: number;
}) {
  return (
    <li
      className="linken-widget-enter px-5 py-4 sm:px-6"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <IntroProof
          name={intro.peerName}
          slug={intro.peerSlug}
          verified={intro.peerVerified}
          trustLevel={intro.peerTrustLevel}
          wouldWorkAgain={intro.wouldWorkAgain}
        />
        <div className="flex items-center gap-2">
          <Badge tone="neutral">{statusLabel(intro.status)}</Badge>
          <time className="text-[12px] tabular-nums text-plus">
            {formatDate(intro.createdAt)}
          </time>
        </div>
      </div>

      <p className="mt-2 text-[13px] font-semibold text-ink">{intro.offer}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted">
        {intro.whyRelevant}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-wrap text-ink">
        {intro.message}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {intro.replyEmail ? (
          <a
            href={`mailto:${intro.replyEmail}?subject=${encodeURIComponent(`Re: ${intro.offer} (Hansala)`)}`}
            className="inline-flex h-9 items-center rounded-xl bg-navy px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Reply by email
          </a>
        ) : null}
        {intro.status !== "not_relevant" ? (
          <form action={markIntroNotRelevant}>
            <input type="hidden" name="intro_id" value={intro.id} />
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-xl border border-line px-3.5 text-[12px] font-semibold text-ink transition-colors hover:bg-paper"
            >
              Not relevant
            </button>
          </form>
        ) : null}
      </div>
    </li>
  );
}

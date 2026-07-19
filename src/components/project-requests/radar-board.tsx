import Link from "next/link";
import type { AnalyticsSummary } from "@/features/analytics/queries";
import { CreditsEmpty } from "@/components/project-requests/credits-empty";
import { RadarLocked } from "@/components/project-requests/radar-locked";
import { RadarSignals } from "@/components/project-requests/radar-signals";
import { RespondForm } from "@/components/project-requests/respond-form";
import { ResponseHistory } from "@/components/project-requests/response-history";
import { Badge } from "@/components/ui/badge";
import type {
  MyRequestResponse,
  OpenProjectRequest,
} from "@/types/project-request";

type Props = {
  openRequests: OpenProjectRequest[];
  history: MyRequestResponse[];
  balance: number;
  verified: boolean;
  radarEnabled: boolean;
  analytics: AnalyticsSummary;
  respondedIds: Set<string>;
  error?: string;
  responded?: boolean;
};

export function RadarBoard({
  openRequests,
  history,
  balance,
  verified,
  radarEnabled,
  analytics,
  respondedIds,
  error,
  responded,
}: Props) {
  return (
    <div className="space-y-10">
      {error ? (
        <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      ) : null}
      {responded ? (
        <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          Response sent via Linken Radar. Buyer contact is in your history below.
        </p>
      ) : null}

      {!radarEnabled ? <RadarLocked /> : null}

      <RadarSignals analytics={analytics} />

      {radarEnabled ? (
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
              Credit balance
            </p>
            <p className="mt-1 font-display text-3xl font-medium tracking-[-0.03em] text-ink">
              {balance}
            </p>
          </div>
          {!verified ? (
            <Link
              href="/dashboard/verification"
              className="text-[13px] font-semibold text-ink underline"
            >
              Verify your domain to respond
            </Link>
          ) : null}
        </div>
      ) : null}

      {radarEnabled && balance < 1 ? <CreditsEmpty /> : null}

      <section>
        <h2 className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
          Open requests
        </h2>
        {openRequests.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-soft">
            No open requests match your category and city right now.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {openRequests.map((req) => {
              const full = req.responsesCount >= req.maxResponses;
              const already = respondedIds.has(req.id);
              let disabled: string | undefined;
              if (!radarEnabled) disabled = "Radar — coming soon.";
              else if (!verified) disabled = "Verify your domain to respond.";
              else if (balance < 1) disabled = "Add credits to respond.";
              else if (full) disabled = "Request full.";
              else if (already) disabled = "You already responded.";

              return (
                <li
                  key={req.id}
                  className="rounded-xl border border-line bg-paper px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[15px] font-semibold text-ink">
                      {req.title}
                    </h3>
                    <Badge tone={full ? "neutral" : "success"}>
                      {req.responsesCount} of {req.maxResponses} responses taken
                    </Badge>
                  </div>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-soft whitespace-pre-wrap">
                    {req.description}
                  </p>
                  {(req.budgetHint || req.timeline) && (
                    <p className="mt-2 text-[12px] text-ink-soft">
                      {[
                        req.budgetHint && `Budget: ${req.budgetHint}`,
                        req.timeline && `Timeline: ${req.timeline}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  <RespondForm requestId={req.id} disabledReason={disabled} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {radarEnabled ? <ResponseHistory history={history} /> : null}
    </div>
  );
}

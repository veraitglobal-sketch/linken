import Link from "next/link";
import type { AnalyticsSummary } from "@/features/analytics/queries";
import { CreditsEmpty } from "@/components/project-requests/credits-empty";
import { RadarLocked } from "@/components/project-requests/radar-locked";
import { RadarSignals } from "@/components/project-requests/radar-signals";
import { RespondForm } from "@/components/project-requests/respond-form";
import { ResponseHistory } from "@/components/project-requests/response-history";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
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
  responded,
}: Props) {
  return (
    <div className="space-y-8">
      {responded ? (
        <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-[13px] text-ink">
          Response sent via Linken Radar. Buyer contact is in your history
          below.
        </p>
      ) : null}

      {!radarEnabled ? <RadarLocked /> : null}

      <RadarSignals analytics={analytics} />

      {radarEnabled ? (
        <WorkspaceCard className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
              Credit balance
            </p>
            <p className="mt-1 font-display text-[28px] font-semibold tracking-[-0.04em] text-ink">
              {balance}
            </p>
          </div>
          {!verified ? (
            <Link
              href="/dashboard/verification"
              className="text-[13px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Verify your domain to respond
            </Link>
          ) : null}
        </WorkspaceCard>
      ) : null}

      {radarEnabled && balance < 1 ? <CreditsEmpty /> : null}

      <section>
        <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Open requests
          </h2>
          <p className="text-[12px] font-medium text-plus">
            {openRequests.length} open
          </p>
        </header>

        <WorkspaceCard padded={false}>
          {openRequests.length === 0 ? (
            <div className="px-5 py-10 text-center sm:px-6">
              <p className="text-[14px] font-medium text-ink">
                No matching requests
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
                No open requests match your category and city right now.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {openRequests.map((req, i) => {
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
                    className="linken-widget-enter px-5 py-4 sm:px-6"
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[15px] font-semibold text-ink">
                        {req.title}
                      </h3>
                      <Badge tone={full ? "neutral" : "success"}>
                        {req.responsesCount} of {req.maxResponses} responses
                      </Badge>
                    </div>
                    <p className="mt-2 text-[13px] leading-relaxed whitespace-pre-wrap text-ink">
                      {req.description}
                    </p>
                    {req.budgetHint || req.timeline ? (
                      <p className="mt-2 text-[12px] text-muted">
                        {[
                          req.budgetHint && `Budget: ${req.budgetHint}`,
                          req.timeline && `Timeline: ${req.timeline}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    ) : null}
                    <RespondForm
                      requestId={req.id}
                      disabledReason={disabled}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </WorkspaceCard>
      </section>

      {radarEnabled ? <ResponseHistory history={history} /> : null}
    </div>
  );
}

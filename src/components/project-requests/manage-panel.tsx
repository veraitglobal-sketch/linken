import Link from "next/link";
import { closeProjectRequest } from "@/features/project-requests/buyer-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  ManagedProjectRequest,
  ManagedResponse,
} from "@/types/project-request";

type Props = {
  request: ManagedProjectRequest;
  responses: ManagedResponse[];
  token: string;
  error?: string;
  closed?: boolean;
};

export function ManageRequestPanel({
  request,
  responses,
  token,
  error,
  closed,
}: Props) {
  const isOpen = request.status === "open";

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-xl border border-ember/35 bg-ember/10 px-4 py-3 text-sm">
          {error}
        </p>
      ) : null}
      {closed || request.status === "closed" ? (
        <p className="rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink-soft">
          This request is closed. Firms can no longer respond.
        </p>
      ) : null}

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={isOpen ? "success" : "neutral"}>{request.status}</Badge>
          <span className="text-[12px] text-ink-soft">
            {request.responsesCount} of {request.maxResponses} responses
          </span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-[-0.03em] text-ink">
          {request.title}
        </h2>
        <p className="mt-1 text-[13px] text-ink-soft">
          {request.category} · {request.city}
          {request.country ? `, ${request.country}` : ""}
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-ink whitespace-pre-wrap">
          {request.description}
        </p>
        {(request.budgetHint || request.timeline) && (
          <p className="mt-3 text-[13px] text-ink-soft">
            {[request.budgetHint && `Budget: ${request.budgetHint}`, request.timeline && `Timeline: ${request.timeline}`]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      <section>
        <h3 className="text-[11px] font-semibold tracking-[0.14em] text-[#94a3b8] uppercase">
          Responses
        </h3>
        {responses.length === 0 ? (
          <p className="mt-3 text-[14px] text-ink-soft">
            No responses yet. We will email you when a firm replies.
          </p>
        ) : (
          <ul className="mt-3 space-y-4">
            {responses.map((r) => (
              <li
                key={r.responseId}
                className="rounded-xl border border-line bg-paper px-4 py-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/c/${r.companySlug}`}
                    className="text-[15px] font-semibold text-ink underline-offset-2 hover:underline"
                  >
                    {r.companyName}
                  </Link>
                  {r.companyVerified ? (
                    <Badge tone="success">Verified</Badge>
                  ) : null}
                  {r.trustLevel ? (
                    <Badge tone="neutral">{r.trustLevel}</Badge>
                  ) : null}
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-ink whitespace-pre-wrap">
                  {r.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isOpen ? (
        <form action={closeProjectRequest}>
          <input type="hidden" name="manage_token" value={token} />
          <Button type="submit" variant="secondary" className="h-10">
            Close request
          </Button>
        </form>
      ) : null}
    </div>
  );
}

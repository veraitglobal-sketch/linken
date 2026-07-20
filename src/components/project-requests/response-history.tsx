import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Badge } from "@/components/ui/badge";
import type { MyRequestResponse } from "@/types/project-request";

type Props = {
  history: MyRequestResponse[];
};

export function ResponseHistory({ history }: Props) {
  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Your responses
        </h2>
        <p className="text-[12px] font-medium text-plus">
          {history.length} sent
        </p>
      </header>

      <WorkspaceCard padded={false}>
        {history.length === 0 ? (
          <div className="px-5 py-10 text-center sm:px-6">
            <p className="text-[14px] font-medium text-ink">No responses yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-relaxed text-muted">
              When you respond with credits, buyer contact appears here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {history.map((h) => (
              <li key={h.responseId} className="px-5 py-4 sm:px-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">
                    {h.title}
                  </span>
                  <Badge tone="neutral">{h.status}</Badge>
                </div>
                <p className="mt-1 text-[12px] text-muted">
                  {h.category} · {h.city}
                </p>
                <p className="mt-2 text-[13px] text-ink">
                  {h.requesterName}
                  {h.requesterCompany ? ` · ${h.requesterCompany}` : ""}
                  {" · "}
                  <a
                    href={`mailto:${h.requesterEmail}`}
                    className="font-semibold text-blue underline-offset-2 hover:underline"
                  >
                    {h.requesterEmail}
                  </a>
                </p>
              </li>
            ))}
          </ul>
        )}
      </WorkspaceCard>
    </section>
  );
}

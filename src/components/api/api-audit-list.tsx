import { ApiSection } from "@/components/api/api-section";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type AuditRow = {
  id: string | number;
  action: string | null;
  status: string | number | null;
  summary: string | null;
  path: string | null;
  created_at: string;
};

type Props = {
  rows: AuditRow[];
};

export function ApiAuditList({ rows }: Props) {
  return (
    <ApiSection
      title="Activity"
      description="Last 50 calls made with your keys."
    >
      <WorkspaceCard padded={false}>
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center sm:px-6">
            <p className="text-[14px] font-medium text-ink">No activity yet</p>
            <p className="mx-auto mt-1 max-w-xs text-[12px] leading-relaxed text-muted">
              When an agent uses a key, calls show up here.
            </p>
          </div>
        ) : (
          <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
            {rows.map((row) => (
              <li
                key={String(row.id)}
                className="grid gap-0.5 px-5 py-3 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4 sm:px-6"
              >
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {String(row.action ?? "—")}
                    {row.status != null ? (
                      <span className="ml-2 font-normal text-plus">
                        {String(row.status)}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-muted">
                    {String(row.summary || row.path || "—")}
                  </p>
                </div>
                <time className="text-[11px] tabular-nums text-plus">
                  {new Date(row.created_at).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </WorkspaceCard>
    </ApiSection>
  );
}

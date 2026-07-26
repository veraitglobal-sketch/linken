import type { WebhookDeliveryRow } from "@/features/webhooks/types";

type Props = { rows: WebhookDeliveryRow[] };

export function ApiWebhookDeliveries({ rows }: Props) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-6">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-muted uppercase">
        Recent deliveries
      </p>
      <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-[12px]"
          >
            <span className="font-mono text-ink">{row.event_type}</span>
            <span
              className={
                row.status === "success"
                  ? "font-semibold text-[#1a5c51]"
                  : row.status === "failed"
                    ? "font-semibold text-ember"
                    : "text-muted"
              }
            >
              {row.status}
              {row.last_status_code != null ? ` · ${row.last_status_code}` : ""}
            </span>
            <span className="w-full text-muted">
              {new Date(row.created_at).toLocaleString()}
              {row.last_error ? ` · ${row.last_error}` : ""}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

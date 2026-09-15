import type { ReactNode } from "react";
import {
  IntegrationMark,
  type IntegrationMarkName,
} from "@/components/integrations/integration-mark";
import { cn } from "@/lib/cn";

/**
 * One connectable thing as an app-directory row: the provider's own mark,
 * name, what connecting it does, status and one action.
 *
 * The marks are the providers' own SVGs from `public/logos/integrations`,
 * inlined by `IntegrationMark` — never our approximation of their logo.
 */

type Props = {
  mark: IntegrationMarkName;
  name: string;
  /** One line. What connecting it actually does for them. */
  purpose: string;
  connected?: boolean;
  /** Shown under the purpose when connected — the account, workspace or link. */
  detail?: ReactNode;
  /** Connect / disconnect control. */
  action: ReactNode;
  /** Why it cannot be connected here — shown instead of a dead button. */
  blockedReason?: string;
};

export function IntegrationCard({
  mark,
  name,
  purpose,
  connected = false,
  detail,
  action,
  blockedReason,
}: Props) {
  return (
    <section
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-2xl bg-surface p-4 sm:flex-nowrap sm:p-5",
        connected ? "ring-1 ring-navy/25 shadow-[0_10px_24px_-18px_rgba(14,31,28,0.5)]" : "ring-1 ring-line/80",
      )}
    >
      <span
        className={cn(
          "grid size-14 shrink-0 place-items-center rounded-2xl bg-[#fafbf9] ring-1 ring-line",
          blockedReason && !connected && "opacity-45",
        )}
      >
        <IntegrationMark name={mark} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{name}</p>
        <p className="mt-1 text-[13px] leading-snug text-muted">{purpose}</p>
        {detail ? <div className="mt-1.5 min-w-0 truncate text-[13px] font-medium text-ink">{detail}</div> : null}
        {blockedReason && !connected ? (
          <p className="mt-1.5 text-[12.5px] leading-snug text-ink-soft">{blockedReason}</p>
        ) : null}
      </div>

      <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <span
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-semibold",
            connected ? "bg-lime-soft text-navy" : "text-muted ring-1 ring-line",
          )}
        >
          <span className={cn("size-1.5 rounded-full", connected ? "bg-navy" : "bg-line")} />
          {connected ? "Connected" : "Not connected"}
        </span>
        {blockedReason && !connected ? null : action}
      </div>
    </section>
  );
}

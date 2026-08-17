import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * One connectable thing: mark, name, what it does, one action.
 *
 * The page was two full-width sections stacked, each a paragraph of prose with
 * a button at the bottom, so three integrations filled a screen and a half and
 * the thing you came to do was the last thing on each. A card says the same in
 * a glance and three sit in one row.
 *
 * The marks are the providers' own SVGs, already in `public/logos/integrations`
 * and until now unused. Drawing our own approximation of someone else's logo
 * would be both worse design and worse manners.
 */

type Props = {
  logo: string;
  name: string;
  /** One line. What connecting it actually does for them. */
  purpose: string;
  connected?: boolean;
  /** Shown under the name when connected — the account, workspace or link. */
  detail?: ReactNode;
  /** Connect / disconnect control, or a note when the provider is unavailable. */
  action: ReactNode;
  /** Greyed with a reason rather than a dead button. */
  blockedReason?: string;
};

export function IntegrationCard({
  logo,
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
        "flex flex-col items-center rounded-2xl border bg-surface px-5 py-6 text-center",
        connected ? "border-ink/25" : "border-line",
      )}
    >
      <span
        className={cn(
          "grid h-12 w-12 place-items-center rounded-xl border border-line bg-paper",
          blockedReason && "opacity-40",
        )}
      >
        <Image src={logo} alt="" width={26} height={26} aria-hidden />
      </span>

      <p className="mt-3 text-[14px] font-semibold tracking-[-0.01em] text-ink">
        {name}
      </p>
      <p className="mt-1 max-w-[24ch] text-[12.5px] leading-snug text-muted">
        {purpose}
      </p>

      {connected ? (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] text-[#1f7a56] uppercase">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[#1f7a56]" />
          Connected
        </p>
      ) : null}

      {detail ? (
        <div className="mt-2 w-full text-[12px] break-words text-muted">
          {detail}
        </div>
      ) : null}

      {/* `mt-auto` so the actions line up across the row however long the
          purpose lines wrap — three cards of different text heights otherwise
          put three buttons at three different heights. */}
      <div className="mt-auto w-full pt-4">
        {blockedReason ? (
          <p className="text-[12px] leading-snug text-muted">{blockedReason}</p>
        ) : (
          action
        )}
      </div>
    </section>
  );
}

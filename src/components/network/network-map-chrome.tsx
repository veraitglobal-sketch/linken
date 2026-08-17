"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { OwnerLoopBar } from "@/components/product/owner-loop-bar";
import { cn } from "@/lib/cn";

type ConnectMode = "structure" | "co_owner";

type Props = {
  title?: string;
  counts?: string[];
  editable: boolean;
  mode: ConnectMode;
  onMode: (mode: ConnectMode) => void;
  onReset: () => void;
  onAdd: () => void;
  /** When set, Add opens Company partner flow instead of map create. */
  addHref?: string | null;
  pendingInviteCount: number;
  /** When set, Company / Map / Inbox sit in the same toolbar (dashboard map). */
  companySlug?: string;
  /** Structure modes only apply in a group map. */
  showStructureTools?: boolean;
};

const BAR = "border border-line bg-surface shadow-card";

/**
 * Single floating toolbar: nav chips, map context, and edit tools in one row.
 */
export function NetworkMapChrome({
  title = "Network",
  counts = [],
  editable,
  mode,
  onMode,
  onReset,
  onAdd,
  addHref = null,
  pendingInviteCount,
  companySlug,
  showStructureTools = false,
}: Props) {
  const subtitle =
    counts.length > 0
      ? counts.join(" · ")
      : "Confirmed partners appear automatically";

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-3 sm:p-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-2 gap-y-2 rounded-card px-2 py-2 sm:gap-x-3 sm:px-3",
          BAR,
        )}
      >
        {companySlug ? (
          <>
            <OwnerLoopBar
              companySlug={companySlug}
              active="map"
              overlay
            />
            <span
              className="hidden h-7 w-px shrink-0 bg-line/80 sm:block"
              aria-hidden
            />
          </>
        ) : null}

        <div className="flex min-w-0 flex-1 basis-[10rem] items-center gap-2 px-1 sm:basis-auto">
          <div className="min-w-0">
            <p className="font-display truncate text-[15px] font-medium tracking-[-0.03em] text-ink">
              {title}
            </p>
            <p className="mt-0.5 truncate text-[10px] text-muted">{subtitle}</p>
          </div>
          {pendingInviteCount > 0 ? (
            <Link
              href="/dashboard/partners"
              className="shrink-0 rounded-full bg-ember/12 px-2 py-0.5 text-[10px] font-semibold text-ember"
            >
              +{pendingInviteCount}
            </Link>
          ) : null}
        </div>

        {editable ? (
          <>
            <span
              className="hidden h-7 w-px shrink-0 bg-line/80 sm:block"
              aria-hidden
            />
            <div className="flex w-full shrink-0 flex-wrap items-center gap-0.5 sm:ml-auto sm:w-auto">
              {showStructureTools ? (
                <>
                  <ModeButton
                    active={mode === "structure"}
                    onClick={() => onMode("structure")}
                    title="Drag parent → child"
                  >
                    Ownership
                  </ModeButton>
                  <ModeButton
                    active={mode === "co_owner"}
                    onClick={() => onMode("co_owner")}
                    title="Propose shared ownership — the other side must confirm"
                  >
                    Shared
                  </ModeButton>
                  <span className="mx-1 h-3.5 w-px bg-line" aria-hidden />
                </>
              ) : null}
              <button
                type="button"
                onClick={onReset}
                className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted transition-colors hover:text-ink"
                title="Reset layout"
              >
                Reset
              </button>
              {addHref ? (
                <Link
                  href={addHref}
                  className="ml-0.5 inline-flex h-8 items-center rounded-xl bg-navy px-3 text-[11px] font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Add partners
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onAdd}
                  className="ml-0.5 inline-flex h-8 items-center rounded-xl bg-navy px-3 text-[11px] font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Add
                </button>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-xl px-2.5 py-1.5 text-[11px] font-semibold transition-colors",
        active
          ? "bg-navy text-white"
          : "text-muted hover:bg-paper hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

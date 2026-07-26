"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import type { LogoMotion, LogoSize } from "@/features/widgets/logo-motion";
import { LogoWallStudioRow } from "@/components/widgets/logo-wall-studio-row";
import { LogoWallBackgroundPicker } from "@/components/widgets/logo-wall-background-picker";
import { LogoWallLayoutControls } from "@/components/widgets/logo-wall-layout-controls";
import { saveLogoWallOrder } from "@/features/widgets/logo-wall-studio-actions";

type Props = {
  entries: LogoWallEntry[];
  background: string;
  limit: number;
  motion: LogoMotion;
  size: LogoSize;
};

export function LogoWallStudio(props: Props) {
  return (
    <LogoWallStudioInner
      key={studioKey(props)}
      {...props}
    />
  );
}

function studioKey(p: Props) {
  return [
    p.background,
    p.limit,
    p.motion,
    p.size,
    ...p.entries.map(
      (e) =>
        `${e.id}:${e.included ? 1 : 0}:${e.belowCut ? 1 : 0}:${e.logoState}:${e.logoUrl ?? ""}`,
    ),
  ].join("|");
}

function LogoWallStudioInner({
  entries: initial,
  background,
  limit,
  motion,
  size,
}: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);
  const includedCount = rows.filter((r) => r.included).length;

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const next = [...rows];
    const from = next.findIndex((r) => r.id === dragId);
    const to = next.findIndex((r) => r.id === targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item!);
    setRows(next);
    setDragId(null);
    startTransition(async () => {
      await saveLogoWallOrder(next.map((r) => r.id));
      router.refresh();
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          Logo wall studio
        </p>
        <p className="mt-1 max-w-2xl text-[13px] text-muted">
          Every confirmed partner and client is on by default — uncheck to hide.
          New confirmations appear automatically. Paste the embed once; manage
          everything here.
        </p>
        <div className="mt-3">
          <LogoWallBackgroundPicker background={background} />
        </div>
        <LogoWallLayoutControls
          limit={limit}
          motion={motion}
          size={size}
          includedCount={includedCount}
        />
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-[13px] text-muted">
          No confirmed partners or clients yet. Confirm a partnership or client
          reference to build the wall.
        </p>
      ) : (
        <ul className={`divide-y divide-line ${pending ? "opacity-70" : ""}`}>
          {rows.map((entry) => (
            <LogoWallStudioRow
              key={entry.id}
              entry={entry}
              onDragStart={() => onDragStart(entry.id)}
              onDrop={() => onDrop(entry.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

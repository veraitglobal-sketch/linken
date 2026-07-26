"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { LogoWallStudioRow } from "@/components/widgets/logo-wall-studio-row";
import { LogoWallBackgroundPicker } from "@/components/widgets/logo-wall-background-picker";
import { saveLogoWallOrder } from "@/features/widgets/logo-wall-studio-actions";

type Props = {
  entries: LogoWallEntry[];
  background: string;
};

export function LogoWallStudio({ entries, background }: Props) {
  return (
    <LogoWallStudioInner
      key={studioKey(entries, background)}
      entries={entries}
      background={background}
    />
  );
}

function studioKey(entries: LogoWallEntry[], background: string) {
  return [
    background,
    ...entries.map(
      (e) =>
        `${e.id}:${e.included ? 1 : 0}:${e.logoState}:${e.logoUrl ?? ""}:${e.scale}:${e.padding}`,
    ),
  ].join("|");
}

function LogoWallStudioInner({ entries: initial, background }: Props) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [dragId, setDragId] = useState<string | null>(null);

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
          Curate which confirmed partners and clients appear on your embed.
          Paste the snippet once — everything else is managed here.
          Transparent background sits on any coloured section of the customer
          site.
        </p>
        <div className="mt-3">
          <LogoWallBackgroundPicker background={background} />
        </div>
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

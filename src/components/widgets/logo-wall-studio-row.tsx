"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { toggleLogoWallIncluded } from "@/features/widgets/logo-wall-studio-actions";
import { LogoWallStateBadge } from "@/components/widgets/logo-wall-state-badge";
import { LogoWallRowActions } from "@/components/widgets/logo-wall-row-actions";
import { LogoTile } from "@/components/ui/logo-tile";

type Props = {
  entry: LogoWallEntry;
  onDragStart: () => void;
  onDrop: () => void;
};

export function LogoWallStudioRow({ entry, onDragStart, onDrop }: Props) {
  const router = useRouter();
  const [included, setIncluded] = useState(entry.included);
  const [, startTransition] = useTransition();

  function onToggle() {
    const next = !included;
    setIncluded(next);
    startTransition(async () => {
      await toggleLogoWallIncluded(entry.id, next);
      router.refresh();
    });
  }

  return (
    <li
      className="flex flex-wrap items-center gap-3 px-4 py-3 sm:px-5"
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <button
        type="button"
        className="cursor-grab text-[12px] text-plus active:cursor-grabbing"
        aria-label="Drag to reorder"
        tabIndex={-1}
      >
        ⋮⋮
      </button>
      <input
        type="checkbox"
        checked={included}
        onChange={onToggle}
        aria-label={`Include ${entry.name}`}
      />
      <LogoTile
        name={entry.name}
        initials={entry.initials}
        logoUrl={entry.showLogo ? entry.logoUrl : null}
        website={entry.website}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-ink">{entry.name}</p>
        <p className="truncate text-[11px] text-muted">
          {entry.website?.trim() || "No website"} · {entry.kind}
        </p>
      </div>
      <LogoWallStateBadge state={entry.logoState} />
      <LogoWallRowActions entry={entry} />
    </li>
  );
}

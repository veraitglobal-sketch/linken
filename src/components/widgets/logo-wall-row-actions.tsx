"use client";

import { useState } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { LogoWallRefetchPanel } from "@/components/widgets/logo-wall-refetch-panel";
import { LogoWallUploadPanel } from "@/components/widgets/logo-wall-upload-panel";
import { LogoWallAdjustPanel } from "@/components/widgets/logo-wall-adjust-panel";
import { LogoWallWebsiteEdit } from "@/components/widgets/logo-wall-website-edit";

type Panel = "refetch" | "upload" | "adjust" | "website" | null;

export function LogoWallRowActions({ entry }: { entry: LogoWallEntry }) {
  const [panel, setPanel] = useState<Panel>(null);

  return (
    <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
      <div className="flex flex-wrap items-center gap-1.5">
        <ActionBtn label="Website" onClick={() => setPanel("website")} />
        <ActionBtn label="Re-fetch" onClick={() => setPanel("refetch")} />
        <ActionBtn label="Upload" onClick={() => setPanel("upload")} />
        <ActionBtn label="Adjust" onClick={() => setPanel("adjust")} />
      </div>
      {panel === "website" ? (
        <LogoWallWebsiteEdit
          entry={entry}
          onClose={() => setPanel(null)}
        />
      ) : null}
      {panel === "refetch" ? (
        <LogoWallRefetchPanel entry={entry} onClose={() => setPanel(null)} />
      ) : null}
      {panel === "upload" ? (
        <LogoWallUploadPanel entry={entry} onClose={() => setPanel(null)} />
      ) : null}
      {panel === "adjust" ? (
        <LogoWallAdjustPanel entry={entry} onClose={() => setPanel(null)} />
      ) : null}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-line bg-paper px-2 py-1 text-[10px] font-semibold text-ink hover:bg-surface"
    >
      {label}
    </button>
  );
}

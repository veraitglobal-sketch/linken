"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { uploadWallOverrideLogo } from "@/features/widgets/logo-wall-media-actions";
import { clearLogoWallOverride } from "@/features/widgets/logo-wall-studio-actions";
import { Button } from "@/components/ui/button";

type Props = {
  entry: LogoWallEntry;
  onClose: () => void;
};

export function LogoWallUploadPanel({ entry, onClose }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onFile(file: File | null) {
    if (!file) return;
    setError(null);
    const fd = new FormData();
    fd.set("file", file);
    startTransition(async () => {
      const res = await uploadWallOverrideLogo(entry.id, fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  function clear() {
    startTransition(async () => {
      await clearLogoWallOverride(entry.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="w-full rounded-xl border border-line bg-paper p-3 sm:min-w-[280px]">
      <p className="text-[11px] font-semibold text-ink">Upload replacement</p>
      <p className="mt-1 text-[11px] text-muted">
        PNG, SVG, or WebP. Overrides profile and auto logos on your wall only.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/webp,image/svg+xml"
        className="mt-2 block w-full text-[11px]"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {error ? <p className="mt-1 text-[11px] text-ember">{error}</p> : null}
      <div className="mt-2 flex flex-wrap gap-2">
        {entry.logoState === "custom" ? (
          <Button
            type="button"
            variant="secondary"
            className="h-8 text-[11px]"
            disabled={pending}
            onClick={clear}
          >
            Clear override
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          className="h-8 text-[11px]"
          onClick={onClose}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { updatePartnerWebsiteForWall } from "@/features/widgets/logo-wall-media-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  entry: LogoWallEntry;
  onClose: () => void;
};

export function LogoWallWebsiteEdit({ entry, onClose }: Props) {
  const router = useRouter();
  const [website, setWebsite] = useState(entry.website ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await updatePartnerWebsiteForWall(entry.id, website);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="w-full rounded-xl border border-line bg-paper p-3 sm:min-w-[280px]">
      <p className="text-[11px] font-semibold text-ink">Website for discovery</p>
      <Input
        className="mt-2"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="https://example.com"
      />
      {error ? <p className="mt-1 text-[11px] text-ember">{error}</p> : null}
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          className="h-8 text-[11px]"
          disabled={pending}
          onClick={save}
        >
          Save
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="h-8 text-[11px]"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

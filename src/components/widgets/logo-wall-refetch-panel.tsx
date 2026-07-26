"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import {
  applyWallLogoCandidate,
  discoverWallLogoCandidates,
} from "@/features/widgets/logo-wall-media-actions";
import { Button } from "@/components/ui/button";

type Props = {
  entry: LogoWallEntry;
  onClose: () => void;
};

export function LogoWallRefetchPanel({ entry, onClose }: Props) {
  const router = useRouter();
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function discover() {
    setError(null);
    startTransition(async () => {
      const res = await discoverWallLogoCandidates(entry.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCandidates(res.candidates);
    });
  }

  function pick(url: string) {
    setError(null);
    startTransition(async () => {
      const res = await applyWallLogoCandidate(entry.id, url);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="w-full rounded-xl border border-line bg-paper p-3 sm:min-w-[300px]">
      <p className="text-[11px] font-semibold text-ink">Re-fetch logo</p>
      <p className="mt-1 text-[11px] text-muted">
        Candidates are ordered: JSON-LD → apple-touch → manifest → og:image →
        favicon last.
      </p>
      {candidates === null ? (
        <Button
          type="button"
          className="mt-2 h-8 text-[11px]"
          disabled={pending}
          onClick={discover}
        >
          Find candidates
        </Button>
      ) : candidates.length === 0 ? (
        <p className="mt-2 text-[11px] text-ember">No candidates found.</p>
      ) : (
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {candidates.map((url) => (
            <li key={url}>
              <button
                type="button"
                disabled={pending}
                onClick={() => pick(url)}
                className="flex w-full items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-left hover:bg-paper"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-6 w-6 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
                <span className="min-w-0 flex-1 truncate text-[10px] text-muted">
                  {url}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="mt-1 text-[11px] text-ember">{error}</p> : null}
      <Button
        type="button"
        variant="ghost"
        className="mt-2 h-8 text-[11px]"
        onClick={onClose}
      >
        Close
      </Button>
    </div>
  );
}

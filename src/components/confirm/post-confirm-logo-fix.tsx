"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LogoTile } from "@/components/ui/logo-tile";
import {
  applyConfirmLogoCandidate,
  discoverConfirmLogoCandidates,
  uploadConfirmProfileLogo,
} from "@/features/confirm/logo-actions";
import type { PostConfirmKind } from "@/features/confirm/post-confirm-subject";

type Props = {
  kind: PostConfirmKind;
  token: string;
  name: string;
  initials: string;
  logoUrl: string | null;
  website: string | null;
  domain: string | null;
};

/** Sets the company's PROFILE logo — never a wall override. */
export function PostConfirmLogoFix({
  kind,
  token,
  name,
  initials,
  logoUrl: initialUrl,
  website,
  domain,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(initialUrl);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function onUpload(file: File | null) {
    if (!file) return;
    const fd = new FormData();
    fd.set("kind", kind);
    fd.set("token", token);
    fd.set("file", file);
    start(async () => {
      setError(null);
      const res = await uploadConfirmProfileLogo(fd);
      if (!res.ok) {
        setError(res.error ?? "Upload failed.");
        return;
      }
      setLogoUrl(res.logoUrl ?? null);
      setOpen(false);
      router.refresh();
    });
  }

  function onDiscover() {
    start(async () => {
      setError(null);
      const res = await discoverConfirmLogoCandidates({ kind, token });
      if (!res.ok) {
        setError(res.error ?? "Could not find logos.");
        return;
      }
      setCandidates(res.candidates ?? []);
    });
  }

  function onPick(url: string) {
    start(async () => {
      setError(null);
      const res = await applyConfirmLogoCandidate({
        kind,
        token,
        candidateUrl: url,
      });
      if (!res.ok) {
        setError(res.error ?? "Could not apply logo.");
        return;
      }
      setLogoUrl(res.logoUrl ?? null);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[20px] border border-line bg-paper/60 px-4 py-4">
      <div className="flex items-center gap-3">
        <LogoTile
          name={name}
          initials={initials}
          logoUrl={logoUrl}
          website={null}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-ink">{name}</p>
          <p className="truncate text-[12px] text-muted">
            {domain || website || "No website on file"}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
      >
        {open ? "Close" : "Not right? Replace it"}
      </button>
      {open ? (
        <div className="mt-3 space-y-3 border-t border-line pt-3">
          <p className="text-[12px] leading-relaxed text-ink-soft">
            This updates your company profile logo — the default on every wall
            that has not set its own replacement. It does not change curated
            overrides on other firms&apos; sites.
          </p>
          <label className="block">
            <span className="text-[11px] font-semibold text-ink">Upload</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
              className="mt-1 block w-full text-[12px]"
              disabled={pending}
              onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
            />
          </label>
          {website ? (
            <button
              type="button"
              disabled={pending}
              onClick={onDiscover}
              className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline disabled:opacity-50"
            >
              Find logos on your website
            </button>
          ) : null}
          {candidates.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {candidates.map((url) => (
                <li key={url}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onPick(url)}
                    className="rounded-lg border border-line bg-surface p-1.5 hover:border-ink/25"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-10 w-10 object-contain"
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {error ? (
            <p className="text-[12px] text-ember">{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

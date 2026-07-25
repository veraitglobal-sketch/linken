"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CompanyLogoUploadForm } from "@/components/company/company-logo-upload-form";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Badge } from "@/components/ui/badge";
import { LogoMark } from "@/components/ui/logo-mark";
import {
  clearCompanyLogo,
  ensureCompanyLogoFromWebsite,
  refreshLogo,
} from "@/features/logo/actions";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  logoUrl?: string | null;
  website?: string | null;
  logoSource?: string | null;
  initials: string;
  backPath?: string;
};

/** Auto favicon from website; clear with ×; upload a custom mark in place. */
export function CompanySettingsLogo({
  name,
  logoUrl,
  website,
  logoSource,
  initials,
  backPath = "/dashboard/settings",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const tried = useRef(false);
  const hasWebsite = Boolean(website?.trim());
  const cleared = logoSource === "cleared";
  const isManual = logoSource === "manual";
  const showLogo = Boolean(logoUrl) && !cleared;
  /** Never fall back to website favicon after the owner cleared the logo. */
  const markWebsite = cleared ? null : website;

  useEffect(() => {
    if (tried.current) return;
    if (!hasWebsite || showLogo || cleared || isManual) return;
    tried.current = true;
    startTransition(async () => {
      const result = await ensureCompanyLogoFromWebsite();
      if (result.ok) {
        router.refresh();
        return;
      }
      setStatus(result.error ?? "Could not fetch logo.");
    });
  }, [cleared, hasWebsite, isManual, router, showLogo]);

  const stateLabel = isManual
    ? "Uploaded"
    : showLogo
      ? "From website"
      : cleared
        ? "Removed"
        : pending
          ? "Fetching…"
          : hasWebsite
            ? "No logo yet"
            : "Needs website";

  function onClear() {
    setStatus(null);
    startTransition(async () => {
      const result = await clearCompanyLogo();
      if (!result.ok) {
        setStatus(result.error ?? "Could not remove logo.");
        return;
      }
      setStatus("Logo removed. Upload a new one below.");
      router.refresh();
    });
  }

  return (
    <WorkspaceCard padded={false}>
      <div
        id="company-logo"
        className="scroll-mt-24 flex flex-wrap items-start justify-between gap-3 border-b border-line bg-paper/70 px-5 py-4 sm:px-6"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
            Brand
          </p>
          <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
            Company logo
          </h2>
          <p className="mt-1 max-w-lg text-[12px] leading-relaxed text-muted">
            Loaded from your website. Remove with ×, or upload your own logo.
          </p>
        </div>
        <Badge tone={showLogo ? "success" : "neutral"}>{stateLabel}</Badge>
      </div>

      <div className="flex flex-wrap items-start gap-5 px-5 py-5 sm:px-6">
        <div className="relative shrink-0">
          <LogoMark
            initials={initials}
            logoUrl={showLogo ? logoUrl : null}
            website={markWebsite}
            size="lg"
            className="rounded-2xl ring-1 ring-line"
          />
          {showLogo ? (
            <button
              type="button"
              title="Remove logo"
              aria-label="Remove logo"
              disabled={pending}
              onClick={onClear}
              className={cn(
                "absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center",
                "rounded-full border border-line bg-surface text-ink shadow-sm",
                "transition-colors hover:bg-paper disabled:opacity-50",
              )}
            >
              <span aria-hidden className="text-[14px] leading-none">
                ×
              </span>
            </button>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-3 pt-0.5">
          <p className="text-[13px] font-semibold tracking-[-0.02em] text-ink">
            {name}
          </p>
          <p className="text-[12px] leading-relaxed text-muted">
            {showLogo
              ? isManual
                ? "Custom logo is live on your profile and widgets."
                : "Logo is live on your public profile and widgets."
              : cleared
                ? "Logo removed. Upload a new one, or restore from the website."
                : pending
                  ? "Fetching logo from your website…"
                  : hasWebsite
                    ? "Waiting for a logo from your website — or upload one."
                    : "Add a website to auto-load a favicon, or upload a logo."}
          </p>
          {status ? <p className="text-[12px] text-ink-soft">{status}</p> : null}
          <CompanyLogoUploadForm
            onDone={(msg) => setStatus(msg)}
            onError={(msg) => setStatus(msg)}
          />
          {hasWebsite && !isManual && (cleared || !showLogo) && !pending ? (
            <form action={refreshLogo}>
              <input type="hidden" name="back" value={`${backPath}#company-logo`} />
              <button
                type="submit"
                className="text-[12px] font-semibold text-blue underline-offset-2 hover:underline"
              >
                {cleared ? "Restore from website" : "Try again"}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </WorkspaceCard>
  );
}

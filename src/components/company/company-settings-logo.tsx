"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { LogoMark } from "@/components/ui/logo-mark";
import { uploadCompanyLogo } from "@/features/company/profile-actions";
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

/** Website favicon by default; × clears; upload replaces. */
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
  const [error, setError] = useState<string | null>(null);
  const tried = useRef(false);
  const hasWebsite = Boolean(website?.trim());
  const cleared = logoSource === "cleared";
  const isManual = logoSource === "manual";
  const showLogo = Boolean(logoUrl) && !cleared;

  useEffect(() => {
    if (tried.current) return;
    if (!hasWebsite || showLogo || cleared || isManual) return;
    tried.current = true;
    startTransition(async () => {
      const result = await ensureCompanyLogoFromWebsite();
      if (result.ok) router.refresh();
      else setError(result.error ?? "Could not fetch logo.");
    });
  }, [cleared, hasWebsite, isManual, router, showLogo]);

  function run(action: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <WorkspaceCard padded={false}>
      <div
        id="company-logo"
        className="scroll-mt-24 border-b border-line bg-paper/70 px-5 py-4 sm:px-6"
      >
        <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          Brand
        </p>
        <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Company logo
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-5 py-5 sm:px-6">
        <div className="relative shrink-0">
          <LogoMark
            initials={initials}
            logoUrl={showLogo ? logoUrl : null}
            website={cleared ? null : website}
            size="lg"
            className="rounded-2xl ring-1 ring-line"
          />
          {showLogo ? (
            <button
              type="button"
              title="Remove"
              aria-label="Remove logo"
              disabled={pending}
              onClick={() => run(clearCompanyLogo)}
              className={cn(
                "absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full",
                "border border-line bg-surface text-ink shadow-sm hover:bg-paper disabled:opacity-50",
              )}
            >
              <span aria-hidden>×</span>
            </button>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[13px] font-semibold text-ink">{name}</p>
          <form
            className="flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              run(async () => {
                const result = await uploadCompanyLogo(data);
                if (result.ok) form.reset();
                return result;
              });
            }}
          >
            <input
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              required
              disabled={pending}
              className="max-w-[14rem] text-[12px] text-muted file:mr-2 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-1.5 file:text-[12px] file:font-semibold file:text-ink"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-9 rounded-lg border border-line bg-surface px-3 text-[12px] font-semibold text-ink hover:bg-paper disabled:opacity-50"
            >
              Upload
            </button>
          </form>
          {hasWebsite && !isManual && (cleared || !showLogo) ? (
            <form action={refreshLogo}>
              <input type="hidden" name="back" value={`${backPath}#company-logo`} />
              <button
                type="submit"
                className="text-[12px] font-semibold text-blue underline-offset-2 hover:underline"
              >
                Use website favicon
              </button>
            </form>
          ) : null}
          {error ? <p className="text-[12px] text-ember">{error}</p> : null}
        </div>
      </div>
    </WorkspaceCard>
  );
}

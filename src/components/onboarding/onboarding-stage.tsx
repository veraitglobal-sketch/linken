import Image from "next/image";
import type { OnboardingPreviewValues } from "@/components/onboarding/onboarding-workspace";
import { COMPANY_SHARE_PREFIX } from "@/lib/site";
import { toSlug } from "@/lib/slug";

type Props = {
  partnerMode?: boolean;
  preview: OnboardingPreviewValues;
};

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function domainOf(website: string) {
  const raw = website.trim();
  if (!raw) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.hostname.replace(/^www\./, "").includes(".")
      ? url.hostname.replace(/^www\./, "")
      : "";
  } catch {
    return "";
  }
}

function Ghost({ className }: { className: string }) {
  return <span className={`block rounded-full bg-line ${className}`} aria-hidden />;
}

export function OnboardingStage({ partnerMode = false, preview }: Props) {
  const name = preview.name.trim();
  const initials = initialsOf(name);
  const domain = domainOf(preview.website);
  const meta = [preview.category.trim(), preview.city.trim()].filter(Boolean).join(" · ");
  const slug = toSlug(name);

  return (
    <div className="relative order-last flex min-h-[520px] flex-col justify-between overflow-hidden bg-navy px-6 py-8 text-on-navy sm:px-10 sm:py-10 lg:order-first lg:min-h-full">
      <Image
        src="/images/offer-studio.webp"
        alt=""
        fill
        quality={75}
        sizes="(max-width: 1024px) 100vw, 560px"
        className="object-cover object-[72%_50%]"
      />
      <div className="pointer-events-none absolute inset-0 bg-navy-deep/70" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(8,20,18,0.35)_0%,rgba(8,20,18,0)_40%,rgba(8,20,18,0.55)_100%)]"
        aria-hidden
      />

      <div className="relative">
        <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
          {partnerMode ? "Developer partner" : "Your public page"}
        </p>
        <p className="mt-5 max-w-[16ch] font-display text-[clamp(2rem,3.4vw,2.9rem)] leading-[1.02] font-medium tracking-[-0.04em] text-balance">
          {partnerMode ? "Join the partner program." : "This is what clients will open."}
        </p>
        <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-on-navy-soft">
          {partnerMode
            ? "Earn 10% of paid Pro invoices from companies you refer. Accrued only when they pay — never from confirmations."
            : "It fills in as you type. Partners and their words join it only after both sides confirm."}
        </p>
      </div>

      <div
        className="relative mt-10 rounded-card bg-surface p-5 text-ink shadow-hero sm:p-6"
        aria-label="Profile preview"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-tile bg-navy font-display text-[15px] font-medium tracking-[-0.02em] text-on-navy">
            {initials || <span className="h-1.5 w-1.5 rounded-full bg-blue-soft" aria-hidden />}
          </div>
          <div className="min-w-0 flex-1">
            {name ? (
              <p className="truncate font-display text-[19px] font-medium tracking-[-0.03em]">{name}</p>
            ) : (
              <Ghost className="h-3.5 w-40" />
            )}
            <div className="mt-2">
              {meta ? (
                <p className="truncate text-[13px] text-muted">{meta}</p>
              ) : (
                <Ghost className="h-2.5 w-28" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-2 border-t border-line pt-4 text-[13px]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted">Website</span>
            {domain ? (
              <span className="truncate font-medium text-ink">{domain}</span>
            ) : (
              <Ghost className="h-2.5 w-24" />
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted">Link</span>
            <span className="truncate font-medium text-ink">
              {COMPANY_SHARE_PREFIX}/
              <span className={slug ? "text-blue" : "text-muted"}>{slug || "…"}</span>
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-8 w-8 rounded-lg border border-dashed border-line" />
            ))}
          </div>
          <p className="mt-2.5 text-[12.5px] leading-relaxed text-muted">
            Partners appear here once both sides confirm.
          </p>
        </div>
      </div>
    </div>
  );
}

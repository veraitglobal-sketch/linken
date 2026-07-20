import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function StructureStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3.5 py-3.5 shadow-[0_1px_0_rgba(8,20,18,0.03)]">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
        {label}
      </p>
      <p className="mt-1.5 font-display text-[24px] font-semibold tracking-[-0.04em] text-ink">
        {value}
      </p>
    </div>
  );
}

export function StructureFlash({
  children,
  tone = "ok",
}: {
  children: ReactNode;
  tone?: "ok" | "error";
}) {
  return (
    <p
      className={cn(
        "rounded-2xl border px-4 py-3 text-[13px]",
        tone === "error"
          ? "border-ember/30 bg-ember/10 font-medium text-ink"
          : "border-line bg-surface text-ink",
      )}
    >
      {children}
    </p>
  );
}

export function StructureSectionHead({
  eyebrow,
  title,
  description,
  action,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  tone?: "light" | "soft";
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6",
        tone === "soft" ? "bg-paper/70" : "bg-surface",
      )}
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-plus uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-1 font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-md text-[12px] leading-relaxed text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

import type { WidgetVariant } from "@/features/widgets/catalog";
import { cn } from "@/lib/cn";

const COPY: Partial<Record<WidgetVariant, string>> = {
  verified: "Ready once your profile is claimed.",
  compact: "Ready with your company name.",
  "proof-panel": "Confirm a partner or client to unlock.",
  "trust-card": "Build confirmed evidence to show level.",
  "network-card": "Confirm relationships to show the network.",
  credentials: "Ready once your profile is claimed.",
  signature: "Ready once your profile is claimed.",
  badge: "Ready with your company name.",
  references: "Confirm a client reference to unlock.",
  assessment: "Needs 3+ client assessment answers.",
  "logo-wall": "Confirm a partner or client to unlock.",
};

type Props = {
  variant: WidgetVariant;
  className?: string;
};

export function WidgetZeroState({ variant, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center px-6 text-center",
        className,
      )}
    >
      <span className="inline-flex h-7 items-center rounded-full border border-line bg-surface px-2.5 text-[11px] font-semibold text-ink">
        Not ready
      </span>
      <p className="mt-2.5 max-w-[14rem] text-[12px] leading-snug text-muted">
        {COPY[variant] ?? "Not ready yet."}
      </p>
    </div>
  );
}

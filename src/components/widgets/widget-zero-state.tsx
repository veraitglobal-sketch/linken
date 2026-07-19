import type { WidgetVariant } from "@/features/widgets/catalog";
import { cn } from "@/lib/cn";

const COPY: Record<
  WidgetVariant,
  { title: string; body: string }
> = {
  compact: {
    title: "Always available",
    body: "Compact works with your company name alone.",
  },
  badge: {
    title: "Always available",
    body: "Badge shows verified counts when you have them.",
  },
  references: {
    title: "Not available yet",
    body: "Visitors would see a quiet fallback until you have a confirmed client reference.",
  },
  assessment: {
    title: "Not available yet",
    body: "Needs ≥3 client assessment answers before this widget appears on your site.",
  },
  "logo-wall": {
    title: "Not available yet",
    body: "Confirm your first partnership or client — only verified firms appear on the wall.",
  },
};

type Props = {
  variant: WidgetVariant;
  height: number;
  className?: string;
};

/** What a visitor would see / why the widget isn’t ready — gallery 0-state. */
export function WidgetZeroState({ variant, height, className }: Props) {
  const copy = COPY[variant];
  return (
    <div
      className={cn(
        "flex w-full flex-col items-start justify-center rounded-2xl border border-dashed border-[#c5ccd6] bg-white px-4",
        className,
      )}
      style={{ minHeight: height }}
    >
      <p className="text-[11px] font-semibold tracking-[0.1em] text-[#94a3b8] uppercase">
        {copy.title}
      </p>
      <p className="mt-1.5 text-[12px] leading-relaxed text-[#64748b]">
        {copy.body}
      </p>
    </div>
  );
}

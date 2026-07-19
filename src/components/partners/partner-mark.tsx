import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  className?: string;
};

/** Profile slot for a partner firm — photo or mark. */
export function PartnerMark({ initials, className }: Props) {
  return (
    <div
      className={cn(
        "relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        "bg-[#10231f] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]",
        className,
      )}
      aria-hidden
    >
      <span className="font-display text-base font-medium tracking-[-0.03em]">
        {initials}
      </span>
    </div>
  );
}

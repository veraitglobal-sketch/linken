import { HansalaSpinner } from "@/components/ui/hansala-spinner";
import { cn } from "@/lib/cn";

type Props = {
  label?: string;
  className?: string;
  /** Compact for panels; default fills a short page section. */
  compact?: boolean;
};

/** Centred Hansala confirmation spinner for route and panel waits. */
export function LoadingState({
  label = "Loading…",
  className,
  compact = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        compact ? "min-h-[8rem] py-8" : "min-h-[70vh] py-16",
        className,
      )}
    >
      <HansalaSpinner size={compact ? 40 : 56} label={label} showLabel />
    </div>
  );
}

import { HansalaSpinner } from "@/components/ui/hansala-spinner";
import { cn } from "@/lib/cn";

type Props = {
  label?: string;
  className?: string;
  /** Compact for panels; default fills the viewport. */
  compact?: boolean;
  /** `host` fills the parent (workspace chrome). Default is the viewport. */
  fill?: "viewport" | "host";
};

/** Centred Hansala confirmation spinner for route and panel waits. */
export function LoadingState({
  label = "Loading…",
  className,
  compact = false,
  fill = "viewport",
}: Props) {
  return (
    <div
      className={cn(
        "grid w-full place-items-center",
        compact
          ? "min-h-[8rem] py-8"
          : fill === "host"
            ? "h-full min-h-0"
            : "min-h-dvh",
        className,
      )}
    >
      <HansalaSpinner size={compact ? 40 : 56} label={label} showLabel />
    </div>
  );
}

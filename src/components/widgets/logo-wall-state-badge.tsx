import type { LogoWallLogoState } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

const LABELS: Record<LogoWallLogoState, string> = {
  profile: "profile logo",
  auto: "auto",
  custom: "custom",
  low_quality: "low quality",
  no_logo: "no logo",
  opted_out: "opted out",
};

export function LogoWallStateBadge({ state }: { state: LogoWallLogoState }) {
  const problem =
    state === "low_quality" || state === "no_logo" || state === "opted_out";
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
        problem
          ? "bg-ember/10 text-ember"
          : state === "custom"
            ? "bg-ink/5 text-ink"
            : "bg-paper text-muted",
      )}
    >
      {LABELS[state]}
    </span>
  );
}

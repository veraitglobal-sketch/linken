import { cn } from "@/lib/cn";

type Props = {
  initials: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "h-9 w-9 text-[10px]",
  md: "h-11 w-11 text-[11px]",
  lg: "h-14 w-14 text-xs",
};

export function LogoMark({ initials, size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border border-line bg-paper font-medium tracking-[0.08em] text-ink",
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

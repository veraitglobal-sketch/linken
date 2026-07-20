import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function MetricCard({
  label,
  value,
  suffix,
  children,
  className,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[22px] border border-[#e2e6e3] bg-white/90 p-5",
        "shadow-[0_12px_40px_rgba(8,20,18,0.06)] backdrop-blur-sm",
        className,
      )}
    >
      <p className="text-[12px] font-medium text-[#66706b]">{label}</p>
      <p className="mt-1 font-display text-[1.75rem] font-semibold tracking-[-0.03em] text-ink">
        {value}
        {suffix ? (
          <span className="ml-1 text-[16px] font-semibold text-[#8a948e]">
            {suffix}
          </span>
        ) : null}
      </p>
      <div className="mt-4 h-[180px]">{children}</div>
    </section>
  );
}

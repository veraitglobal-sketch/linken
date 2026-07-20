"use client";

import { cn } from "@/lib/cn";

type Option<T extends string> = { id: T; label: string };

export function WidgetSegmented<T extends string>({
  label,
  value,
  options,
  onChange,
  compact,
}: {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div>
      {label ? (
        <p className="text-[11px] font-semibold tracking-[0.12em] text-plus uppercase">
          {label}
        </p>
      ) : null}
      <div
        className={cn(
          "flex gap-1.5 rounded-xl border border-line bg-paper/60 p-1",
          label && "mt-2",
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={cn(
              "flex-1 rounded-lg font-semibold capitalize transition-colors",
              compact ? "h-8 px-3 text-[11px]" : "h-9 text-[12px]",
              value === opt.id
                ? "bg-surface text-ink shadow-sm"
                : "text-muted hover:text-ink",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

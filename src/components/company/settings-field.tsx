import type { ReactNode } from "react";

export function SettingsField({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
      </span>
      {children}
      {hint}
    </label>
  );
}

export const settingsTextareaClass =
  "min-h-[5.5rem] w-full resize-y rounded-xl border border-line bg-paper px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-muted focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
};

/** Visible label + optional hint/error wired via aria-describedby. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: Props) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("block", className)}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink">
        {label}
        {required ? (
          <span className="text-ember" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      <div
        data-describedby={describedBy}
        className="[&_input]:aria-[invalid=true]:border-ember [&_textarea]:aria-[invalid=true]:border-ember"
      >
        {children}
      </div>
      {hint && !error ? (
        <p id={hintId} className="mt-1.5 text-[12px] text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-[12px] font-medium text-ember">
          {error}
        </p>
      ) : null}
    </div>
  );
}

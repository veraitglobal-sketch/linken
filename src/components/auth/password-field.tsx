"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  forgotHref?: string;
  labelClassName?: string;
};

export function PasswordField({
  label = "Password",
  forgotHref,
  labelClassName,
  className,
  id,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;
  const showLabel = visible ? "Hide password" : "Show password";

  return (
    <div>
      <span className="mb-2 flex items-center justify-between gap-3">
        <label
          htmlFor={inputId}
          className={cn("text-[14px] font-semibold text-ink", labelClassName)}
        >
          {label}
        </label>
        {forgotHref ? (
          <Link
            href={forgotHref}
            className="shrink-0 py-1 text-[13px] font-semibold text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          >
            Forgot password?
          </Link>
        ) : null}
      </span>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          className={cn(
            className ??
              "h-12 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink placeholder:text-muted outline-none transition-colors focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]",
            "!pr-12",
          )}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-ink"
          aria-label={showLabel}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <EyeIcon crossed={visible} />
        </button>
      </div>
    </div>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
      {crossed ? (
        <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

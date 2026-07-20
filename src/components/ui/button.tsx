import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "plus" | "light" | "onDark";

const styles: Record<Variant, string> = {
  primary: "border border-transparent bg-accent hover:bg-accent-hover",
  secondary: "border border-line bg-surface hover:bg-paper",
  ghost: "border border-transparent bg-transparent hover:bg-accent-soft",
  plus: "border border-line bg-paper",
  light: "border border-transparent bg-white hover:bg-[#f2f4f2]",
  onDark:
    "border border-white/28 bg-white/[0.08] hover:border-white/48 hover:bg-white/[0.16]",
};

const textColor: Record<Variant, string> = {
  primary: "#ffffff",
  secondary: "#0d1210",
  ghost: "#3a423e",
  plus: "#66706b",
  light: "#0d1210",
  onDark: "#ffffff",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  href?: string;
  children?: ReactNode;
};

export function Button({
  variant = "primary",
  className,
  href,
  children,
  ...props
}: Props) {
  const color = textColor[variant];
  const style = { color } satisfies CSSProperties;

  const classes = cn(
    "inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl px-5",
    "text-[13px] font-semibold leading-none no-underline",
    "transition-[background-color,border-color,color,box-shadow] duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--blue-soft)]",
    "disabled:pointer-events-none disabled:opacity-45",
    styles[variant],
    className,
  );

  if (href) {
    return (
      <a href={href} className={classes} style={style}>
        <span className="inline-flex items-center leading-none" style={style}>
          {children}
        </span>
      </a>
    );
  }

  return (
    <button type="button" className={classes} style={style} {...props}>
      <span className="inline-flex items-center leading-none" style={style}>
        {children}
      </span>
    </button>
  );
}

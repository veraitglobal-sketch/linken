import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "plus" | "light" | "onDark";

const styles: Record<Variant, string> = {
  primary: "border border-transparent bg-[#10231f] hover:bg-[#0a1714]",
  secondary: "border border-[#e6eaf0] bg-white hover:bg-[#f4f6f8]",
  ghost: "border border-transparent bg-transparent hover:bg-black/[0.04]",
  plus: "border border-[#e6eaf0] bg-[#f4f6f8]",
  light: "border border-transparent bg-white hover:bg-[#f3f4f2]",
  onDark: "border border-white/40 bg-white/10 hover:border-white/60 hover:bg-white/20",
};

const textColor: Record<Variant, string> = {
  primary: "#ffffff",
  secondary: "#141210",
  ghost: "#4a453f",
  plus: "#6b7280",
  light: "#141210",
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
    "transition-colors duration-200",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5ec4a8]",
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

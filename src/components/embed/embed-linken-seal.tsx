import { NetworkMark } from "@/components/marketing/network-mark";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  theme: EmbedTheme;
  /** When set, seal is a real link. Omit inside a parent `<a>`. */
  href?: string;
  title?: string;
  className?: string;
};

/**
 * Fixed trust seal — always the same place on every widget.
 * Partners/clients move; Linken stays.
 */
export function EmbedLinkenSeal({
  theme,
  href,
  title = "Verified on Linken",
  className,
}: Props) {
  const dark = theme === "dark";
  const body = (
    <>
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl",
          dark ? "bg-[#7eb8a4] text-[#081412]" : "bg-[#0e1f1c] text-[#7eb8a4]",
        )}
      >
        <NetworkMark size={16} animate={false} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display text-[12px] font-semibold tracking-[-0.03em]",
            dark ? "text-white" : "text-[#0d1210]",
          )}
        >
          Linken
        </span>
        <span
          className={cn(
            "mt-0.5 text-[9px] font-semibold tracking-[0.12em] uppercase",
            dark ? "text-white/45" : "text-[#66706b]",
          )}
        >
          Verified
        </span>
      </span>
    </>
  );

  const shell = cn(
    "flex h-full shrink-0 items-center gap-2 border-l py-0.5 pl-3",
    dark ? "border-white/12" : "border-[#e2e6e3]",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        title={title}
        className={cn(shell, "no-underline")}
      >
        {body}
      </a>
    );
  }

  return (
    <span className={shell} title={title} aria-label="Linken">
      {body}
    </span>
  );
}

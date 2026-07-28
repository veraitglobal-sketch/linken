import { NetworkMark } from "@/components/marketing/network-mark";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  theme: EmbedTheme;
  href?: string;
  title?: string;
  className?: string;
};

/** Fixed trust seal — partners move; Hansala stays. Quiet enough for any host. */
export function EmbedHansalaSeal({
  theme,
  href,
  title = "Hansala verified network",
  className,
}: Props) {
  const dark = theme === "dark";
  const body = (
    <>
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md ring-1",
          dark
            ? "bg-[#7eb8a4] text-[#081412] ring-[#7eb8a4]/35"
            : "bg-[#0e1f1c] text-[#7eb8a4] ring-black/10",
        )}
      >
        <NetworkMark size={14} animate={false} />
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "font-display text-[12px] font-semibold tracking-[-0.03em]",
            dark ? "text-white" : "text-[#0d1210]",
          )}
        >
          Hansala
        </span>
        <span
          className={cn(
            "mt-0.5 text-[8px] font-semibold tracking-[0.14em] uppercase",
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
    dark ? "border-white/12" : "border-black/[0.08]",
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
    <span className={shell} title={title} aria-label="Hansala">
      {body}
    </span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * A customer's page, with our widget sitting in it.
 *
 * Embeds are neutral by law — AGENTS.md forbids them their own radii,
 * gradients or colour, because they render on someone else's site and must
 * not impose our brand. That is why a bare embed always looks plain on our
 * own marketing page: it is doing exactly what it was built to do.
 *
 * So the widget is never restyled. It is staged: the chrome, the host page
 * around it and the elevation belong to us, the record inside belongs to the
 * customer's site. The contrast between the two is the point — that is what
 * "embed once, configure forever" looks like.
 *
 * The host page is skeleton rules, never invented copy or a real domain.
 */
export function HostWindow({
  domain = "your-site.example",
  className,
  children,
}: {
  domain?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[18px] border border-line bg-surface",
        "shadow-[0_1px_2px_rgba(8,20,18,0.05),0_18px_44px_-18px_rgba(8,20,18,0.22)]",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-line/80 bg-mute/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-[7px] rounded-full bg-line" />
          <span className="size-[7px] rounded-full bg-line" />
          <span className="size-[7px] rounded-full bg-line" />
        </span>
        <span className="truncate text-[11px] tracking-[-0.01em] text-muted">
          {domain}
        </span>
      </div>

      <div className="px-5 pt-5 pb-6">
        {/* Skeleton host page — rules, never invented words. */}
        <div className="space-y-2" aria-hidden>
          <span className="block h-2 w-[46%] rounded-full bg-line/80" />
          <span className="block h-1.5 w-[72%] rounded-full bg-line/50" />
          <span className="block h-1.5 w-[61%] rounded-full bg-line/50" />
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

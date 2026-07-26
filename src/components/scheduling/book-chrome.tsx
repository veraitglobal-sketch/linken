import { LogoMark } from "@/components/ui/logo-mark";
import {
  providerLabel,
  schedulingEmbedUrl,
  type SchedulingProvider,
} from "@/features/scheduling/types";
import { cn } from "@/lib/cn";

export type BookChromeProps = {
  companyName: string;
  logoInitials: string;
  logoUrl?: string | null;
  bookingUrl: string;
  provider: SchedulingProvider | null;
  label?: string;
  /** Stretch iframe to fill parent (sheet / full page). */
  fill?: boolean;
};

export function BookChrome({
  companyName,
  logoInitials,
  logoUrl,
  bookingUrl,
  provider,
  label = "Book a call",
  fill = false,
}: BookChromeProps) {
  const embedSrc = schedulingEmbedUrl(bookingUrl, provider);
  const via = provider ? providerLabel(provider) : "calendar";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="shrink-0 border-b border-line/70 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <LogoMark initials={logoInitials} logoUrl={logoUrl} size="md" />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold tracking-[0.14em] text-muted uppercase">
              {label}
            </p>
            <h2 className="mt-0.5 truncate font-display text-xl font-medium tracking-[-0.03em] text-ink">
              {companyName}
            </h2>
            <p className="mt-1 text-[13px] text-ink-soft">
              Pick a time that works. Confirmation goes to your email.
            </p>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 bg-paper/40">
        <iframe
          title={`Book with ${companyName}`}
          src={embedSrc}
          className={cn(
            "w-full border-0 bg-white",
            fill ? "h-full min-h-[28rem]" : "h-[min(70vh,640px)]",
          )}
          loading="lazy"
          allow="payment *; camera; microphone"
        />
      </div>

      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-line/70 px-5 py-3 sm:px-6">
        <p className="text-[11px] text-muted">Scheduling via {via}</p>
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Open in new tab
        </a>
      </footer>
    </div>
  );
}

import type { EmbedTheme } from "@/components/embed/embed-theme";
import {
  embedBarClass,
  embedHairlineClass,
  embedInkClass,
  embedMutedClass,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Peer = {
  name: string;
  slug: string;
  logoUrl?: string | null;
  initials: string;
};

type Props = {
  companyName: string;
  profileUrl: string;
  theme: EmbedTheme;
  peers: Peer[];
  total: number;
  siteUrl: string;
};

/**
 * Free network strip for host sites — confirmed partners only, links to Hansala.
 * No Hansala chrome except the verify line.
 */
export function EmbedNetworkStrip({
  companyName,
  profileUrl,
  theme,
  peers,
  total,
  siteUrl,
}: Props) {
  const shown = peers.slice(0, 5);

  return (
    <div
      className={cn(
        "w-full px-1 py-2.5 font-[family-name:var(--font-geist-sans),system-ui,sans-serif]",
        embedBarClass(theme),
        embedHairlineClass(theme),
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            "text-[11px] font-semibold tracking-[0.12em] uppercase",
            embedMutedClass(theme),
          )}
        >
          Confirmed network
        </span>
        <div className="flex items-center gap-1.5">
          {shown.map((p) => (
            <a
              key={p.slug}
              href={`${siteUrl}/c/${p.slug}?src=embed-network`}
              title={p.name}
              className={cn(
                "block size-7 overflow-hidden rounded-lg border",
                theme === "dark"
                  ? "border-white/15 bg-[#0e1f1c]"
                  : "border-black/10 bg-white",
              )}
            >
              {p.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.logoUrl}
                  alt=""
                  width={28}
                  height={28}
                  className="size-full object-contain"
                />
              ) : (
                <span
                  className={cn(
                    "grid size-full place-items-center text-[9px] font-bold",
                    embedInkClass(theme),
                  )}
                >
                  {p.initials.slice(0, 2)}
                </span>
              )}
            </a>
          ))}
        </div>
        <a
          href={profileUrl}
          className={cn(
            "ml-auto text-[12px] font-semibold no-underline",
            embedInkClass(theme),
          )}
        >
          {total} on {companyName} →
        </a>
      </div>
      <p className={cn("mt-1.5 text-[10px]", embedMutedClass(theme))}>
        Confirmed on Hansala ·{" "}
        <a href={profileUrl} className={cn("no-underline", embedMutedClass(theme))}>
          Verify
        </a>
      </p>
    </div>
  );
}

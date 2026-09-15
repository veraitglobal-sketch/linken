import { EmbedLogoCell } from "@/components/embed/embed-logo-cell";
import { EmbedLogoLockup } from "@/components/embed/embed-logo-lockup";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoTone } from "@/features/widgets/logo-tile-url";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

/**
 * Tiles — equal cells on a hairline grid, no fill: only the logos show, on
 * whatever background the page (or the chosen background) provides.
 * Columns come from the container width, never the viewport.
 */
export function EmbedLogoTiles({
  ownerProfileUrl,
  ownerCompanyId,
  viaHost,
  entries,
  theme,
  tone,
  siteUrl,
}: {
  ownerProfileUrl: string;
  ownerCompanyId: string;
  viaHost?: string | null;
  entries: LogoWallEntry[];
  theme: EmbedTheme;
  tone: LogoTone;
  siteUrl: string;
}) {
  const line = theme === "dark" ? "border-white/12" : "border-black/[0.08]";
  return (
    <div className="box-border w-full bg-transparent px-1 py-2">
      <EmbedLogoLockup count={entries.length} href={ownerProfileUrl} theme={theme} className="mb-4" />
      <ul
        className="m-0 grid list-none p-0 pt-px pl-px"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 150px), 1fr))" }}
      >
        {entries.map((e) => (
          <li key={e.id} className={cn("-mt-px -ml-px aspect-[12/5] border px-5", line)}>
            <EmbedLogoCell
              entry={e}
              siteUrl={siteUrl}
              ownerCompanyId={ownerCompanyId}
              viaHost={viaHost}
              theme={theme}
              tone={tone}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

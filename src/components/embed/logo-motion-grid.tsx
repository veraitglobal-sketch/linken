import { LogoWallMarkLink } from "@/components/embed/logo-wall-mark-link";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import type { LogoSize } from "@/features/widgets/logo-motion";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  entries: LogoWallEntry[];
  siteUrl: string;
  theme: EmbedTheme;
  mono: boolean;
  size: LogoSize;
  ownerCompanyId: string;
  viaHost?: string | null;
};

/** Editorial grid — hairlines only, no card fills. */
export function LogoMotionGrid({
  entries,
  siteUrl,
  theme,
  size,
  ownerCompanyId,
  viaHost,
}: Props) {
  const shown = entries.slice(0, 8);
  const line = theme === "dark" ? "border-white/12" : "border-[#e2e6e3]";

  return (
    <ul className="grid min-w-0 flex-1 grid-cols-4">
      {shown.map((e, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        return (
          <li
            key={e.slug}
            className={cn(
              "flex items-center justify-center px-3 py-2.5",
              col < 3 && `border-r ${line}`,
              row === 0 && shown.length > 4 && `border-b ${line}`,
            )}
          >
            <LogoWallMarkLink
              entry={e}
              siteUrl={siteUrl}
              theme={theme}
              size={size}
              ownerCompanyId={ownerCompanyId}
              viaHost={viaHost}
            />
          </li>
        );
      })}
    </ul>
  );
}

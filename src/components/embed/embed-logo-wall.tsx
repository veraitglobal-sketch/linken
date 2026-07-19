import {
  embedAccentClass,
  embedInkClass,
  embedMutedClass,
  embedShellClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { LogoTile } from "@/components/ui/logo-tile";
import type { LogoWallDensity } from "@/features/widgets/catalog";
import type { LogoWallEntry } from "@/features/widgets/logo-wall";
import { cn } from "@/lib/cn";

type Props = {
  ownerName: string;
  ownerProfileUrl: string;
  entries: LogoWallEntry[];
  label: string | null;
  theme?: EmbedTheme;
  mono?: boolean;
  density?: LogoWallDensity;
  siteUrl: string;
};

export function EmbedLogoWall({
  ownerName,
  ownerProfileUrl,
  entries,
  label,
  theme = "light",
  mono = false,
  density = "tiles+names",
  siteUrl,
}: Props) {
  const showNames = density === "tiles+names";
  const frameTone = theme === "dark" ? "dark" : "light";

  return (
    <div
      className={cn(
        "box-border w-full border px-3 py-2.5",
        embedShellClass(theme),
      )}
    >
      <div className="flex min-h-[56px] items-center gap-3">
        {label ? (
          <p
            className={cn(
              "shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase",
              embedAccentClass(theme),
            )}
          >
            {label}
          </p>
        ) : null}
        <ul className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2">
          {entries.map((e) => {
            const href = `${siteUrl}/c/${e.slug}?src=embed`;
            return (
              <li key={e.slug}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={e.name}
                  className={cn(
                    "inline-flex max-w-[160px] items-center no-underline transition-opacity hover:opacity-80",
                    embedInkClass(theme),
                  )}
                >
                  {e.showLogo ? (
                    <LogoTile
                      name={e.name}
                      initials={e.initials}
                      logoUrl={e.logoUrl}
                      website={e.website}
                      showName={showNames}
                      mono={mono}
                      frameTone={frameTone}
                      size="md"
                    />
                  ) : (
                    <span
                      className={cn(
                        "truncate text-[12px] font-medium",
                        embedInkClass(theme),
                        mono && "opacity-70",
                      )}
                    >
                      {e.name}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
        <a
          href={ownerProfileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "shrink-0 text-[9px] font-semibold tracking-[0.08em] uppercase no-underline",
            embedMutedClass(theme),
          )}
          title={`${ownerName} on Linken`}
        >
          Verified on Linken
        </a>
      </div>
    </div>
  );
}

type FallbackProps = {
  name: string;
  initials: string;
  logoUrl?: string | null;
  website?: string | null;
  verified: boolean;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Free-plan public embed — never empty / broken. */
export function EmbedLogoWallProFallback({
  name,
  initials,
  logoUrl,
  website,
  verified,
  profileUrl,
  theme = "light",
}: FallbackProps) {
  return (
    <div
      className={cn(
        "box-border w-full border px-3 py-2",
        embedShellClass(theme),
      )}
    >
      <div className="flex items-center gap-2.5">
        <LogoTile
          name={name}
          initials={initials}
          logoUrl={logoUrl}
          website={website}
          size="md"
          frameTone={theme === "dark" ? "dark" : "light"}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-[13px] font-semibold",
              embedInkClass(theme),
            )}
          >
            {name}
            {verified ? (
              <span className={cn("ml-1.5 text-[10px]", embedAccentClass(theme))}>
                Verified
              </span>
            ) : null}
          </p>
          <p className={cn("text-[11px]", embedMutedClass(theme))}>
            Partner logo wall is a Linken Pro feature
          </p>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "shrink-0 text-[10px] font-semibold tracking-[0.1em] uppercase no-underline",
            embedAccentClass(theme),
          )}
        >
          Linken
        </a>
      </div>
    </div>
  );
}

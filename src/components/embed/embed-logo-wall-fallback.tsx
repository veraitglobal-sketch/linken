import { EmbedLinkenSeal } from "@/components/embed/embed-linken-seal";
import { EmbedVerifiedMark } from "@/components/embed/embed-brand";
import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { LogoTile } from "@/components/ui/logo-tile";
import { cn } from "@/lib/cn";

type Props = {
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
}: Props) {
  return (
    <div className="flex w-full items-center gap-3 bg-transparent py-1">
      <LogoTile
        name={name}
        initials={initials}
        logoUrl={logoUrl}
        website={website}
        size="md"
        frameTone={theme === "dark" ? "dark" : "light"}
      />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p
            className={cn(
              "truncate font-display text-[1rem] font-medium tracking-[-0.03em]",
              embedInkClass(theme),
            )}
          >
            {name}
          </p>
          {verified ? <EmbedVerifiedMark theme={theme} /> : null}
        </div>
        <p className={cn("mt-0.5 text-[11px]", embedMutedClass(theme))}>
          Partner logo wall is a Linken Pro feature
        </p>
      </div>
      <EmbedLinkenSeal theme={theme} href={profileUrl} />
    </div>
  );
}

import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  companies: EmbedProofCompany[];
  theme: EmbedTheme;
  className?: string;
};

/** Bare logos on a continuous slide — no tiles. */
export function EmbedProofMarquee({
  companies,
  theme,
  className,
}: Props) {
  if (companies.length === 0) return null;

  const slide = companies.length >= 2;
  const padded =
    slide && companies.length < 5
      ? [...companies, ...companies, ...companies]
      : companies;
  const track = slide ? [...padded, ...padded] : companies;
  const durationSec = Math.max(14, padded.length * 2.4);

  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden",
        "[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]",
        className,
      )}
    >
      <ul
        className={cn(
          "flex w-max items-center gap-6 py-0.5",
          slide && "linken-marquee",
        )}
        style={slide ? { animationDuration: `${durationSec}s` } : undefined}
        aria-label="Confirmed partners and clients"
      >
        {track.map((c, i) => (
          <li
            key={`${c.name}-${i}`}
            className="shrink-0 opacity-80 transition-opacity hover:opacity-100"
            title={c.name}
          >
            <EmbedBareLogo
              name={c.name}
              initials={c.initials}
              logoUrl={c.logoUrl}
              website={c.website}
              theme={theme}
              mono
              size="sm"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

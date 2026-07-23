import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import { LogoTile } from "@/components/ui/logo-tile";
import {
  embedInkClass,
  embedMutedClass,
  embedSoftClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { embedPremiumShell } from "@/components/embed/embed-premium-shell";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  confirmedCount: number;
  proofCompanies: EmbedProofCompany[];
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Pro — large network count + overlapping partner stack. */
export function EmbedNetworkCard({
  name,
  confirmedCount,
  proofCompanies,
  profileUrl,
  theme = "light",
}: Props) {
  const dark = theme === "dark";
  const shown = proofCompanies.slice(0, 6);
  const frameTone = dark ? "dark" : "light";

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex w-full items-center gap-4 px-4 py-3.5 no-underline",
        embedPremiumShell(theme, "pro"),
      )}
    >
      <div className="min-w-0 flex-1">
        <p className={cn("text-[10px] font-semibold tracking-[0.12em] uppercase", embedMutedClass(theme))}>
          Confirmed network
        </p>
        <p
          className={cn(
            "mt-1 font-display text-[2.4rem] font-medium leading-none tracking-[-0.05em] tabular-nums",
            embedInkClass(theme),
          )}
        >
          {confirmedCount}
        </p>
        <p className={cn("mt-1 max-w-[14rem] truncate text-[12px]", embedSoftClass(theme))}>
          {name} · verified relationships
        </p>
        {shown.length > 0 ? (
          <ul className="mt-2.5 flex items-center pl-0.5" aria-hidden>
            {shown.map((c, i) => (
              <li
                key={`${c.name}-${i}`}
                className={cn(
                  i > 0 && "-ml-2",
                  "rounded-lg ring-2",
                  dark ? "ring-[#081412]" : "ring-white",
                )}
                style={{ zIndex: shown.length - i }}
              >
                <LogoTile
                  name={c.name}
                  initials={c.initials}
                  logoUrl={c.logoUrl}
                  website={c.website}
                  size="xs"
                  frameTone={frameTone}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <EmbedVerifiedLockup theme={theme} size="md" />
    </a>
  );
}

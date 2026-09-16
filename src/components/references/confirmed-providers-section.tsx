import Link from "next/link";
import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import { LogoTile } from "@/components/ui/logo-tile";
import type { ServiceReference } from "@/types/service-reference";
import { initialsFromName } from "@/features/team/types";

type Props = {
  providers: ServiceReference[];
};

/**
 * Reciprocal view — confirmed providers listing this firm as client.
 * Pending never shown.
 */
export function ConfirmedProvidersSection({ providers }: Props) {
  if (providers.length === 0) return null;

  return (
    <ProfileSection
      icon={ProfileIcons.providers}
      title="Companies we work with"
      description="Confirmed by both sides. This firm is listed as the client on these relationships."
    >
      <ul className="flex list-none flex-col gap-2.5 p-0">
        {providers.map((p) => (
          <li
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-wash px-4 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              {p.clientSlug ? (
                <Link
                  href={`/c/${p.clientSlug}`}
                  className="min-w-0 hover:opacity-90"
                >
                  <LogoTile
                    name={p.clientName}
                    initials={initialsFromName(p.clientName)}
                    logoUrl={p.clientLogoUrl}
                    website={p.clientWebsite}
                    showName
                    size="sm"
                  />
                </Link>
              ) : (
                <LogoTile
                  name={p.clientName}
                  initials={initialsFromName(p.clientName)}
                  logoUrl={p.clientLogoUrl}
                  website={p.clientWebsite}
                  showName
                  size="sm"
                />
              )}
            </div>
            <div className="text-right text-[13px] text-ink-soft">
              <p className="font-medium text-ink">{p.service}</p>
              <p className="mt-0.5 text-[12px] text-muted">
                {p.ongoing
                  ? `Since ${p.startedYear} · ongoing`
                  : `${p.startedYear}${p.endedYear ? `–${p.endedYear}` : ""}`}
                {" · Confirmed"}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}

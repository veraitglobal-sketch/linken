import Link from "next/link";
import { ProfileIcons, ProfileSection } from "@/components/company/profile-section";
import { LogoMark } from "@/components/ui/logo-mark";
import {
  initialsFromName,
  type PublicTeamMember,
} from "@/features/team/types";

type Props = {
  members: PublicTeamMember[];
  companySlug?: string;
  editable?: boolean;
};

/** Public team roster — owners always see the section so they can manage it. */
export function CompanyTeamSection({
  members,
  companySlug,
  editable = false,
}: Props) {
  if (members.length === 0 && !editable) return null;

  return (
    <ProfileSection
      id="team"
      icon={ProfileIcons.team}
      title="Team"
      description={
        editable
          ? "People who chose to appear on this profile. Invite and manage access in Team."
          : "People who chose to appear on this company profile."
      }
      action={
        editable && companySlug ? (
          <Link
            href={`/dashboard/team?from=${companySlug}`}
            className="inline-flex h-9 items-center rounded-full bg-wash px-4 text-[13px] font-semibold text-ink ring-1 ring-line/70 transition-colors hover:bg-lime-soft"
          >
            Manage team
          </Link>
        ) : null
      }
    >
      {members.length > 0 ? (
        <ul className="grid list-none gap-2.5 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li
              key={`${m.displayName}-${m.displayTitle}-${m.photoUrl ?? ""}`}
              className="flex items-center gap-3 rounded-2xl bg-wash px-3.5 py-3"
            >
              <LogoMark
                initials={initialsFromName(m.displayName)}
                logoUrl={m.photoUrl}
                size="md"
                className="rounded-full! bg-surface"
              />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-semibold text-ink">
                  {m.displayName}
                </p>
                {m.displayTitle ? (
                  <p className="truncate text-[13px] text-muted">
                    {m.displayTitle}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-dashed border-ink/15 px-5 py-6">
          <p className="text-[15px] font-semibold text-ink">No public team yet</p>
          <p className="mt-1 text-[14px] text-muted">
            Invite teammates — they opt in to appear here.
          </p>
          {companySlug ? (
            <Link
              href={`/dashboard/team?tab=invite&from=${companySlug}`}
              className="mt-4 inline-flex h-10 items-center rounded-full bg-navy px-4 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              Invite teammates
            </Link>
          ) : null}
        </div>
      )}
    </ProfileSection>
  );
}

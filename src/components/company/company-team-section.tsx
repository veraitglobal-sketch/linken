import Link from "next/link";
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
    <section id="team" className="scroll-mt-32 rounded-3xl bg-surface px-6 py-9 sm:px-12 sm:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="inline-flex h-8 items-center rounded-full bg-lime px-3.5 text-[12px] font-semibold text-navy">
            Team
          </span>
          <h2 className="mt-5 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-ink">
            Who shows up on this page.
          </h2>
          <p className="mt-3 text-[16px] text-ink-soft">
            {editable
              ? "People who chose to appear on this profile. Invite and manage access in Team."
              : "People who chose to appear on this company profile."}
          </p>
        </div>
        {editable && companySlug ? (
          <Link
            href={`/dashboard/team?from=${companySlug}`}
            className="inline-flex h-11 shrink-0 items-center rounded-full bg-navy px-5 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
          >
            Manage team
          </Link>
        ) : null}
      </div>
      {members.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <li
              key={`${m.displayName}-${m.displayTitle}-${m.photoUrl ?? ""}`}
              className="flex items-center gap-4 rounded-2xl bg-mute px-4 py-4"
            >
              <LogoMark
                initials={initialsFromName(m.displayName)}
                logoUrl={m.photoUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold text-ink">
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
        <div className="mt-8 rounded-2xl border-2 border-dashed border-line px-6 py-7">
          <p className="text-[16px] font-semibold text-ink">No public team yet</p>
          <p className="mt-1 text-[14px] text-muted">
            Invite teammates — they opt in to appear here.
          </p>
          {companySlug ? (
            <Link
              href={`/dashboard/team?tab=invite&from=${companySlug}`}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-navy px-5 text-[14px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
            >
              Invite teammates
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}

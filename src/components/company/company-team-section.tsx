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
    <section id="team" className="scroll-mt-24 rounded-chapter border border-line bg-surface px-6 py-8 sm:px-9 sm:py-9">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-ember-deep uppercase">
            Team
          </p>
          <h2 className="mt-3 font-display text-section text-ink">
            Who shows up
            <span className="mt-1 block text-ink/35">on this page.</span>
          </h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            {editable
              ? "People who chose to appear on this profile. Invite and manage access in Team."
              : "People who chose to appear on this company profile."}
          </p>
        </div>
        {editable && companySlug ? (
          <Link
            href={`/dashboard/team?from=${companySlug}`}
            className="shrink-0 text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Manage team
          </Link>
        ) : null}
      </div>
      {members.length > 0 ? (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <li
              key={`${m.displayName}-${m.displayTitle}-${m.photoUrl ?? ""}`}
              className="flex items-center gap-3 rounded-none border border-line px-3 py-3"
            >
              <LogoMark
                initials={initialsFromName(m.displayName)}
                logoUrl={m.photoUrl}
                size="md"
              />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-ink">
                  {m.displayName}
                </p>
                {m.displayTitle ? (
                  <p className="truncate text-[12px] text-muted">
                    {m.displayTitle}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5 rounded-none border border-dashed border-line px-4 py-5">
          <p className="text-[13px] font-semibold text-ink">No public team yet</p>
          <p className="mt-1 text-[12px] text-muted">
            Invite teammates — they opt in to appear here.
          </p>
          {companySlug ? (
            <Link
              href={`/dashboard/team?tab=invite&from=${companySlug}`}
              className="mt-3 inline-flex text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
            >
              Invite teammates
            </Link>
          ) : null}
        </div>
      )}
    </section>
  );
}

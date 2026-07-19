import { LogoMark } from "@/components/ui/logo-mark";
import {
  initialsFromName,
  type PublicTeamMember,
} from "@/features/team/types";

type Props = {
  members: PublicTeamMember[];
};

/** Public team roster — render only when at least one member opted in. */
export function CompanyTeamSection({ members }: Props) {
  if (members.length === 0) return null;

  return (
    <section className="rounded-[24px] border border-line bg-surface px-5 py-6 sm:px-6">
      <h2 className="font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Team
      </h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        People who chose to appear on this company profile.
      </p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {members.map((m) => (
          <li
            key={`${m.displayName}-${m.displayTitle}-${m.photoUrl ?? ""}`}
            className="flex items-center gap-3 rounded-xl border border-line px-3 py-3"
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
                <p className="truncate text-[12px] text-muted">{m.displayTitle}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

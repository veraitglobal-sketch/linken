import Link from "next/link";
import { TrustLevelBadge } from "@/components/trust/trust-level-badge";
import { LogoMark } from "@/components/ui/logo-mark";
import type { GroupMemberCard as Member } from "@/features/groups/types";

type Props = {
  member: Member;
};

export function GroupMemberCard({ member }: Props) {
  return (
    <Link
      href={`/c/${member.slug}`}
      className="flex h-full flex-col rounded-[24px] border border-line bg-surface p-5 transition-colors hover:border-[#10231f]/20 hover:bg-white"
    >
      <div className="flex items-start gap-3">
        <LogoMark
          initials={member.logoInitials}
          logoUrl={member.logoUrl}
          size="md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-medium tracking-[-0.03em] text-ink">
              {member.name}
            </h3>
            {member.claimed ? (
              <TrustLevelBadge level={member.trustLevel} />
            ) : (
              <span className="rounded-full border border-[#1f6b5c]/25 bg-[#1f6b5c]/10 px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#1f6b5c] uppercase">
                Unclaimed
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-ink-soft">
            {member.category}
            {member.city
              ? ` · ${member.city}${member.country ? `, ${member.country}` : ""}`
              : ""}
          </p>
        </div>
      </div>
      <p className="mt-4 text-[12px] text-muted">
        {member.confirmedReferences > 0
          ? `${member.confirmedReferences} confirmed reference${member.confirmedReferences === 1 ? "" : "s"}`
          : "No confirmed references yet"}
      </p>
    </Link>
  );
}

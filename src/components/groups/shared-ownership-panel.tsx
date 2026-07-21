import {
  confirmCoOwnership,
  declineCoOwnership,
  endCoOwnership,
  proposeCoOwnership,
} from "@/features/network/co-ownership";
import type {
  CoOwnerProposal,
  ConfirmedCoOwnership,
  ExternalPartnerOption,
} from "@/features/network/co-ownership-queries";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import type { GroupMemberCard } from "@/features/groups/types";

type Props = {
  groupId: string;
  members: GroupMemberCard[];
  externalPartners?: ExternalPartnerOption[];
  proposals: CoOwnerProposal[];
  confirmedLinks: ConfirmedCoOwnership[];
  viewerCompanyId: string | null;
  backPath: string;
};

const OWNERSHIP_TYPE_LABELS: Record<string, string> = {
  equity: "Equity",
  joint_venture: "Joint venture",
  private_equity: "Private equity",
  shareholding: "Shareholding",
  family: "Family ownership",
  other: "Other",
};

function ownershipSummary(
  percentage: number | null,
  type: string | null,
): string | null {
  const parts = [
    percentage != null ? `${percentage}%` : null,
    type ? OWNERSHIP_TYPE_LABELS[type] : null,
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

/**
 * Joint ventures: a firm can have more than one confirmed owner. The
 * primary parent (Structure tree) is untouched — this adds an EXTRA,
 * mutually-confirmed owner on top, drawn as a second line on the map.
 */
export function SharedOwnershipPanel({
  groupId,
  members,
  externalPartners = [],
  proposals,
  confirmedLinks,
  viewerCompanyId,
  backPath,
}: Props) {
  if (members.length === 0) return null;
  if (members.length < 2 && externalPartners.length === 0) return null;

  return (
    <section className="space-y-4">
      <header>
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Shared ownership
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          For joint ventures — a firm owned by two members of this group. The
          firm still appears once on the map, with a line to each owner. The
          other side must confirm.
        </p>
      </header>

      {proposals.length > 0 ? (
        <WorkspaceCard padded={false}>
          <ul className="divide-y divide-line">
            {proposals.map((p) => {
              const iAmCoParent = p.coParentCompanyId === viewerCompanyId;
              const otherName = iAmCoParent ? p.childName : p.coParentName;
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
                >
                  <p className="text-[13px] text-ink">
                    <span className="font-semibold">{otherName}</span>{" "}
                    proposes shared ownership of{" "}
                    <span className="font-semibold">{p.childName}</span> with{" "}
                    <span className="font-semibold">{p.coParentName}</span>
                    {ownershipSummary(p.ownershipPercentage, p.ownershipType) ? (
                      <span className="text-muted">
                        {" "}
                        ({ownershipSummary(p.ownershipPercentage, p.ownershipType)})
                      </span>
                    ) : null}
                    .
                  </p>
                  <div className="flex shrink-0 gap-2">
                    <form action={confirmCoOwnership}>
                      <input type="hidden" name="edge_id" value={p.id} />
                      <input type="hidden" name="back" value={backPath} />
                      <Button
                        type="submit"
                        variant="primary"
                        className="h-8 px-3 text-[11px]"
                      >
                        Confirm
                      </Button>
                    </form>
                    <form action={declineCoOwnership}>
                      <input type="hidden" name="edge_id" value={p.id} />
                      <input type="hidden" name="back" value={backPath} />
                      <Button
                        type="submit"
                        variant="secondary"
                        className="h-8 px-3 text-[11px]"
                      >
                        Decline
                      </Button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        </WorkspaceCard>
      ) : null}

      {confirmedLinks.length > 0 ? (
        <WorkspaceCard padded={false}>
          <ul className="divide-y divide-line">
            {confirmedLinks.map((link) => (
              <li
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <p className="text-[13px] text-ink">
                  <span className="font-semibold">{link.childName}</span> —
                  jointly owned with{" "}
                  <span className="font-semibold">{link.coParentName}</span>
                  {ownershipSummary(link.ownershipPercentage, link.ownershipType) ? (
                    <span className="text-muted">
                      {" "}
                      ({ownershipSummary(link.ownershipPercentage, link.ownershipType)})
                    </span>
                  ) : null}
                </p>
                <form action={endCoOwnership}>
                  <input type="hidden" name="edge_id" value={link.id} />
                  <input type="hidden" name="back" value={backPath} />
                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-8 px-3 text-[11px]"
                  >
                    End
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </WorkspaceCard>
      ) : null}

      <WorkspaceCard>
        <form action={proposeCoOwnership} className="grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="back" value={backPath} />
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Firm (owned)
            </span>
            <select
              name="child_company_id"
              required
              className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink"
            >
              <option value="">Choose a firm</option>
              {members.map((m) => (
                <option key={m.companyId} value={m.companyId}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Also owned by
            </span>
            <select
              name="co_parent_company_id"
              required
              className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink"
            >
              <option value="">Choose a firm</option>
              {members.length > 0 ? (
                <optgroup label="Group members">
                  {members.map((m) => (
                    <option key={m.companyId} value={m.companyId}>
                      {m.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {externalPartners.length > 0 ? (
                <optgroup label="Confirmed partners">
                  {externalPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Ownership % (optional)
            </span>
            <input
              type="number"
              name="ownership_percentage"
              min="1"
              max="100"
              step="0.01"
              placeholder="e.g. 49"
              className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Ownership type (optional)
            </span>
            <select
              name="ownership_type"
              defaultValue=""
              className="h-10 w-full rounded-xl border border-line bg-white px-3 text-[13px] text-ink"
            >
              <option value="">Unspecified</option>
              {Object.entries(OWNERSHIP_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" className="h-10 px-4 sm:col-span-2 sm:justify-self-start">
            Propose
          </Button>
        </form>
      </WorkspaceCard>
    </section>
  );
}

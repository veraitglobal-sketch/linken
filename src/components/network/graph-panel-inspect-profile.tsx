import { LogoRetryHint } from "@/components/logo/logo-retry-hint";
import { LogoTile } from "@/components/ui/logo-tile";
import type {
  NetworkGraphContext,
  NetworkNodeData,
} from "@/features/network/types";

const ROLE_LABEL = {
  group: "Group",
  company: "Company",
  subsidiary: "Child firm",
  partner: "Partner",
  client: "Client",
} as const;

type Props = {
  selected: NetworkNodeData;
  context?: NetworkGraphContext;
};

export function GraphPanelInspectProfile({ selected, context }: Props) {
  return (
    <div className="px-3 py-3">
      <div className="flex items-start gap-3">
        <LogoTile
          name={selected.name}
          initials={selected.logoInitials}
          logoUrl={selected.logoUrl}
          website={selected.website}
          allowFavicon
          size="md"
        />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold tracking-[0.1em] text-plus uppercase">
            {ROLE_LABEL[selected.kind]}
          </p>
          <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em] text-ink">
            {selected.name}
          </p>
          <p className="mt-0.5 text-[12px] text-muted">
            {[selected.category, selected.city].filter(Boolean).join(" · ") ||
              "—"}
          </p>
        </div>
      </div>
      {selected.kind === "group" && context?.isGroupCreator ? (
        <div className="mt-3">
          <LogoRetryHint
            logoSource={selected.logoSource}
            website={selected.website}
            back="/dashboard"
            kind="group"
            groupId={context.groupId ?? undefined}
          />
        </div>
      ) : null}
      {selected.kind !== "group" &&
      selected.companyId === context?.viewerCompanyId ? (
        <div className="mt-3">
          <LogoRetryHint
            logoSource={selected.logoSource}
            website={selected.website}
            back="/dashboard"
          />
        </div>
      ) : null}
      {selected.kind !== "group" && selected.domainVerified === false ? (
        selected.companyId &&
        selected.companyId === context?.viewerCompanyId ? (
          <a
            href="/dashboard/verification"
            className="mt-3 block rounded-2xl border border-ember/30 bg-ember/8 px-3 py-2.5 transition-colors hover:border-ember/50 hover:bg-ember/12"
          >
            <p className="text-[12px] font-semibold text-ember">
              Domain not verified
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ember/80">
              Verify ownership (DNS, meta tag, or email) to unlock linking —
              open verification →
            </p>
          </a>
        ) : (
          <div className="mt-3 rounded-2xl border border-ember/30 bg-ember/8 px-3 py-2.5">
            <p className="text-[12px] font-semibold text-ember">
              Domain not verified
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-ember/80">
              Links stay limited until this firm verifies ownership of its
              website domain (DNS, meta tag, or email).
            </p>
          </div>
        )
      ) : null}
      {selected.kind !== "group" && selected.domainVerified !== false ? (
        <p className="mt-3 text-[12px] text-muted">
          {selected.stats.confirmedPartners} partners ·{" "}
          {selected.stats.confirmedReferences} references
          {selected.domainVerified ? " · Domain verified" : ""}
        </p>
      ) : null}
    </div>
  );
}

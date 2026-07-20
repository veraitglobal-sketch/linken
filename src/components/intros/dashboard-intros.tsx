import { setReceiveIntros } from "@/features/intros/actions";
import { IntroRow } from "@/components/intros/intro-row";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { cn } from "@/lib/cn";
import type { IntroInboxItem } from "@/types/intro";

type Props = {
  intros: IntroInboxItem[];
  receiveIntros: boolean;
};

export function DashboardIntros({ intros, receiveIntros }: Props) {
  return (
    <div className="space-y-4">
      <WorkspaceCard className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[13px] leading-relaxed text-ink">
          {receiveIntros
            ? "You are accepting intros from other firms."
            : "Intros are paused — firms cannot contact you this way."}
        </p>
        <div className="flex rounded-xl border border-line bg-paper/60 p-1">
          <Toggle
            label="Accepting"
            enabled
            active={receiveIntros}
          />
          <Toggle
            label="Paused"
            enabled={false}
            active={!receiveIntros}
          />
        </div>
      </WorkspaceCard>

      <WorkspaceCard padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-paper/50 px-5 py-3 sm:px-6">
          <p className="text-[12px] font-medium text-ink">
            {intros.length === 0
              ? "No intros yet"
              : `${intros.length} received`}
          </p>
        </div>

        {intros.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-6">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
              Waiting for intros
            </p>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] leading-relaxed text-muted">
              When another firm reaches out through Radar, the message lands
              here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {intros.map((intro, i) => (
              <IntroRow key={intro.id} intro={intro} index={i} />
            ))}
          </ul>
        )}
      </WorkspaceCard>
    </div>
  );
}

function Toggle({
  label,
  enabled,
  active,
}: {
  label: string;
  enabled: boolean;
  active: boolean;
}) {
  return (
    <form action={setReceiveIntros}>
      <input type="hidden" name="enabled" value={enabled ? "1" : "0"} />
      <button
        type="submit"
        className={cn(
          "h-9 rounded-lg px-3.5 text-[12px] font-semibold transition-colors",
          active
            ? "bg-navy text-white shadow-sm"
            : "text-ink hover:bg-surface",
        )}
      >
        {label}
      </button>
    </form>
  );
}

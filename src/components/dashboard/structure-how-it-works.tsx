import { WorkspaceCard } from "@/components/dashboard/workspace-page";

const STEPS = [
  {
    n: "1",
    title: "Create a group",
    body: "Holding name for country brands — e.g. CleanCo Group. Each firm keeps its own profile.",
  },
  {
    n: "2",
    title: "Add a branch",
    body: "New subsidiary (unclaimed country firm) or invite a company that already exists on Linken.",
  },
  {
    n: "3",
    title: "Nest under a parent",
    body: "Pick a parent so the branch sits under HQ in the tree. Same links show on Network.",
  },
] as const;

/** Plain-language explainer — Structure is ownership, not partnerships. */
export function StructureHowItWorks() {
  return (
    <WorkspaceCard>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
          How Structure works
        </p>
        <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Structure is your{" "}
          <span className="font-semibold text-ink">ownership tree</span> —
          who owns whom inside one group. It is{" "}
          <span className="font-semibold text-ink">not</span> the same as
          Partners (confirmed business relationships on Network).
        </p>
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map((s) => (
          <li
            key={s.n}
            className="rounded-xl border border-line bg-paper/50 px-3.5 py-3.5"
          >
            <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
              Step {s.n}
            </p>
            <p className="mt-1 text-[13px] font-semibold text-ink">{s.title}</p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted">
              {s.body}
            </p>
          </li>
        ))}
      </ol>
    </WorkspaceCard>
  );
}

import { signOut } from "@/features/auth/actions";
import { workspaceRoleLabel } from "@/features/workspace/role-label";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext;
};

/** Account chip with a single sign-out action at the bottom of the sidebar. */
export function WorkspaceAccountMenu({ active }: Props) {
  return (
    <div className="mt-2 overflow-hidden rounded-2xl border border-line/55 bg-paper/60">
      <div className="flex items-center gap-2.5 px-2.5 py-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy/[0.08] text-[11px] font-semibold text-navy">
          {active.initials.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-semibold text-ink">{active.name}</p>
          <p className="truncate text-[10px] text-muted">
            {workspaceRoleLabel(active)}
          </p>
        </div>
      </div>
      <form action={signOut} className="border-t border-line/55">
        <button
          type="submit"
          className="flex w-full items-center px-3 py-2.5 text-left text-[12px] font-semibold text-muted transition-colors hover:bg-navy/[0.035] hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

import Link from "next/link";
import {
  IconHome,
  IconSearch,
  IconSettings,
} from "@/components/dashboard/workspace-icons";
import { workspaceRoleLabel } from "@/features/workspace/role-label";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
};

export function WorkspaceAsideFooter({ active }: Props) {
  return (
    <>
      <div className="mt-2 space-y-px border-t border-line/70 pt-2">
        {active?.type === "company" ? (
          <Link
            href="/dashboard/settings"
            className="group flex h-8 items-center gap-2 rounded-lg px-2 text-[12px] font-medium text-ink-soft transition-colors hover:bg-black/[0.03] hover:text-ink"
          >
            <IconSettings className="text-plus group-hover:text-ink-soft" />
            Edit profile
          </Link>
        ) : null}
        <Link
          href="/search"
          className="group flex h-8 items-center gap-2 rounded-lg px-2 text-[12px] font-medium text-ink-soft transition-colors hover:bg-black/[0.03] hover:text-ink"
        >
          <IconSearch className="text-plus group-hover:text-ink-soft" />
          Directory
        </Link>
        <Link
          href="/"
          className="group flex h-8 items-center gap-2 rounded-lg px-2 text-[12px] font-medium text-ink-soft transition-colors hover:bg-black/[0.03] hover:text-ink"
        >
          <IconHome className="text-plus group-hover:text-ink-soft" />
          Home
        </Link>
      </div>

      {active ? (
        <div className="mt-2 flex items-center gap-2 px-1.5 py-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy/[0.07] text-[10px] font-semibold text-navy">
            {active.initials.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold text-ink">
              {active.name}
            </p>
            <p className="truncate text-[10px] text-muted">
              {workspaceRoleLabel(active)}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

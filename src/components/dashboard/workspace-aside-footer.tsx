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
      <div className="mt-3 space-y-0.5 border-t border-[#f1f5f9] pt-3">
        {active?.type === "company" ? (
          <Link
            href="/dashboard/settings"
            className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
          >
            <IconSettings className="text-[#94a3b8] group-hover:text-[#64748b]" />
            Edit profile
          </Link>
        ) : null}
        <Link
          href="/search"
          className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
        >
          <IconSearch className="text-[#94a3b8] group-hover:text-[#64748b]" />
          Directory
        </Link>
        <Link
          href="/"
          className="group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium text-[#64748b] transition-colors hover:bg-[#f4f6f9] hover:text-ink"
        >
          <IconHome className="text-[#94a3b8] group-hover:text-[#64748b]" />
          Home
        </Link>
      </div>

      {active ? (
        <div className="mt-3 flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef1f6] text-[11px] font-semibold text-ink">
            {active.initials.slice(0, 1)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[12px] font-semibold text-ink">
              {active.name}
            </p>
            <p className="truncate text-[10px] text-[#94a3b8]">
              {workspaceRoleLabel(active)}
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

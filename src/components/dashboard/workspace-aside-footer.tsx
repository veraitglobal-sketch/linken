import Link from "next/link";
import { WorkspaceAccountMenu } from "@/components/dashboard/workspace-account-menu";
import {
  IconHome,
  IconSettings,
} from "@/components/dashboard/workspace-icons";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
  signedIn: boolean;
};

export function WorkspaceAsideFooter({ active, signedIn }: Props) {
  if (!signedIn) {
    return (
      <div className="mt-3 space-y-0.5 border-t border-line/55 pt-3">
        <Link
          href="/"
          className="group flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-navy/[0.035] hover:text-ink"
        >
          <IconHome className="text-plus group-hover:text-ink-soft" />
          Home
        </Link>
        <Link
          href="/login?next=/dashboard"
          className="flex h-9 items-center justify-center rounded-xl bg-navy px-2.5 text-[12px] font-semibold text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mt-3 space-y-0.5 border-t border-line/55 pt-3">
        {active?.type === "company" ? (
          <Link
            href={`/c/${active.slug}/edit`}
            className="group flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-navy/[0.035] hover:text-ink"
          >
            <IconSettings className="text-plus group-hover:text-ink-soft" />
            Edit company
          </Link>
        ) : null}
        <Link
          href="/"
          className="group flex h-9 items-center gap-2.5 rounded-xl px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-navy/[0.035] hover:text-ink"
        >
          <IconHome className="text-plus group-hover:text-ink-soft" />
          Home
        </Link>
      </div>

      {active ? <WorkspaceAccountMenu active={active} /> : null}
    </>
  );
}

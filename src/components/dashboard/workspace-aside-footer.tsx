import Link from "next/link";
import { WorkspaceAccountMenu } from "@/components/dashboard/workspace-account-menu";
import {
  IconHome,
  IconSettings,
} from "@/components/dashboard/workspace-icons";
import { signOut } from "@/features/auth/actions";
import type { WorkspaceContext } from "@/features/workspace/types";

type Props = {
  active: WorkspaceContext | null;
};

export function WorkspaceAsideFooter({ active }: Props) {
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
        <form action={signOut}>
          <button
            type="submit"
            className="group flex h-9 w-full items-center gap-2.5 rounded-xl px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-navy/[0.035] hover:text-ink"
          >
            <SignOutIcon className="text-plus group-hover:text-ink-soft" />
            Sign out
          </button>
        </form>
      </div>

      {active ? <WorkspaceAccountMenu active={active} /> : null}
    </>
  );
}

function SignOutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 17l5-5-5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

import Link from "next/link";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";

type Props = {
  balance: number;
  verified: boolean;
};

/** Quiet credit strip shared by leads + requests tabs. */
export function RadarCreditsBar({ balance, verified }: Props) {
  return (
    <WorkspaceCard className="flex flex-wrap items-center justify-between gap-3 py-4">
      <div>
        <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
          Credits
        </p>
        <p className="mt-0.5 text-[13px] text-ink">
          <span className="font-display text-[22px] font-semibold tracking-[-0.03em]">
            {balance}
          </span>
          <span className="ml-2 text-muted">
            · intros 2 · responses 1
          </span>
        </p>
      </div>
      {!verified ? (
        <Link
          href="/dashboard/verification"
          className="text-[12px] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Verify domain to spend credits
        </Link>
      ) : null}
    </WorkspaceCard>
  );
}

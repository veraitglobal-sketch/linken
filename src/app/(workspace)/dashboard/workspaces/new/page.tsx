import type { Metadata } from "next";
import Link from "next/link";
import { AddWorkspaceForm } from "@/components/dashboard/add-workspace-form";
import { WorkspacePage } from "@/components/dashboard/workspace-page";

export const metadata: Metadata = {
  title: "Add workspace",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AddWorkspacePage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <WorkspacePage
      title="Add workspace"
      description="Look up a draft by work email, claim it, or create a new company you own."
      action={
        <Link
          href="/dashboard"
          className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Back to map
        </Link>
      }
    >
      <div className="rounded-[22px] border border-line/70 bg-surface p-5 shadow-[0_14px_40px_rgba(8,20,18,0.045)] sm:p-6">
        <AddWorkspaceForm error={error} />
      </div>
    </WorkspacePage>
  );
}

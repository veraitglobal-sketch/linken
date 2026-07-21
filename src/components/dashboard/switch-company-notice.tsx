import Link from "next/link";
import { WorkspacePage } from "@/components/dashboard/workspace-page";

/** Shown on company-only pages when the active workspace is a group. */
export function SwitchCompanyNotice({
  title = "Company workspace required",
}: {
  title?: string;
}) {
  return (
    <WorkspacePage title={title} description="This page is company-only.">
      <p className="text-[14px] text-muted">
        Switch to a company workspace to use this page.{" "}
        <Link
          href="/dashboard"
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Back to workspace
        </Link>
      </p>
    </WorkspacePage>
  );
}

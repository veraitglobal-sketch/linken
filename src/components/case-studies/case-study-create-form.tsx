import { createCaseStudyWithConfirm } from "@/features/case-studies/actions";
import { CaseStudyFields } from "@/components/case-studies/case-study-fields";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  companySlug: string;
};

/** Dashboard: create + send confirmation email in one submit. */
export function CaseStudyCreateForm({ companySlug }: Props) {
  return (
    <WorkspaceCard>
      <form action={createCaseStudyWithConfirm} className="grid gap-4">
        <input type="hidden" name="company_slug" value={companySlug} />
        <input type="hidden" name="back" value="/dashboard/cases" />

        <CaseStudyFields showEmail showPartner />

        <p className="text-[12px] leading-relaxed text-muted">
          After creating, open the case to upload a cover photo and project
          gallery — that&apos;s what makes it look like a real portfolio piece.
        </p>

        <Button type="submit" className="h-10 w-fit px-4">
          Create &amp; send confirmation
        </Button>
      </form>
    </WorkspaceCard>
  );
}

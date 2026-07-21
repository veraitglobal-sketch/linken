import { createCaseStudyWithConfirm } from "@/features/case-studies/actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  companySlug: string;
};

/** Dashboard: create + send confirmation email in one submit. */
export function CaseStudyCreateForm({ companySlug }: Props) {
  return (
    <WorkspaceCard>
      <form action={createCaseStudyWithConfirm} className="grid gap-3">
        <input type="hidden" name="company_slug" value={companySlug} />
        <input type="hidden" name="back" value="/dashboard/cases" />

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Project title
          </span>
          <Input name="title" required placeholder="Vienna HQ fit-out" />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            What was delivered
          </span>
          <Input
            name="summary"
            required
            placeholder="Short summary for the public page"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Client email — send confirmation now
          </span>
          <Input
            type="email"
            name="email"
            required
            placeholder="client@company.com"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Partner company slug (optional)
          </span>
          <Input name="partner_slug" placeholder="partner-firm" />
          <span className="mt-1 block text-[11px] text-muted">
            If you worked with a Hansala partner, tag them here.
          </span>
        </label>

        <Button type="submit" className="h-10 w-fit px-4">
          Create &amp; send confirmation
        </Button>
      </form>
    </WorkspaceCard>
  );
}

import type { ReactNode } from "react";
import { createCaseStudyWithConfirm } from "@/features/case-studies/actions";
import { CaseStudyPreviewMock } from "@/components/case-studies/case-study-preview-mock";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  companySlug: string;
};

function StudioSection({
  step,
  title,
  children,
}: {
  step: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-line bg-surface p-5 sm:p-6">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        {step}
      </p>
      <h2 className="mt-2 font-display text-[18px] font-semibold tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

/** Short create flow — full story + photos in the editor after save. */
export function CaseStudyCreateStudio({ companySlug }: Props) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
      <form action={createCaseStudyWithConfirm} className="space-y-4">
        <input type="hidden" name="company_slug" value={companySlug} />
        <input type="hidden" name="back" value="/dashboard/cases/new" />

        <StudioSection step="01" title="Project hook">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Title
            </span>
            <Input name="title" required placeholder="Vienna HQ fit-out" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Summary — what makes someone click
            </span>
            <Textarea
              name="summary"
              required
              placeholder="One strong paragraph. You’ll add challenge, outcome, and photos next."
              className="min-h-[100px]"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink">Year</span>
              <Input
                name="year"
                defaultValue={new Date().getFullYear().toString()}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[12px] font-medium text-ink">
                Location
              </span>
              <Input name="location" placeholder="Vienna, AT" />
            </label>
          </div>
        </StudioSection>

        <StudioSection step="02" title="Client confirmation">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-ink">
              Client email
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
              Partner slug (optional)
            </span>
            <Input name="partner_slug" placeholder="partner-firm" />
          </label>
        </StudioSection>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" className="h-11 px-6">
            Create &amp; open editor
          </Button>
          <p className="text-[12px] text-muted">
            Next: cover photo, gallery, full story.
          </p>
        </div>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-muted uppercase">
            Public preview
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            This is the layout clients see — photos and narrative fill it in after
            you create.
          </p>
        </div>
        <CaseStudyPreviewMock />
      </aside>
    </div>
  );
}

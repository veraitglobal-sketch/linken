import { createUnclaimedPartner } from "@/features/partners/actions";
import { PartnerSearchSection } from "@/components/partners/partner-search-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Company } from "@/types/company";

type Props = {
  q: string;
  results: Company[];
  verified: boolean;
  statusBySlug: Map<string, string>;
  companySlug: string;
};

export function AddPartnerPanel({
  q,
  results,
  verified,
  statusBySlug,
  companySlug,
}: Props) {
  const back = "/dashboard/add?kind=partner";
  return (
    <div className="space-y-8">
      <PartnerSearchSection
        q={q}
        results={results}
        emptySearch={q.trim().length > 0 && results.length === 0}
        verified={verified}
        statusBySlug={statusBySlug}
        backPath={back}
        searchAction="/dashboard/add"
        searchKind="partner"
      />
      <section>
        <p className="text-[12px] font-semibold text-ink">Not listed — draft invite</p>
        <p className="mt-1 text-[12px] text-muted">
          They claim the page, then confirm. Nothing public until then.
        </p>
        <form action={createUnclaimedPartner} className="mt-3 grid gap-2.5">
          <input type="hidden" name="back" value={back} />
          <input type="hidden" name="invite_source" value="dashboard" />
          <Input name="name" required placeholder="Company name" />
          <div className="grid grid-cols-2 gap-2">
            <Input name="category" required placeholder="Category" />
            <Input name="city" required placeholder="City" />
          </div>
          <Input type="email" name="invite_email" placeholder="Email (optional)" />
          <Input name="website" placeholder="Website (optional)" />
          <label className="flex items-start gap-2 text-[12px] text-ink-soft">
            <input type="checkbox" name="send_invite" value="1" className="mt-0.5" />
            Send invite email now
          </label>
          <Button type="submit" className="h-10 w-fit px-4 text-[13px]">
            Save partner draft
          </Button>
        </form>
        <p className="mt-3 text-[12px] text-muted">
          Copy the pair later from Inbox → Partner requests → Confirmed record.
        </p>
      </section>
    </div>
  );
}

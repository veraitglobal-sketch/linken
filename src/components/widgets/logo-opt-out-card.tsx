import { setAllowLogoInPartnerWidgets } from "@/features/company/actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";

type Props = {
  allowed: boolean;
};

export function LogoOptOutCard({ allowed }: Props) {
  return (
    <WorkspaceCard>
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        Your logo in partner widgets
      </h3>
      <p className="mt-1 text-[12px] leading-relaxed text-[#64748b]">
        Allow partners to show our logo in their website widgets. Partnerships
        stay public either way — when off, they show your company name as text
        instead of the logo.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={setAllowLogoInPartnerWidgets}>
          <input type="hidden" name="allow_logo_in_partner_widgets" value="true" />
          <input type="hidden" name="back" value="/dashboard/widgets" />
          <Button
            type="submit"
            variant={allowed ? "primary" : "secondary"}
            className="h-9 px-3 text-[12px]"
          >
            Allow logo
          </Button>
        </form>
        <form action={setAllowLogoInPartnerWidgets}>
          <input
            type="hidden"
            name="allow_logo_in_partner_widgets"
            value="false"
          />
          <input type="hidden" name="back" value="/dashboard/widgets" />
          <Button
            type="submit"
            variant={!allowed ? "primary" : "secondary"}
            className="h-9 px-3 text-[12px]"
          >
            Name only
          </Button>
        </form>
      </div>
    </WorkspaceCard>
  );
}

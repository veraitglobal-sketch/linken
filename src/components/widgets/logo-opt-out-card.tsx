import { setAllowLogoInPartnerWidgets } from "@/features/company/actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { cn } from "@/lib/cn";

type Props = {
  allowed: boolean;
};

export function LogoOptOutCard({ allowed }: Props) {
  return (
    <section>
      <header className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          Logo in partner widgets
        </h2>
        <p className="text-[12px] font-medium text-plus">
          {allowed ? "Logo on" : "Name only"}
        </p>
      </header>

      <WorkspaceCard className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-[13px] leading-relaxed text-ink">
          {allowed
            ? "Partners may display your logo on their website widgets."
            : "Partners show your company name as text instead of the logo."}
        </p>
        <div className="flex rounded-xl border border-line bg-paper/60 p-1">
          <Toggle label="Allow logo" value="true" active={allowed} />
          <Toggle label="Name only" value="false" active={!allowed} />
        </div>
      </WorkspaceCard>
    </section>
  );
}

function Toggle({
  label,
  value,
  active,
}: {
  label: string;
  value: "true" | "false";
  active: boolean;
}) {
  return (
    <form action={setAllowLogoInPartnerWidgets}>
      <input type="hidden" name="allow_logo_in_partner_widgets" value={value} />
      <input type="hidden" name="back" value="/dashboard/widgets" />
      <button
        type="submit"
        className={cn(
          "h-9 rounded-lg px-3.5 text-[12px] font-semibold transition-colors",
          active
            ? "bg-navy text-white shadow-sm"
            : "text-ink hover:bg-surface",
        )}
      >
        {label}
      </button>
    </form>
  );
}

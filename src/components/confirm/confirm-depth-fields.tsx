import { confirmationLevelLabel } from "@/features/confirmations/meta";

type Props = {
  /** Hide optional depth when declining. */
  showDepth?: boolean;
};

/** Optional L2/L3 + named/undisclosed — L1 is the confirm submit itself. */
export function ConfirmDepthFields({ showDepth = true }: Props) {
  return (
    <div className="mt-5 space-y-4 rounded-2xl border border-line/70 bg-[#f7f8fa] px-4 py-4">
      {showDepth ? (
        <fieldset className="space-y-2">
          <legend className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
            Optional depth
          </legend>
          <label className="flex items-start gap-2.5 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              name="level_scope"
              value="1"
              className="mt-0.5"
            />
            <span>
              Scope and timeline look accurate ({confirmationLevelLabel(2)})
            </span>
          </label>
          <label className="flex items-start gap-2.5 text-[13px] text-ink-soft">
            <input
              type="checkbox"
              name="level_outcome"
              value="1"
              className="mt-0.5"
            />
            <span>
              Results described are accurate ({confirmationLevelLabel(3)})
            </span>
          </label>
        </fieldset>
      ) : null}
      <fieldset className="space-y-2">
        <legend className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
          How your company appears
        </legend>
        <label className="flex items-start gap-2.5 text-[13px] text-ink-soft">
          <input
            type="radio"
            name="disclosure"
            value="named"
            defaultChecked
            className="mt-0.5"
          />
          <span>Show my company name publicly</span>
        </label>
        <label className="flex items-start gap-2.5 text-[13px] text-ink-soft">
          <input
            type="radio"
            name="disclosure"
            value="undisclosed"
            className="mt-0.5"
          />
          <span>Keep my company undisclosed (still counts as confirmed)</span>
        </label>
      </fieldset>
    </div>
  );
}

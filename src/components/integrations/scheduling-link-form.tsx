import { saveSchedulingLink } from "@/features/scheduling/actions";
import type { CompanyScheduling } from "@/features/scheduling/types";

type Props = {
  scheduling: CompanyScheduling;
};

export function SchedulingLinkForm({ scheduling }: Props) {
  return (
    <section className="rounded-2xl bg-surface p-5 ring-1 ring-line/80">
      <h2 className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink">
        Or paste a booking link
      </h2>
      <p className="mt-1 text-[13px] text-muted">
        Works without OAuth — use your Calendly or Cal.com URL.
      </p>
      <form action={saveSchedulingLink} className="mt-4 grid gap-3">
        <label className="block">
          <span className="text-[12px] font-medium text-ink">Booking URL</span>
          <input
            name="scheduling_url"
            type="url"
            required
            defaultValue={scheduling.url ?? ""}
            placeholder="https://calendly.com/you/intro"
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[13px] text-ink outline-none placeholder:text-plus focus:border-navy/40"
          />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-ink">Button label</span>
          <input
            name="scheduling_label"
            type="text"
            maxLength={40}
            defaultValue={scheduling.label}
            className="mt-1.5 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[13px] text-ink outline-none focus:border-navy/40"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-navy px-4 text-[13px] font-semibold text-on-navy transition-colors hover:bg-navy-deep"
        >
          Save link
        </button>
      </form>
    </section>
  );
}

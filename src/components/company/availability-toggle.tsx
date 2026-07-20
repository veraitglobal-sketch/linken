import { setAcceptingClients } from "@/features/company/actions";
import { Button } from "@/components/ui/button";

type Props = {
  acceptingClients: boolean;
};

export function AvailabilityToggle({ acceptingClients }: Props) {
  return (
    <section className="rounded-[24px] border border-line bg-surface px-5 py-5">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
        Availability
      </p>
      <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        {acceptingClients ? "Accepting new clients" : "Fully booked"}
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        Shown on your public profile and verified one-pager.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <form action={setAcceptingClients}>
          <input type="hidden" name="accepting_clients" value="true" />
          <Button
            type="submit"
            variant={acceptingClients ? "primary" : "secondary"}
            className="h-10"
          >
            Accepting new clients
          </Button>
        </form>
        <form action={setAcceptingClients}>
          <input type="hidden" name="accepting_clients" value="false" />
          <Button
            type="submit"
            variant={!acceptingClients ? "primary" : "secondary"}
            className="h-10"
          >
            Fully booked
          </Button>
        </form>
      </div>
    </section>
  );
}

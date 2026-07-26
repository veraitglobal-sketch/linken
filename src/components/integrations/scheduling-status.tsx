import { disconnectScheduling } from "@/features/scheduling/actions";
import {
  providerLabel,
  type CompanyScheduling,
} from "@/features/scheduling/types";

type Props = {
  scheduling: CompanyScheduling;
  connected: boolean;
};

export function SchedulingStatus({ scheduling, connected }: Props) {
  if (!connected || !scheduling.provider || !scheduling.url) return null;

  return (
    <div className="mt-5 rounded-xl border border-line bg-paper/60 px-4 py-3">
      <p className="text-[13px] font-semibold text-ink">
        Connected · {providerLabel(scheduling.provider)}
      </p>
      <a
        href={scheduling.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 block truncate text-[12px] text-blue underline-offset-2 hover:underline"
      >
        {scheduling.url}
      </a>
      <form action={disconnectScheduling} className="mt-3">
        <button
          type="submit"
          className="text-[12px] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          Disconnect
        </button>
      </form>
    </div>
  );
}

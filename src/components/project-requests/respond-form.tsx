import { respondToProjectRequest } from "@/features/project-requests/firm-actions";
import { Button } from "@/components/ui/button";

type Props = {
  requestId: string;
  disabledReason?: string;
};

export function RespondForm({ requestId, disabledReason }: Props) {
  if (disabledReason) {
    return (
      <p className="mt-3 rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-ink-soft">
        {disabledReason}
      </p>
    );
  }

  return (
    <form action={respondToProjectRequest} className="mt-3 grid gap-2">
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="back" value="/dashboard/radar" />
      <textarea
        name="message"
        required
        minLength={20}
        rows={3}
        placeholder="Introduce your firm and how you would help"
        className="min-h-[5rem] w-full resize-none rounded-xl border border-[#e6eaf0] bg-white px-3.5 py-3 text-sm leading-relaxed text-ink outline-none placeholder:text-[#94a3b8] focus:border-ink"
      />
      <Button type="submit" variant="primary" className="h-10 w-fit px-4">
        Respond (1 credit)
      </Button>
    </form>
  );
}

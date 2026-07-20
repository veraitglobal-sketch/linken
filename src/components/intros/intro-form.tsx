import { sendIntro } from "@/features/intros/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  recipientCompanyId: string;
  recipientName: string;
  disabledReason?: string;
};

export function IntroForm({
  recipientCompanyId,
  recipientName,
  disabledReason,
}: Props) {
  if (disabledReason) {
    return (
      <p className="mt-3 rounded-xl border border-line bg-paper/60 px-3.5 py-2.5 text-[13px] text-ink">
        {disabledReason}
      </p>
    );
  }

  return (
    <form action={sendIntro} className="mt-3 grid gap-2">
      <input
        type="hidden"
        name="recipient_company_id"
        value={recipientCompanyId}
      />
      <input type="hidden" name="back" value="/dashboard/radar" />
      <p className="text-[12px] text-muted">
        Intro to {recipientName} · 2 credits
      </p>
      <Input
        name="offer"
        required
        minLength={5}
        placeholder="What are you offering?"
      />
      <Input
        name="why_relevant"
        required
        minLength={10}
        placeholder="Why is this relevant to them?"
      />
      <textarea
        name="message"
        required
        minLength={20}
        rows={3}
        placeholder="Short personal note"
        className="min-h-[5rem] w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-3 text-sm text-ink outline-none placeholder:text-muted focus:border-blue focus:bg-surface focus:ring-2 focus:ring-[rgba(126,184,164,0.22)]"
      />
      <Button type="submit" variant="primary" className="h-10 w-fit px-4">
        Send intro (2 credits)
      </Button>
    </form>
  );
}

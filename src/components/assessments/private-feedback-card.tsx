import type { PrivateFeedbackItem } from "@/features/assessments/queries";

type Props = {
  items: PrivateFeedbackItem[];
};

function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function PrivateFeedbackCard({ items }: Props) {
  return (
    <section className="rounded-[28px] border border-line bg-white px-5 py-6 sm:px-7 sm:py-7">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#1a5c51] uppercase">
        Client feedback (private)
      </p>
      <p className="mt-2 font-display text-xl font-medium tracking-[-0.03em] text-ink">
        Anonymous notes from confirmed clients
      </p>
      <p className="mt-1.5 text-[13px] text-ink-soft">
        Only you can see these. Assessor identity is never shown — so clients can
        be honest.
      </p>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-muted">
          No private feedback yet. It appears after a client confirms and leaves a
          note.
        </p>
      ) : (
        <ul className="mt-5 flex flex-col gap-3 border-t border-line pt-4">
          {items.map((item, index) => (
            <li
              key={`${item.feedbackMonth}-${index}`}
              className="rounded-2xl border border-line bg-[#f7f8fa] px-4 py-3.5"
            >
              <p className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
                {formatMonth(item.feedbackMonth)}
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
                {item.feedback}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

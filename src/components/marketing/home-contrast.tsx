import { ConfirmChecklist } from "@/components/marketing/confirm-checklist";

const weak = [
  {
    n: "01",
    title: "Logo walls",
    body: "Anyone can drop a logo. Clients cannot tell what is real.",
  },
  {
    n: "02",
    title: "One-sided claims",
    body: "Name-dropping without confirmation. No shared proof of work.",
  },
];

export function HomeContrast() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
        {weak.map((item) => (
          <article
            key={item.title}
            className="flex min-h-[280px] flex-col rounded-[28px] border border-line bg-surface px-6 py-8 shadow-[0_8px_28px_rgba(8,20,18,0.03)] transition-[border-color,box-shadow] duration-300 hover:border-[#cfd5d1] hover:shadow-[0_14px_40px_rgba(8,20,18,0.06)]"
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              {item.n}
            </p>
            <h3 className="mt-6 font-display text-3xl font-medium tracking-[-0.038em] text-ink">
              {item.title}
            </h3>
            <p className="mt-auto pt-10 text-sm leading-relaxed text-muted">
              {item.body}
            </p>
          </article>
        ))}
        <article className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[28px] bg-navy px-6 py-8 text-white shadow-[0_22px_56px_rgba(8,20,18,0.22)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-blue-soft/15 blur-3xl" />
          <p className="relative text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
            03 · Hansala
          </p>
          <h3 className="relative mt-6 font-display text-3xl font-medium tracking-[-0.038em]">
            Mutual confirmation
          </h3>
          <ConfirmChecklist
            items={[
              "Both companies must confirm",
              "Case studies credit both sides",
              "Partners get relevant visibility",
            ]}
          />
        </article>
      </div>
    </section>
  );
}

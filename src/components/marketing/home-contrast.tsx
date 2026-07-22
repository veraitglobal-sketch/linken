import { ConfirmChecklist } from "@/components/marketing/confirm-checklist";

/** A wall of anonymous logo tiles — washed out, one missing. */
function LogoWallGlyph() {
  return (
    <div aria-hidden className="mt-8 flex h-16 items-center gap-2.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex h-11 w-16 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9cfcb]" />
          <span className="h-1.5 w-5 rounded-full bg-[#d8ddd9]" />
        </div>
      ))}
      <div className="h-11 w-16 rounded-lg border border-dashed border-[#cfd5d1]" />
    </div>
  );
}

/** A claim that goes one way and never lands — the far side stays hollow. */
function OneWayGlyph() {
  return (
    <div aria-hidden className="mt-8 flex h-16 items-center gap-3">
      <div className="flex h-11 w-16 items-center justify-center gap-1.5 rounded-lg border border-line bg-paper">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9cfcb]" />
        <span className="h-1.5 w-5 rounded-full bg-[#d8ddd9]" />
      </div>
      <svg width="52" height="12" viewBox="0 0 52 12" fill="none" className="shrink-0">
        <path
          d="M2 6h40"
          stroke="#c2c9c4"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M42 1.5l6 4.5-6 4.5"
          stroke="#c2c9c4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="h-11 w-16 rounded-lg border border-dashed border-[#cfd5d1]" />
    </div>
  );
}

const weak = [
  {
    n: "01",
    title: "Logo walls",
    body: "Anyone can drop a logo. Clients cannot tell what is real.",
    glyph: <LogoWallGlyph />,
  },
  {
    n: "02",
    title: "One-sided claims",
    body: "Name-dropping without confirmation. No shared proof of work.",
    glyph: <OneWayGlyph />,
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
            {item.glyph}
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

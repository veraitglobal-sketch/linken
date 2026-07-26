import { ConfirmChecklist } from "@/components/marketing/confirm-checklist";
import { HomeSection } from "@/components/marketing/home-section";

function LogoWallGlyph() {
  return (
    <div aria-hidden className="mt-10 flex h-14 items-center gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="flex h-10 w-14 items-center justify-center gap-1.5 border border-line/80 bg-[#f7f8f7]"
        >
          <span className="h-2 w-2 rounded-full bg-[#c5cbc7]" />
          <span className="h-1 w-4 rounded-full bg-[#d5dad6]" />
        </div>
      ))}
      <div className="h-10 w-14 border border-dashed border-[#c8ceca]" />
    </div>
  );
}

function OneWayGlyph() {
  return (
    <div aria-hidden className="mt-10 flex h-14 items-center gap-3">
      <div className="flex h-10 w-14 items-center justify-center gap-1.5 border border-line/80 bg-[#f7f8f7]">
        <span className="h-2 w-2 rounded-full bg-[#c5cbc7]" />
        <span className="h-1 w-4 rounded-full bg-[#d5dad6]" />
      </div>
      <svg width="44" height="10" viewBox="0 0 44 10" fill="none" className="shrink-0">
        <path d="M1 5h34" stroke="#b8bfba" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M35 1.5l6 3.5-6 3.5"
          stroke="#b8bfba"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="h-10 w-14 border border-dashed border-[#c8ceca]" />
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
    <HomeSection tone="tight" className="!pb-24 sm:!pb-28">
      <div className="mx-auto grid max-w-6xl gap-px overflow-hidden rounded-[28px] bg-line shadow-[0_20px_60px_rgba(8,20,18,0.06)] md:grid-cols-3">
        {weak.map((item) => (
          <article
            key={item.title}
            className="flex min-h-[300px] flex-col bg-surface px-7 py-9 sm:px-8"
          >
            <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
              {item.n}
            </p>
            <h3 className="mt-7 font-display text-[1.85rem] font-medium tracking-[-0.038em] text-ink sm:text-[2rem]">
              {item.title}
            </h3>
            {item.glyph}
            <p className="mt-auto pt-12 text-[14px] leading-relaxed text-muted">
              {item.body}
            </p>
          </article>
        ))}
        <article className="relative flex min-h-[300px] flex-col overflow-hidden bg-navy px-7 py-9 text-white sm:px-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 100% 0%, rgba(126,184,164,0.18), transparent 55%)",
            }}
            aria-hidden
          />
          <p className="relative text-[11px] font-semibold tracking-[0.16em] text-blue-soft uppercase">
            03 · Hansala
          </p>
          <h3 className="relative mt-7 font-display text-[1.85rem] font-medium tracking-[-0.038em] sm:text-[2rem]">
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
    </HomeSection>
  );
}

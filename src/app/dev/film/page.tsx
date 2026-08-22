import { notFound } from "next/navigation";
import { EndCard } from "@/app/dev/film/end-card";
import { Reel } from "@/app/dev/film/reel";
import { FlowShot } from "@/app/dev/film/flow-shot";
import { WallShot } from "@/app/dev/film/wall-shot";

export const dynamic = "force-dynamic";

/** Film set. Dev only — nothing here is ever served to a visitor. */
export default function DevFilmPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-[1360px] px-6 py-10 pb-24">
      <p className="text-[11px] font-semibold tracking-[0.14em] text-[#7eb8a4] uppercase">
        Dev only · film set
      </p>
      <h1 className="mt-2 font-display text-[28px] font-medium tracking-[-0.04em] text-ink">
        Shots
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] text-ink-soft">
        Record the framed rectangle only — 1280×720 CSS, which is a 2560×1440
        master on a retina display. Turn Reduce Motion off before filming.
      </p>

      <div className="mt-10 space-y-14">
        <Shot
          n="00"
          title="The reel — one take"
          note="The whole cut, on the voiceover's timeline. Record this and you have the film."
        >
          <Reel />
        </Shot>
        <Shot n="01" title="How a record is made" note="14.2s · the whole arc, one take">
          <FlowShot />
        </Shot>
        <Shot n="02" title="The wall" note="What the confirmations turn into">
          <WallShot />
        </Shot>
        <Shot n="03" title="End card" note="Built, not generated — video models mangle lettering">
          <EndCard />
        </Shot>
      </div>
    </main>
  );
}

function Shot({
  n,
  title,
  note,
  children,
}: {
  n: string;
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.14em] text-plus uppercase">
          Shot {n}
        </p>
        <h2 className="mt-1 font-display text-xl font-medium tracking-[-0.03em] text-ink">
          {title}
        </h2>
        <p className="mt-1 text-[13px] text-muted">{note}</p>
      </div>
      {children}
    </section>
  );
}

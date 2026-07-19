import { ShareMomentGraph } from "@/components/marketing/share-moment-graph";

export function HomeTalks() {
  return (
    <section className="px-4 pb-28">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-[13px] font-medium text-[#1f6b5c]">
          The share moment
        </p>
        <h2 className="mt-4 text-center font-display text-[clamp(2.5rem,6.5vw,4.6rem)] font-medium leading-[1.06] tracking-[-0.05em] text-ink">
          Send one link.
          <span className="mt-2 block text-ink/35">Bring the whole team.</span>
        </h2>
        <ShareMomentGraph />
      </div>
    </section>
  );
}

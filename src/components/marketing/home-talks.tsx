import { ShareMomentGraph } from "@/components/marketing/share-moment-graph";

export function HomeTalks() {
  return (
    <section className="px-6 py-24 sm:px-8 sm:py-28 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-[12px] font-semibold tracking-[0.14em] text-blue uppercase">
          The share moment
        </p>
        <h2 className="mt-4 text-center font-display text-[clamp(2.5rem,6.5vw,4.6rem)] font-medium leading-[1.08] tracking-[-0.052em] text-ink">
          Send one link.
          <span className="mt-2 block text-ink/28">Bring the whole team.</span>
        </h2>
        <ShareMomentGraph />
      </div>
    </section>
  );
}

import Image from "next/image";

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
        <div className="mx-auto mt-12 flex max-w-lg items-center justify-center gap-3">
          {[
            "/images/portrait-2.jpg",
            "/images/portrait-1.jpg",
            "/images/site-work.jpg",
          ].map((src, i) => (
            <div key={src} className="flex items-center gap-3">
              <span className="relative h-[72px] w-[72px] overflow-hidden rounded-2xl shadow-[var(--shadow)]">
                <Image src={src} alt="" fill className="object-cover" sizes="72px" />
              </span>
              {i < 2 ? <span className="h-px w-8 bg-line sm:w-12" /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

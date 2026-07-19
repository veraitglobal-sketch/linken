import Image from "next/image";

const places = [
  "Website",
  "Google Business",
  "Proposals",
  "WhatsApp",
  "Email signature",
];

export function HomeHighlights() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-[13px] font-medium text-[#1f6b5c]">Highlights</p>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-[-0.04em] text-ink sm:text-5xl">
            One link firms are proud to send.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Partners get relevant visibility. You look like a complete delivery
            team — with proof, not decoration.
          </p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {places.map((place) => (
              <li
                key={place}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-ink-soft"
              >
                {place}
              </li>
            ))}
          </ul>
        </div>
        <div className="group relative aspect-[5/4] overflow-hidden rounded-[32px]">
          <Image
            src="/images/site-work.jpg"
            alt="Teams collaborating on a real project"
            fill
            className="media-zoom object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-display text-xl text-white sm:text-2xl">
            Your network travels with every share.
          </p>
        </div>
      </div>
    </section>
  );
}

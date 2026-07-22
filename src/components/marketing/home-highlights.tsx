import Image from "next/image";
import { EmbedCodePreview } from "@/components/marketing/embed-code-preview";

export function HomeHighlights() {
  return (
    <section className="px-4 pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <h2 className="font-display text-4xl font-medium tracking-[-0.042em] text-ink sm:text-5xl">
            One link firms are proud to send.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Partners get relevant visibility. You look like a complete delivery
            team — with proof, not decoration.
          </p>
          <EmbedCodePreview />
        </div>
        <div className="group relative aspect-[5/4] overflow-hidden rounded-[32px] shadow-[0_24px_60px_rgba(8,20,18,0.14)] ring-1 ring-line">
          <Image
            src="/images/highlight-share.jpg"
            alt="Teams collaborating on a real project"
            fill
            quality={88}
            className="media-zoom object-cover object-[center_32%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 via-navy/15 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-display text-xl leading-snug tracking-[-0.025em] text-white sm:text-2xl">
            Your network travels with every share.
          </p>
        </div>
      </div>
    </section>
  );
}

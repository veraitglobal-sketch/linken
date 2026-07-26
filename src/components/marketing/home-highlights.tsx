import Image from "next/image";
import { EmbedCodePreview } from "@/components/marketing/embed-code-preview";
import {
  HomeEyebrow,
  HomeSection,
} from "@/components/marketing/home-section";

export function HomeHighlights() {
  return (
    <HomeSection tone="tight">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div>
          <HomeEyebrow>On your site</HomeEyebrow>
          <h2 className="mt-5 font-display text-[clamp(2rem,4vw,3rem)] font-medium tracking-[-0.042em] text-ink">
            One link firms are proud to send.
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-ink-soft">
            Partners get relevant visibility. You look like a complete delivery
            team — with proof, not decoration.
          </p>
          <EmbedCodePreview />
        </div>
        <div className="group relative aspect-[5/4] overflow-hidden rounded-[28px] shadow-[0_24px_64px_rgba(8,20,18,0.14)] ring-1 ring-black/[0.04]">
          <Image
            src="/images/highlight-share.jpg"
            alt="Teams collaborating on a real project"
            fill
            quality={80}
            className="media-zoom object-cover object-[center_32%]"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 sm:p-8">
            <p className="font-display text-xl leading-snug tracking-[-0.025em] text-white sm:text-2xl">
              Your network travels with every share.
            </p>
            <p className="mt-2 text-[13px] text-white/55">
              Embeds and profile links — same confirmed facts.
            </p>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}

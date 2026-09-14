import Image from "next/image";
import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";

export function OfferPlate() {
  return (
    <figure className="mx-auto w-full max-w-[26rem] lg:mx-0 lg:max-w-none">
      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line bg-mute shadow-card">
        <Image
          src="/images/offer-emboss.webp"
          alt="The Hansala mark blind-embossed on a sheet of cotton paper"
          fill
          quality={75}
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 1024px) 26rem, 440px"
        />
      </div>
      <figcaption className="mt-5 flex items-center gap-5">
        <EmbedVerifiedLockup size="lg" />
        <span className="h-11 w-px shrink-0 bg-line" aria-hidden />
        <div className="min-w-0">
          <p className="font-label text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
            Earned, not bought
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
            The Verified mark is never sold.
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

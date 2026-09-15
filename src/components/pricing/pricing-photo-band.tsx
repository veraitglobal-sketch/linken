import Image from "next/image";
import { HomePill } from "@/components/marketing/home-section";

/** Centred photo band — headline, one wide photograph, one line, one button. */
export function PricingPhotoBand({
  title,
  lead,
  src,
  alt,
  href,
  cta,
  focus = "object-center",
}: {
  title: string;
  lead: string;
  src: string;
  alt: string;
  href: string;
  cta: string;
  focus?: string;
}) {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pt-24 text-center sm:px-[18px]">
      <h2 className="mx-auto max-w-[22ch] font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-ink text-balance">
        {title}
      </h2>
      <div className="relative mx-auto mt-12 aspect-[16/9] w-full max-w-[900px] overflow-hidden rounded-[24px] ring-1 ring-line/60 sm:rounded-[32px]">
        <Image
          src={src}
          alt={alt}
          fill
          quality={75}
          loading="lazy"
          className={`object-cover ${focus}`}
          sizes="(max-width: 960px) 100vw, 900px"
        />
      </div>
      <p className="mx-auto mt-8 max-w-[52ch] text-[17px] leading-relaxed text-ink-soft">
        {lead}
      </p>
      <div className="mt-8 flex justify-center">
        <HomePill href={href}>{cta}</HomePill>
      </div>
    </section>
  );
}

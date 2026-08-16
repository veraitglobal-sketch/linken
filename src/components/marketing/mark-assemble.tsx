import Image from "next/image";

/**
 * Homepage §5a — facade carries the mark (carved in the photo).
 * Copy sits left on a navy scrim; no second SVG logo over the carved sign.
 */
export function MarkAssemble() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mark-stage relative mx-auto w-full max-w-6xl overflow-hidden rounded-hero shadow-chapter">
        <Image
          src="/images/mark-facade.webp"
          alt=""
          fill
          quality={78}
          draggable={false}
          className="pointer-events-none select-none object-cover object-[72%_center]"
          sizes="(max-width: 1152px) 100vw, 1152px"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-deep via-navy-deep/88 via-40% to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[42%] bg-gradient-to-l from-navy/25 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 stage-grain opacity-[0.28]"
          aria-hidden
        />

        <div className="relative flex min-h-[420px] flex-col justify-end px-8 py-12 sm:min-h-[480px] sm:px-12 sm:py-16 lg:max-w-[48%]">
          <p className="animate-rise text-[11px] font-semibold tracking-[0.16em] text-blue-soft/85 uppercase">
            Two sides
          </p>
          <p className="animate-rise-delay mt-5 font-display text-chapter text-white text-balance">
            Hansala
          </p>
          <p className="animate-rise-late mt-3 max-w-sm text-[14px] leading-relaxed text-white/55 sm:text-[15px]">
            Two companies. One confirmation.
          </p>
        </div>
      </div>
    </div>
  );
}

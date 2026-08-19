import Image from "next/image";

/**
 * Homepage §5a — facade carries the mark (carved in the photo).
 * Full-bleed plate; copy left on a navy scrim. No second SVG logo.
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
          className="pointer-events-none select-none object-cover object-[70%_center]"
          sizes="(max-width: 1152px) 100vw, 1152px"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-deep from-[48%] via-navy-deep/45 to-transparent lg:hidden"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-navy-deep via-navy-deep/90 via-35% to-transparent lg:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy-deep/50 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 stage-grain opacity-[0.28]"
          aria-hidden
        />

        <div className="relative flex min-h-[360px] flex-col justify-end px-8 py-12 sm:min-h-[420px] sm:px-12 sm:py-16 lg:min-h-[480px] lg:max-w-[48%] lg:justify-center">
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

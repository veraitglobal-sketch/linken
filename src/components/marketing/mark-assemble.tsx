import Image from "next/image";

/**
 * Homepage §5a — facade carries the mark (carved in the photo).
 * Copy on a navy scrim beside it on desktop, stacked beneath it on a phone.
 * No second SVG logo.
 *
 * The photograph is the section's whole argument: Hansala's mark, two nodes
 * and a link, cut into a concrete wall. If the mark is not whole, the section
 * says nothing.
 *
 * On a phone it was not whole. Measured at 375: the carved mark occupies
 * 39.6%–59.1% of the image's height, the copy's scrim went opaque from 52%
 * down, and the bottom 26px of the mark — a third of it — sat under navy.
 *
 * `object-position` cannot fix that. With `object-cover` on a container
 * narrower than the image's 16:9, the image scales to the container's *height*,
 * so the full height is always shown and the vertical offset is exactly zero
 * whatever percentage is asked for. The mark is pinned to that band of the
 * frame by arithmetic.
 *
 * So the layers come apart instead of fighting: under `lg` the photograph gets
 * its own box and the copy sits on solid navy beneath it. From `lg` the copy
 * returns to its overlay, where there is width enough for a side scrim and the
 * mark is never covered.
 */
export function MarkAssemble() {
  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mark-stage relative mx-auto flex w-full max-w-6xl flex-col overflow-hidden rounded-hero shadow-chapter lg:block">
        {/* Its own box on a phone, the full plate from `lg`.
            16:10 is wider than the stage was, which enlarges the carved mark
            rather than shrinking it, and it ends above the copy instead of
            underneath it. */}
        <div className="relative aspect-[16/10] w-full lg:absolute lg:inset-0 lg:aspect-auto">
          <Image
            src="/images/mark-facade.webp"
            alt=""
            fill
            quality={75}
            draggable={false}
            /* Centred on a phone, where the mark has to be the subject; the
               desktop plate keeps the 70% framing that lets the copy sit on
               empty wall to the left. */
            className="pointer-events-none object-cover object-center select-none lg:object-[70%_center]"
            sizes="(max-width: 1152px) 100vw, 1152px"
            aria-hidden
          />
          {/* Only ever a foot of shade under the photo, to seat it against the
              copy block. Never far enough up to reach the mark. */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-navy-deep/45 to-transparent lg:hidden"
            aria-hidden
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-navy-deep via-navy-deep/90 via-35% to-transparent lg:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-navy-deep/50 to-transparent lg:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 stage-grain opacity-[0.28]"
          aria-hidden
        />

        <div className="relative flex flex-col justify-end bg-navy-deep px-8 py-10 sm:px-12 sm:py-12 lg:min-h-[480px] lg:max-w-[48%] lg:justify-center lg:bg-transparent lg:py-16">
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

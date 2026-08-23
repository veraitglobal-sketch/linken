"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A cover is not always a photograph, and a hero that assumes it is will wreck
 * the ones that are not.
 *
 * `object-cover` in a 1152×760 stage scales an image up until it fills, then
 * discards the rest. That is right for a photograph or a wide screenshot. Given
 * a square app icon it enlarges it about threefold and shows a fragment: on
 * BioVera the result was a piece of the mark blown across the whole header,
 * with its white shapes landing directly behind white headline type.
 *
 * So the treatment follows the picture. Nothing is detected by filename or
 * guessed from a field — the image reports its own dimensions once it loads,
 * and those decide:
 *
 * - **Photograph** — anything meaningfully wider than tall. Fills the stage as
 *   before; this is the case the hero was built for.
 * - **Mark** — square-ish, or simply small. Never enlarged past its own size.
 *   It sits contained in the corner, clear of the headline, over a heavily
 *   blurred and darkened copy of itself. The ambience therefore comes from the
 *   image's own colours rather than from a colour we invented for it.
 *
 * Measured client-side because that is the only place the natural size is
 * known. Until it loads the stage is plain navy, which is what it falls back to
 * anyway — no flash of a wrong crop.
 */

/** Wider than this and it is a picture; inside it, a mark. */
const PHOTO_RATIO = 1.35;
/** Below this a cover cannot fill a 1152px stage without being enlarged. */
const PHOTO_MIN_WIDTH = 900;

type Shape = "unknown" | "photo" | "mark";

export function CaseStudyCoverMedia({
  src,
  focusClass,
  sizes = "(max-width: 768px) 100vw, 1152px",
  priority = false,
}: {
  src: string;
  focusClass: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [shape, setShape] = useState<Shape>("unknown");

  function classify(img: HTMLImageElement) {
    const { naturalWidth: w, naturalHeight: h } = img;
    if (!w || !h) return;
    const ratio = w / h;
    setShape(ratio >= PHOTO_RATIO && w >= PHOTO_MIN_WIDTH ? "photo" : "mark");
  }

  if (shape === "mark") {
    return (
      <>
        {/* Its own colours, out of focus. `scale-110` hides the soft edge a
            large blur leaves at the boundary. */}
        <Image
          src={src}
          alt=""
          fill
          priority={priority}
          sizes={sizes}
          className="scale-110 object-cover opacity-40 blur-3xl"
        />
        {/* No crisp copy in the corner.
            One was drawn here at first and never appeared: the opener paints its
            scrim after the media, so it covered it. Worth knowing before anyone
            adds it back — but the ambient ground is enough on its own, and a
            mark repeated in the header competes with the title. The picture
            itself belongs where pictures are shown at a size worth showing. */}
      </>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      priority={priority}
      sizes={sizes}
      onLoad={(e) => classify(e.currentTarget)}
      className={`media-zoom object-cover ${focusClass} ${
        shape === "unknown" ? "opacity-0" : "opacity-100"
      } transition-opacity duration-500`}
    />
  );
}

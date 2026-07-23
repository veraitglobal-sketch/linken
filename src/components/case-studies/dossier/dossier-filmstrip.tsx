"use client";

import Image from "next/image";
import { useRef } from "react";

type Props = { urls: string[]; title: string };

/** Horizontal filmstrip — not a generic grid. */
export function DossierFilmstrip({ urls, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  if (!urls.length) return null;

  return (
    <section>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-blue uppercase">
            Photo exhibit
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-[-0.04em] text-ink">
            {urls.length} frames from the field
          </h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <ScrollBtn target={ref} dir="left" />
          <ScrollBtn target={ref} dir="right" />
        </div>
      </header>

      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((url, i) => (
          <figure
            key={url}
            className="relative w-[min(78vw,520px)] shrink-0 snap-center overflow-hidden rounded-[24px] bg-paper"
          >
            <div className="relative aspect-[3/4] sm:aspect-[4/5]">
              <Image
                src={url}
                alt={`${title} — ${i + 1}`}
                fill
                className="object-cover"
                sizes="520px"
              />
            </div>
            <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#081412]/90 to-transparent px-4 py-3 font-mono text-[11px] text-white/70">
              EX-{String(i + 1).padStart(2, "0")}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function ScrollBtn({
  target,
  dir,
}: {
  target: React.RefObject<HTMLDivElement | null>;
  dir: "left" | "right";
}) {
  return (
    <button
      type="button"
      aria-label={dir === "left" ? "Scroll left" : "Scroll right"}
      onClick={() =>
        target.current?.scrollBy({
          left: dir === "left" ? -400 : 400,
          behavior: "smooth",
        })
      }
      className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-lg text-ink hover:bg-paper"
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}

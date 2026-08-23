"use client";

import Image from "next/image";
import { useRef } from "react";

type Props = { urls: string[]; title: string };

export function DossierFilmstrip({ urls, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  if (!urls.length) return null;

  return (
    <section className="overflow-hidden">
      <div className="mx-auto mb-8 max-w-3xl px-6">
        <h2 className="font-display text-2xl font-medium tracking-[-0.035em] text-[var(--cf-ink)]">
          On site
        </h2>
      </div>
      <div
        ref={ref}
        className="flex snap-x snap-mandatory gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {urls.map((url, i) => (
          <figure key={url} className="relative w-[min(88vw,640px)] shrink-0 snap-center">
            {/* Whole, not cropped.
                This box is portrait and the fill was `object-cover`, which
                scales an image until it covers and throws the rest away. A
                phone screenshot survives that; a wide wordmark does not — the
                ReinAllround logo was enlarged until it ran off both edges and
                only the middle of the word was left on screen.
                A gallery exists to show the picture. `object-contain` keeps
                every shape intact and letterboxes instead, on a ground rather
                than on nothing so a transparent PNG still has something behind
                it. Letterboxing is the honest cost; cropping a logo in half is
                not a cost, it is a fault. */}
            <div className="relative aspect-[4/5] bg-[var(--cf-muted,#0d1210)]/[0.04] sm:aspect-[3/4]">
              <Image
                src={url}
                alt={`${title} — ${i + 1}`}
                fill
                className="object-contain"
                sizes="640px"
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

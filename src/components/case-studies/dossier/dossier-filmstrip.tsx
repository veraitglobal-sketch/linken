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
            <div className="relative aspect-[4/5] sm:aspect-[3/4]">
              <Image src={url} alt={`${title} — ${i + 1}`} fill className="object-cover" sizes="640px" />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

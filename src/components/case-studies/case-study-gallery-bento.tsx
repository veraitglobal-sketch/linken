"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  urls: string[];
  title: string;
};

/** Bento-style gallery — editorial, not a generic grid. */
export function CaseStudyGalleryBento({ urls, title }: Props) {
  const [active, setActive] = useState(0);
  if (!urls.length) return null;

  const hero = urls[active] ?? urls[0]!;
  const rest = urls.filter((_, i) => i !== active).slice(0, 4);

  return (
    <section>
      <header className="mb-5 px-0.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Project gallery
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
          The work, up close.
        </h2>
      </header>

      <div className="grid gap-2 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-paper lg:aspect-auto lg:min-h-[420px]">
          <Image
            src={hero}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 720px"
            priority
          />
        </div>
        {rest.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {urls.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setActive(i)}
                className={`relative aspect-[4/3] overflow-hidden rounded-2xl ring-2 transition-all ${
                  i === active
                    ? "ring-blue"
                    : "ring-transparent opacity-90 hover:opacity-100"
                }`}
              >
                <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

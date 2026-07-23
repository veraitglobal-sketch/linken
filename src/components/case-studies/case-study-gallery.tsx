"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  urls: string[];
  title: string;
};

export function CaseStudyGallery({ urls, title }: Props) {
  const [active, setActive] = useState(0);
  if (!urls.length) return null;

  const safeActive = Math.min(active, urls.length - 1);

  return (
    <section>
      <div className="mb-4 px-0.5">
        <p className="text-[11px] font-semibold tracking-[0.14em] text-blue uppercase">
          Project gallery
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-medium tracking-[-0.035em] text-ink">
          See the work in detail.
        </h2>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_14px_48px_rgba(8,20,18,0.06)]">
        <div className="group relative aspect-[16/10] w-full overflow-hidden bg-paper sm:aspect-[16/9]">
          <Image
            src={urls[safeActive]!}
            alt={`${title} — photo ${safeActive + 1}`}
            fill
            className="media-zoom object-cover"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority={safeActive === 0}
          />
        </div>

        {urls.length > 1 ? (
          <div className="grid grid-cols-4 gap-2 border-t border-line bg-paper/60 p-3 sm:grid-cols-6">
            {urls.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => setActive(i)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-xl border transition-all ${
                  i === safeActive
                    ? "border-blue ring-2 ring-[rgba(126,184,164,0.35)]"
                    : "border-line opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="120px"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

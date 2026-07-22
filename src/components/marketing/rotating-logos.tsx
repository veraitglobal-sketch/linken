"use client";

import { useEffect, useState } from "react";
import type { EmbedProofCompany } from "@/components/embed/embed-brand";
import { EmbedBareLogo } from "@/components/embed/embed-bare-logo";

type Props = {
  logos: EmbedProofCompany[];
  intervalMs?: number;
};

/** One slot, one logo at a time — crossfades to the next on an interval.
 * Drop real PNGs into the logo list; the slot just keeps cycling them. */
export function RotatingLogos({ logos, intervalMs = 2200 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (logos.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % logos.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [logos.length, intervalMs]);

  return (
    <div className="relative h-9 w-32">
      {logos.map((logo, i) => (
        <div
          key={logo.name}
          className="absolute inset-0 flex items-center transition-opacity duration-700 ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
          aria-hidden={i !== index}
        >
          <EmbedBareLogo
            name={logo.name}
            initials={logo.initials}
            logoUrl={logo.logoUrl}
            theme="light"
            size="md"
          />
        </div>
      ))}
    </div>
  );
}

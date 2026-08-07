import type { Metadata } from "next";
import { companyIndexability } from "@/features/seo/indexability";
import { absoluteUrl, companyPath } from "@/features/seo/paths";

type Input = {
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  city?: string;
  country?: string;
  category?: string;
  claimed?: boolean | null;
  verified?: boolean;
  siteUrl: string;
};

function metaDescription(input: Input): string {
  const base =
    input.tagline?.trim() ||
    input.description?.trim().slice(0, 160) ||
    `${input.name} on Hansala`;
  const place = [input.city, input.country].filter(Boolean).join(", ");
  const bits = [base];
  if (input.category) bits.push(input.category);
  if (place) bits.push(place);
  if (input.verified) {
    bits.push("Domain verified. Confirmed relationships only.");
  } else {
    bits.push("Mutually confirmed relationships.");
  }
  return bits.join(" · ").slice(0, 320);
}

export function buildCompanyMetadata(input: Input): Metadata {
  const url = absoluteUrl(input.siteUrl, companyPath(input.slug));
  const description = metaDescription(input);
  const { index, follow } = companyIndexability(input);
  const title = input.name;

  return {
    title,
    description,
    robots: { index, follow },
    alternates: {
      canonical: url,
      types: {
        "text/markdown": `${url}/llm.md`,
      },
    },
    openGraph: {
      type: "profile",
      title: `${input.name} · Hansala`,
      description,
      url,
      siteName: "Hansala",
    },
    twitter: {
      card: "summary_large_image",
      title: `${input.name} · Hansala`,
      description,
    },
  };
}

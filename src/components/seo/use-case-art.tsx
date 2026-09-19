import type { ComponentType } from "react";
import {
  ArtClientRefs,
  ArtPortfolio,
  ArtSupplier,
  ArtTenders,
} from "@/components/seo/use-case-art-jobs";
import {
  ArtAgency,
  ArtArchitecture,
  ArtContractor,
  ArtEngineering,
} from "@/components/seo/use-case-art-sectors";

const ART: Record<string, ComponentType> = {
  "verified-client-references": ArtClientRefs,
  "verified-project-portfolio": ArtPortfolio,
  "references-for-tenders": ArtTenders,
  "supplier-verification": ArtSupplier,
  "contractor-qualification": ArtContractor,
  "architecture-firm-references": ArtArchitecture,
  "engineering-company-references": ArtEngineering,
  "agency-case-study-verification": ArtAgency,
};

export function UseCaseArt({ slug }: { slug: string }) {
  const Comp = ART[slug];
  return Comp ? <Comp /> : null;
}

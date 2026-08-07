import type { UseCasePage } from "@/features/seo/use-cases/types";
import { agencyCaseStudy } from "@/features/seo/use-cases/pages/agency";
import { architectureRefs } from "@/features/seo/use-cases/pages/architecture";
import { contractorQual } from "@/features/seo/use-cases/pages/contractor";
import { engineeringRefs } from "@/features/seo/use-cases/pages/engineering";
import { projectPortfolio } from "@/features/seo/use-cases/pages/portfolio";
import { clientReferences } from "@/features/seo/use-cases/pages/references";
import { supplierVerification } from "@/features/seo/use-cases/pages/supplier";
import { tenderReferences } from "@/features/seo/use-cases/pages/tenders";

const PAGES: UseCasePage[] = [
  clientReferences,
  projectPortfolio,
  tenderReferences,
  supplierVerification,
  contractorQual,
  architectureRefs,
  engineeringRefs,
  agencyCaseStudy,
];

const BY_SLUG = new Map(PAGES.map((p) => [p.slug, p]));

export function listUseCases(): UseCasePage[] {
  return PAGES;
}

export function getUseCase(slug: string): UseCasePage | null {
  return BY_SLUG.get(slug) ?? null;
}

export function listUseCaseSlugs(): string[] {
  return PAGES.map((p) => p.slug);
}

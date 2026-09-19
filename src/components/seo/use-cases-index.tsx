import { HomeClose } from "@/components/marketing/home-close";
import { UseCasesIndexHero } from "@/components/seo/use-cases-index-hero";
import { UseCasesIndexJobs } from "@/components/seo/use-cases-index-jobs";
import { UseCasesIndexSectors } from "@/components/seo/use-cases-index-sectors";
import {
  listUseCaseJobs,
  listUseCaseSectors,
} from "@/features/seo/use-cases/catalog";

export function UseCasesIndex() {
  return (
    <div className="home-wash bg-wash">
      <UseCasesIndexHero />
      <UseCasesIndexJobs pages={listUseCaseJobs()} />
      <UseCasesIndexSectors pages={listUseCaseSectors()} />
      <HomeClose />
    </div>
  );
}

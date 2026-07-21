import { HowHansalaWorks } from "@/components/product/how-linken-works";
import { PRODUCT } from "@/lib/product-model";

/** Short note — branches are advanced, not the main story. */
export function StructureHowItWorks() {
  return (
    <div className="space-y-4">
      <HowHansalaWorks compact />
      <div className="rounded-2xl border border-line bg-paper/50 px-5 py-4 sm:px-6">
        <p className="text-[10px] font-semibold tracking-[0.12em] text-plus uppercase">
          {PRODUCT.structure.label}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
          {PRODUCT.structure.job} Most companies only need Company + Map.
        </p>
      </div>
    </div>
  );
}

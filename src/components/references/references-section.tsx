import { AddReferenceForm } from "@/components/references/add-reference-form";
import { ReferenceCard } from "@/components/references/reference-card";
import type { ServiceReference } from "@/types/service-reference";

type Props = {
  references: ServiceReference[];
  editable?: boolean;
};

export function ReferencesSection({ references, editable = false }: Props) {
  if (references.length === 0 && !editable) return null;

  return (
    <section
      id="references"
      className="scroll-mt-24 rounded-[28px] border border-line bg-surface px-5 py-6 sm:px-7 sm:py-7"
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember uppercase">
        References
      </p>
      <h2 className="mt-2 font-display text-[clamp(1.45rem,2.4vw,1.85rem)] font-medium tracking-[-0.035em] text-ink">
        Clients we work for
      </h2>
      <p className="mt-2 max-w-xl text-[13px] text-ink-soft">
        Service relationships. “Confirmed” appears only after the client verifies.
      </p>

      {references.length > 0 ? (
        <div className="mt-5 flex flex-col gap-2.5">
          {references.map((reference) => (
            <ReferenceCard
              key={reference.id}
              reference={reference}
              editable={editable}
            />
          ))}
        </div>
      ) : null}

      {editable ? (
        <div className={references.length > 0 ? "mt-5" : "mt-5"}>
          <AddReferenceForm />
        </div>
      ) : null}
    </section>
  );
}

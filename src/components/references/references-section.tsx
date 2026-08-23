import { AddReferenceForm } from "@/components/references/add-reference-form";
import { ReferenceCard } from "@/components/references/reference-card";
import type { ServiceReference } from "@/types/service-reference";

type Props = {
  references: ServiceReference[];
  editable?: boolean;
  companySlug: string;
};

export function ReferencesSection({
  references,
  editable = false,
  companySlug,
}: Props) {
  if (references.length === 0 && !editable) return null;

  return (
    <section
      id="references"
      className="scroll-mt-24 rounded-chapter border border-line bg-surface px-6 py-8 sm:px-9 sm:py-9"
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-ember-deep uppercase">
        References
      </p>
      <h2 className="mt-2 font-display text-section text-ink">
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
              companySlug={companySlug}
            />
          ))}
        </div>
      ) : null}

      {editable ? (
        <div className="mt-5">
          <AddReferenceForm companySlug={companySlug} />
        </div>
      ) : null}
    </section>
  );
}

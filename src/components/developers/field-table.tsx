import type { FieldRow } from "@/components/developers/docs-content";

type Props = {
  fields: FieldRow[];
};

export function FieldTable({ fields }: Props) {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-line">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-paper/80">
            <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              Field
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              Type
            </th>
            <th className="px-3 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr
              key={field.name}
              className="border-b border-line last:border-b-0"
            >
              <td className="px-3 py-2.5 align-top font-mono text-[12px] text-ink">
                {field.name}
              </td>
              <td className="px-3 py-2.5 align-top font-mono text-[11px] text-ink-soft">
                {field.type}
              </td>
              <td className="px-3 py-2.5 align-top text-[12px] leading-relaxed text-ink-soft sm:text-[13px]">
                {field.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

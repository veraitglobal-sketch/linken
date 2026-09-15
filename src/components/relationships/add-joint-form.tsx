import { createJointCompany } from "@/features/relationships/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PartnerOption = { id: string; name: string };

export function AddJointForm({
  partners,
  category,
  city,
}: {
  partners: PartnerOption[];
  category: string;
  city: string;
}) {
  if (partners.length === 0) {
    return (
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Confirm a partner first. Then you can add a joint company they also own.
      </p>
    );
  }

  return (
    <form action={createJointCompany} className="grid gap-3">
      <input type="hidden" name="back" value="/dashboard/add?kind=joint" />
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Creates the firm, then asks the partner to confirm. After they accept,
        both of you can open it in the workspace switcher. Optional share %.
      </p>
      <Input name="name" required placeholder="Joint company name" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="category" required defaultValue={category} placeholder="Category" />
        <Input name="city" required defaultValue={city} placeholder="City" />
      </div>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          Also owned by
        </span>
        <select
          name="co_parent_company_id"
          required
          className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 text-sm text-ink"
        >
          <option value="">Choose a confirmed partner</option>
          {partners.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-ink">
          Their share % (optional)
        </span>
        <Input
          type="number"
          name="ownership_percentage"
          min={1}
          max={100}
          step="0.01"
          defaultValue="50"
          placeholder="50"
        />
      </label>
      <Button type="submit" className="h-10 w-fit px-4">
        Propose joint company
      </Button>
    </form>
  );
}

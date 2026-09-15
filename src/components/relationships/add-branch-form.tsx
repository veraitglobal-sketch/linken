import { createOwnedBranch } from "@/features/relationships/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AddBranchForm({ category, city }: { category: string; city: string }) {
  return (
    <form action={createOwnedBranch} className="grid gap-3">
      <input type="hidden" name="back" value="/dashboard/add?kind=branch" />
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Same owner. It appears on the map without a second confirmation.
      </p>
      <Input name="name" required placeholder="Branch name" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input name="category" required defaultValue={category} placeholder="Category" />
        <Input name="city" required defaultValue={city} placeholder="City" />
      </div>
      <Input name="country" placeholder="Country (optional)" />
      <Input name="website" type="url" placeholder="Website (optional)" />
      <Button type="submit" className="h-10 w-fit px-4">
        Add branch
      </Button>
    </form>
  );
}

import {
  leaveTeam,
  updateMyTeamProfile,
} from "@/features/team/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import type { TeamMember } from "@/features/team/types";

type Props = {
  companyId: string;
  me: TeamMember;
  needsSetup?: boolean;
};

export function EditMyTeamProfile({ companyId, me, needsSetup }: Props) {
  return (
    <WorkspaceCard>
      <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
        {needsSetup ? "Complete your team card" : "Edit my profile"}
      </h3>
      <p className="mt-0.5 text-[12px] text-[#64748b]">
        {needsSetup
          ? "Add your name and title. You stay hidden on the public profile until you opt in."
          : "Name, title, photo, and whether you appear on the public company page."}
      </p>
      <form
        action={updateMyTeamProfile}
        className="mt-4 grid gap-3 sm:grid-cols-2"
      >
        <input type="hidden" name="company_id" value={companyId} />
        <input type="hidden" name="back" value="/dashboard/team" />
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Display name
          </span>
          <Input
            name="display_name"
            required={needsSetup}
            defaultValue={me.displayName}
            placeholder="Your name"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Title
          </span>
          <Input
            name="title"
            defaultValue={me.displayTitle}
            placeholder="Founder / CEO"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-[12px] font-medium text-ink">
            Photo
          </span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-[13px] text-ink-soft file:mr-3 file:rounded-lg file:border-0 file:bg-[#f4f6f8] file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
          />
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-[#e8eaee] px-3 py-3 sm:col-span-2">
          <input
            type="checkbox"
            name="public_visible"
            value="1"
            defaultChecked={me.publicVisible}
            className="mt-1"
          />
          <span>
            <span className="block text-[13px] font-semibold text-ink">
              Show on public company profile
            </span>
            <span className="mt-0.5 block text-[12px] text-[#64748b]">
              Only your name, title, and photo — no personal page.
            </span>
          </span>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <Button type="submit" className="h-10">
            Save
          </Button>
        </div>
      </form>

      {me.role !== "owner" ? (
        <form action={leaveTeam} className="mt-4 border-t border-[#e8eaee] pt-4">
          <input type="hidden" name="company_id" value={companyId} />
          <input type="hidden" name="back" value="/dashboard/team" />
          <Button type="submit" variant="ghost" className="h-9 text-[12px]">
            Leave team
          </Button>
        </form>
      ) : (
        <p className="mt-4 border-t border-[#e8eaee] pt-4 text-[12px] text-[#94a3b8]">
          Owners cannot leave — transfer ownership first.
        </p>
      )}
    </WorkspaceCard>
  );
}

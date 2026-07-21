import { leaveTeam, updateMyTeamProfile } from "@/features/team/actions";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/ui/logo-mark";
import { initialsFromName, type TeamMember } from "@/features/team/types";

type Props = {
  companyId: string;
  me: TeamMember;
  needsSetup?: boolean;
};

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "Member";
}

export function EditMyTeamProfile({ companyId, me, needsSetup }: Props) {
  const name = me.displayName.trim() || "Your name";

  return (
    <section>
      <header className="mb-3">
        <h2 className="font-display text-[17px] font-semibold tracking-[-0.03em] text-ink">
          {needsSetup ? "Complete your team card" : "Your profile"}
        </h2>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          {needsSetup
            ? "Add name and title. Hidden on the public profile until you opt in."
            : "How you appear in the workspace — and optionally on the public page."}
        </p>
      </header>

      <WorkspaceCard>
        <div className="mb-5 flex flex-wrap items-center gap-3.5 border-b border-line pb-5">
          <LogoMark
            initials={initialsFromName(name)}
            logoUrl={me.photoUrl}
            size="lg"
            className="rounded-2xl"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
              {name}
            </p>
            <p className="mt-0.5 text-[12px] text-muted">
              {me.displayTitle.trim() || "No title yet"}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge tone={me.role === "owner" ? "success" : "neutral"}>
                {roleLabel(me.role)}
              </Badge>
              <Badge tone={me.publicVisible ? "success" : "neutral"}>
                {me.publicVisible ? "Public" : "Hidden"}
              </Badge>
            </div>
          </div>
        </div>

        <form
          action={updateMyTeamProfile}
          className="grid gap-3 sm:grid-cols-2"
        >
          <input type="hidden" name="company_id" value={companyId} />
          <input type="hidden" name="back" value="/dashboard/team?tab=you" />
          <label className="block">
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
          <label className="block">
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
              className="block w-full text-[13px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
            />
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-paper/40 px-3.5 py-3 sm:col-span-2">
            <input
              type="checkbox"
              name="public_visible"
              value="1"
              defaultChecked={me.publicVisible}
              className="mt-1 h-4 w-4 rounded border-line"
            />
            <span>
              <span className="block text-[13px] font-semibold text-ink">
                Show on public company profile
              </span>
              <span className="mt-0.5 block text-[12px] text-muted">
                Name, title, and photo only — no personal page.
              </span>
            </span>
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" className="h-10 w-fit px-4">
              Save profile
            </Button>
          </div>
        </form>

        {me.role !== "owner" ? (
          <form action={leaveTeam} className="mt-5 border-t border-line pt-4">
            <input type="hidden" name="company_id" value={companyId} />
            <input type="hidden" name="back" value="/dashboard/team" />
            <Button type="submit" variant="ghost" className="h-9 text-[12px]">
              Leave team
            </Button>
          </form>
        ) : (
          <p className="mt-5 border-t border-line pt-4 text-[12px] text-muted">
            Owners cannot leave — transfer ownership first.
          </p>
        )}
      </WorkspaceCard>
    </section>
  );
}

import { GroupSection } from "@/components/groups/group-section";
import { LogoRetryHint } from "@/components/logo/logo-retry-hint";
import { WorkspaceCard } from "@/components/dashboard/workspace-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/ui/logo-mark";
import {
  refreshGroupLogo,
  updateGroupWebsite,
} from "@/features/groups/logo-actions";
import { uploadGroupLogo } from "@/features/groups/logo-upload-action";

type Props = {
  groupId: string;
  name: string;
  website: string;
  logoUrl?: string | null;
  logoSource?: string | null;
  initials: string;
  backPath: string;
};

export function GroupLogoSection({
  groupId,
  name,
  website,
  logoUrl,
  logoSource,
  initials,
  backPath,
}: Props) {
  const isManual = logoSource === "manual";

  return (
    <section>
      <GroupSection
        title="Brand"
        description="Logo from the group website, or upload a manual mark."
        meta={isManual ? "Uploaded" : "Website"}
      />
      <WorkspaceCard>
        <div className="flex flex-wrap items-start gap-5">
          <LogoMark
            initials={initials}
            logoUrl={logoUrl}
            website={website}
            size="lg"
            className="rounded-2xl"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <p className="text-[12px] text-muted">
              {isManual ? "Source: uploaded" : "Source: website"}
              {name ? ` · ${name}` : null}
            </p>
            <LogoRetryHint
              logoSource={logoSource}
              website={website}
              back={backPath}
              kind="group"
              groupId={groupId}
            />
            <form action={updateGroupWebsite} className="flex flex-wrap gap-2">
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="back" value={backPath} />
              <Input
                name="website"
                type="url"
                defaultValue={website}
                placeholder="https://"
                className="min-w-[12rem] flex-1"
              />
              <Button type="submit" variant="secondary" className="h-10">
                Save website
              </Button>
            </form>
            <form
              action={uploadGroupLogo}
              className="flex flex-wrap items-center gap-2"
            >
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="back" value={backPath} />
              <input
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                required
                className="max-w-full text-[12px] text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-paper file:px-3 file:py-2 file:text-[12px] file:font-semibold file:text-ink"
              />
              <Button type="submit" variant="secondary" className="h-10">
                Upload logo
              </Button>
            </form>
            <form action={refreshGroupLogo}>
              <input type="hidden" name="group_id" value={groupId} />
              <input type="hidden" name="back" value={backPath} />
              <Button
                type="submit"
                variant="ghost"
                className="h-10"
                disabled={isManual || !website}
                title={
                  isManual
                    ? "Uploaded logos are not replaced automatically."
                    : !website
                      ? "Add a website first."
                      : "Fetch logo from website"
                }
              >
                Refresh logo
              </Button>
            </form>
          </div>
        </div>
      </WorkspaceCard>
    </section>
  );
}

import { refreshLogo } from "@/features/logo/actions";
import { refreshGroupLogo } from "@/features/groups/logo-actions";

type Props = {
  /** When logo_source is null and a website exists — owner can retry. */
  logoSource?: string | null;
  website?: string | null;
  back: string;
  /** Company (default) or group refresh action. */
  kind?: "company" | "group";
  groupId?: string;
};

/**
 * Owner-facing only: discrete retry when auto-fetch has not produced a logo yet.
 */
export function LogoRetryHint({
  logoSource,
  website,
  back,
  kind = "company",
  groupId,
}: Props) {
  if (logoSource || !website?.trim()) return null;

  return (
    <div className="text-[11px] text-muted">
      Logo: not fetched yet ·{" "}
      {kind === "group" && groupId ? (
        <form action={refreshGroupLogo} className="inline">
          <input type="hidden" name="group_id" value={groupId} />
          <input type="hidden" name="back" value={back} />
          <button
            type="submit"
            className="font-semibold text-[#1a5c51] underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </form>
      ) : (
        <form action={refreshLogo} className="inline">
          <input type="hidden" name="back" value={back} />
          <button
            type="submit"
            className="font-semibold text-[#1a5c51] underline-offset-2 hover:underline"
          >
            Try again
          </button>
        </form>
      )}
    </div>
  );
}

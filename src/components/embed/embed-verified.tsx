import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Free essential — clean Hansala Verified lockup, no chrome. */
export function EmbedVerified({ profileUrl, theme = "light" }: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Verified on Hansala"
      className={cn(
        "inline-flex items-center px-1 py-0.5 no-underline",
        "transition-opacity duration-150 hover:opacity-90",
      )}
    >
      <EmbedVerifiedLockup theme={theme} size="md" />
    </a>
  );
}

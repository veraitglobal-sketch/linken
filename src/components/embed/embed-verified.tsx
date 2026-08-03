import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  profileUrl: string;
  theme?: EmbedTheme;
  /** Hosts that place the mark as a foreground signature can size it up. */
  size?: "sm" | "md" | "lg";
};

/** Free essential — clean Hansala Verified lockup, no chrome. */
export function EmbedVerified({
  profileUrl,
  theme = "light",
  size = "md",
}: Props) {
  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      title="Hansala verified badge"
      className={cn(
        "inline-flex items-center px-1 py-0.5 no-underline",
        "transition-opacity duration-150 hover:opacity-90",
      )}
    >
      <EmbedVerifiedLockup theme={theme} size={size} />
    </a>
  );
}

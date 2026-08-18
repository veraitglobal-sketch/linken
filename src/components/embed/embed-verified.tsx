import { EmbedVerifiedLockup } from "@/components/embed/embed-verified-lockup";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  profileUrl: string;
  theme?: EmbedTheme;
  /** Hosts that place the mark as a foreground signature can size it up. */
  size?: "sm" | "md" | "lg";
};

/** Free essential — lockup on host-fit frost, not a white sticker. */
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
        "inline-flex items-center rounded-full border no-underline",
        "transition-opacity duration-150 hover:opacity-90",
        size === "lg" ? "px-3 py-2" : "px-2.5 py-0.5",
        theme === "dark" ? "embed-glass-dark" : "embed-glass",
      )}
    >
      <EmbedVerifiedLockup theme={theme} size={size} />
    </a>
  );
}

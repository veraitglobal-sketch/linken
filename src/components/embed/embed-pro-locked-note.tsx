import { EmbedHansalaSeal } from "@/components/embed/embed-linken-seal";
import {
  embedInkClass,
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import { cn } from "@/lib/cn";

type Props = {
  name: string;
  profileUrl: string;
  theme?: EmbedTheme;
};

/** Shown under the free fallback when a Pro embed URL is requested. */
export function EmbedProLockedNote({
  name,
  profileUrl,
  theme = "light",
}: Props) {
  return (
    <div className="mt-2 flex w-full items-center justify-between gap-3 px-0.5">
      <p className={cn("min-w-0 text-[11px]", embedMutedClass(theme))}>
        <span className={cn("font-medium", embedInkClass(theme))}>{name}</span>
        {" · "}
        Premium embed — Hansala Pro
      </p>
      <EmbedHansalaSeal theme={theme} href={profileUrl} />
    </div>
  );
}

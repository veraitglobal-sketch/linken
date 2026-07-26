import { EmbedCaseGalleryRow } from "@/components/embed/embed-case-gallery-row";
import { EmbedPlacementRail } from "@/components/embed/embed-placement-rail";
import {
  embedMutedClass,
  type EmbedTheme,
} from "@/components/embed/embed-theme";
import type { CaseGalleryEntry } from "@/features/widgets/case-gallery";
import { cn } from "@/lib/cn";

type Props = {
  companySlug: string;
  siteUrl: string;
  entries: CaseGalleryEntry[];
  theme?: EmbedTheme;
  profileUrl: string;
};

/** Enterprise case dossier list — confirmed work only. */
export function EmbedCaseGallery({
  companySlug,
  siteUrl,
  entries,
  theme = "light",
  profileUrl,
}: Props) {
  if (entries.length === 0) {
    return (
      <p
        className={cn(
          "px-1 py-6 text-center text-[12px]",
          embedMutedClass(theme),
        )}
      >
        No client-confirmed cases yet
      </p>
    );
  }

  return (
    <div className="box-border w-full px-0.5 py-1">
      <EmbedPlacementRail
        label="Confirmed work"
        href={profileUrl}
        linkLabel="Full dossier"
        theme={theme}
      />
      <ul className="mt-1">
        {entries.map((e, i) => (
          <li key={e.id}>
            <EmbedCaseGalleryRow
              entry={e}
              index={i}
              theme={theme}
              href={`${siteUrl}/c/${companySlug}/case-studies/${e.slug}?src=embed`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

import { EmbedReferences } from "@/components/embed/embed-references";
import type { EmbedTheme } from "@/components/embed/embed-theme";
import { UNDISCLOSED_CLIENT_LABEL } from "@/features/confirmations/meta";
import { publicReferenceClient } from "@/features/confirmations/public-client";

type Ref = {
  clientName: string;
  service: string;
  startedYear: string;
  endedYear: string | null;
  ongoing: boolean;
  disclosure?: "named" | "undisclosed" | null;
};

function periodLabel(ref: Ref) {
  if (ref.ongoing) return `since ${ref.startedYear || "—"}`;
  if (ref.endedYear) return `${ref.startedYear || "—"}–${ref.endedYear}`;
  return ref.startedYear || "—";
}

function initialsFrom(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function embedReferencesNode(input: {
  companyName: string;
  confirmedRefs: Ref[];
  profileUrl: string;
  theme: EmbedTheme;
}) {
  const { companyName, confirmedRefs, profileUrl, theme } = input;
  const undisclosed = confirmedRefs.filter(
    (r) => r.disclosure === "undisclosed",
  ).length;
  return (
    <EmbedReferences
      name={companyName}
      totalCount={confirmedRefs.length}
      undisclosedCount={undisclosed}
      references={confirmedRefs.slice(0, 5).map((r) => {
        const view = publicReferenceClient({
          ...r,
          status: "confirmed",
          disclosure: r.disclosure ?? "named",
        });
        return {
          clientName: view.clientName,
          service: view.service,
          period: periodLabel(view),
          ongoing: view.ongoing,
          initials:
            view.clientName === UNDISCLOSED_CLIENT_LABEL
              ? "UC"
              : initialsFrom(view.clientName),
        };
      })}
      profileUrl={profileUrl}
      theme={theme}
    />
  );
}

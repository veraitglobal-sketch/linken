import Link from "next/link";
import {
  formatConfirmDate,
  type ConfirmedRelationship,
} from "@/features/trust/relationship-banner";

type Props = {
  profileName: string;
  profileSlug: string;
  relationship: ConfirmedRelationship;
};

function kindLabel(kind: ConfirmedRelationship["kind"]) {
  return kind === "partnership" ? "partnership" : "client reference";
}

/** First thing a stranger sees from a widget click — is this true? */
export function RelationshipConfirmBanner({
  profileName,
  profileSlug,
  relationship,
}: Props) {
  const date = formatConfirmDate(relationship.confirmedAt);
  const other = relationship.other;
  const verifiedNote = other.verified
    ? " Domain verified on Hansala."
    : "";

  if (relationship.undisclosed) {
    return (
      <aside className="border-b border-[#1a5c51]/25 bg-[#1a5c51]/08">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5">
          <p className="text-[14px] leading-relaxed text-ink">
            <span className="font-semibold">{profileName}</span>
            {" — "}
            {kindLabel(relationship.kind)} confirmed by client
            {date ? `, ${date}` : ""}.{verifiedNote}
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="border-b border-[#1a5c51]/25 bg-[#1a5c51]/08">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5">
        <p className="text-[14px] leading-relaxed text-ink">
          <Link
            href={`/c/${other.slug}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {other.name}
          </Link>
          {" ↔ "}
          <Link
            href={`/c/${profileSlug}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {profileName}
          </Link>
          {" — "}
          {kindLabel(relationship.kind)} confirmed by both companies
          {date ? `, ${date}` : ""}.{verifiedNote}
        </p>
      </div>
    </aside>
  );
}

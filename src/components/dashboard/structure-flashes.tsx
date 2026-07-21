import Link from "next/link";
import { StructureFlash } from "@/components/dashboard/structure-ui";

type Props = {
  error?: string;
  created?: string;
  invited?: string;
  subsidiary?: string;
};

export function StructureFlashes({
  error,
  created,
  invited,
  subsidiary,
}: Props) {
  return (
    <>
      {error ? <StructureFlash tone="error">{error}</StructureFlash> : null}
      {created ? (
        <StructureFlash>Group created. Add a branch next.</StructureFlash>
      ) : null}
      {invited ? (
        <StructureFlash>
          Invite sent to {invited}. They must confirm before they appear in the
          tree.
        </StructureFlash>
      ) : null}
      {subsidiary ? (
        <StructureFlash>
          Branch created:{" "}
          <Link
            href={`/c/${subsidiary}`}
            className="font-semibold underline-offset-2 hover:underline"
          >
            {subsidiary}
          </Link>
          . It starts unclaimed until a local manager claims it.
        </StructureFlash>
      ) : null}
    </>
  );
}

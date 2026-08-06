import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";
import { getLegalCompany } from "@/lib/legal/company";
import { mailto } from "@/lib/legal/emails";

export const metadata: Metadata = {
  title: "Data deletion",
  description:
    "How to request deletion of your Hansala account and personal data.",
};

export default function DataDeletionPage() {
  const privacy = getLegalCompany().privacyEmail;

  return (
    <LegalDoc
      eyebrow="Trust"
      title="Data deletion"
      updated="6 August 2026"
      currentPath="/data-deletion"
    >
      <p>
        There is no self-serve account deletion button in the product today.
        Deletion is handled by request so we can remove workspace data without
        leaving confirmed records in an inconsistent state.
      </p>

      <h2>How to request deletion</h2>
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>
          Email{" "}
          <a href={mailto(privacy, "Data deletion request")}>{privacy}</a> from
          the address on your account.
        </li>
        <li>
          Name the company workspace(s) and whether you want the account closed,
          content removed, or both.
        </li>
        <li>
          We confirm the request and process it; you receive a short written
          confirmation when done.
        </li>
      </ol>

      <h2>What we delete</h2>
      <ul>
        <li>Account authentication data tied to your login.</li>
        <li>
          Company workspace content you control (profile fields, drafts, team
          invites, API keys, widget settings), subject to the notes below.
        </li>
        <li>Pending invites and unpublished materials.</li>
      </ul>

      <h2>What may remain</h2>
      <ul>
        <li>
          Confirmed public records that name another company may need that
          company&apos;s cooperation to remove, because both sides created the
          fact.
        </li>
        <li>
          Security, abuse, and billing records may be retained as reasonably
          needed for fraud prevention, legal obligation, or dispute resolution.
        </li>
        <li>
          Backups held by our processors, if any, expire on their normal schedule
          — we do not document a separate Hansala backup product in this
          codebase.
        </li>
      </ul>

      <h2>More</h2>
      <p>
        <Link href="/privacy">Privacy Policy</Link> ·{" "}
        <Link href="/contact">Contact</Link> ·{" "}
        <Link href="/subprocessors">Subprocessors</Link>
      </p>
    </LegalDoc>
  );
}

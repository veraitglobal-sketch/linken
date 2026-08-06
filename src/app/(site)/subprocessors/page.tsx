import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";
import { SUBPROCESSORS } from "@/lib/legal/subprocessors";

export const metadata: Metadata = {
  title: "Subprocessors",
  description:
    "Third-party processors Hansala uses to run the product.",
};

export default function SubprocessorsPage() {
  return (
    <LegalDoc
      eyebrow="Trust"
      title="Subprocessors"
      updated="6 August 2026"
      currentPath="/subprocessors"
    >
      <p>
        Hansala uses the following processors under contract. This list matches
        services actually wired in the product — hosting, database/auth, email,
        and payments. We do not list vendors we do not use.
      </p>

      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-line bg-[#fafbfc] text-[11px] tracking-[0.08em] text-muted uppercase">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Processor</th>
              <th className="px-4 py-2.5 font-semibold">Purpose</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {SUBPROCESSORS.map((row) => (
              <tr key={row.name}>
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-ink">{row.name}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{row.location}</p>
                  <a
                    href={row.website}
                    className="mt-1 inline-block text-[12px]"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {row.website.replace(/^https?:\/\//, "")}
                  </a>
                </td>
                <td className="px-4 py-3 align-top text-ink-soft">
                  {row.purpose}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        Changes to this list will be reflected on this page. See also{" "}
        <Link href="/privacy">Privacy</Link> and{" "}
        <Link href="/security">Security</Link>.
      </p>
    </LegalDoc>
  );
}

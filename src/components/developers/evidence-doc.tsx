import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

/** Canonical fields for agents that hash or store Hansala proof. */
export function EvidenceDoc() {
  return (
    <LegalDoc
      eyebrow="Developers"
      title="Evidence binding"
      updated="18 September 2026"
    >
      <p>
        Hansala publishes confirmed work. Bind a record on its stable{" "}
        <code>id</code> (UUID) and <code>confirmed_at</code>. Do not treat{" "}
        <code>generated_at</code> as proof — that is when the JSON envelope was
        built, and it changes on every fetch.
      </p>

      <h2>What to store</h2>
      <ul>
        <li>
          <code>id</code> — <code>partnerships.id</code> or{" "}
          <code>service_references.id</code>. Stable across responses.
        </li>
        <li>
          <code>confirmed_at</code> — ISO-8601 when both sides accepted. Empty
          string only if the timestamp was not stored (legacy).
        </li>
        <li>
          Company <code>slug</code> — human lookup. The UUID is the bind key.
        </li>
      </ul>
      <p>
        Public JSON never includes pending invites. If a relation is gone from
        the list, it is no longer public — absence is not a negative finding.
      </p>

      <h2>What not to hash</h2>
      <ul>
        <li>
          <code>generated_at</code> on the company payload — request time, not
          confirmation time.
        </li>
        <li>
          JSON-RPC <code>id</code> on MCP frames — envelope, not evidence.
        </li>
        <li>
          Widget HTML, Open Graph images, or directory rank.
        </li>
      </ul>

      <h2>Where to read it</h2>
      <ul>
        <li>
          REST:{" "}
          <Link href="/developers#endpoint-partners">
            GET /api/v1/companies/{"{slug}"}/partners
          </Link>{" "}
          and{" "}
          <Link href="/developers#endpoint-references">
            /references
          </Link>
          .
        </li>
        <li>
          Hosted MCP (no key):{" "}
          <code>POST https://www.hansala.com/api/mcp/public</code> — tool{" "}
          <code>get_company_proof</code>. Discovery:{" "}
          <code>/.well-known/mcp</code> and <code>/server-card</code>.
        </li>
      </ul>
    </LegalDoc>
  );
}

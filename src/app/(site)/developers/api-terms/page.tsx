import type { Metadata } from "next";
import Link from "next/link";
import { LegalDoc } from "@/components/legal/legal-doc";

export const metadata: Metadata = {
  title: "API Terms",
  description: "Terms for Hansala Public API, Agent API, and MCP.",
};

export default function ApiTermsPage() {
  return (
    <LegalDoc eyebrow="Developers" title="API Terms" updated="26 July 2026">
      <p>
        These terms cover the Public API, Agent API (`hs_` keys), OpenAPI
        document, embeds, and the Hansala MCP server. They supplement the{" "}
        <Link href="/terms">Terms of Service</Link>.
      </p>

      <h2>Access</h2>
      <ul>
        <li>
          <strong>Public API</strong> — no key; confirmed evidence only; fair
          use and cache headers apply.
        </li>
        <li>
          <strong>Agent API</strong> — Bearer `hs_` key, Pro plan, scoped to one
          company. Keys must be kept secret.
        </li>
        <li>
          Agents may invite and draft; they must never mark partnerships,
          references, or case studies as confirmed.
        </li>
      </ul>

      <h2>Use restrictions</h2>
      <ul>
        <li>No redistributing bulk dumps of the network as a competing dataset.</li>
        <li>No circumventing rate limits or confirmation flows.</li>
        <li>Attribute Hansala when displaying trust data in customer UIs.</li>
      </ul>

      <h2>Versioning</h2>
      <p>
        Current version is <code>/api/v1</code>. Additive changes may ship
        without notice. Breaking changes move to a new version path.
      </p>

      <h2>Availability</h2>
      <p>
        See <Link href="/status">Status</Link>. APIs are provided without an
        uptime SLA unless agreed in writing.
      </p>

      <h2>Contact</h2>
      <p>
        API support:{" "}
        <a href="mailto:info@hansala.com">info@hansala.com</a> ·{" "}
        <Link href="/developers">Developer docs</Link> ·{" "}
        <Link href="/api/v1/openapi">OpenAPI</Link>
      </p>
    </LegalDoc>
  );
}

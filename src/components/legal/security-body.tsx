import Link from "next/link";
import { getLegalCompany } from "@/lib/legal/company";
import { mailto } from "@/lib/legal/emails";

/** Security page body — claims limited to what the codebase implements. */
export function SecurityBody() {
  const security = getLegalCompany().securityEmail;

  return (
    <>
      <p>
        Hansala is built so confirmed evidence cannot be published by a single
        party. The practices below describe what the product and infrastructure
        actually do — not aspirational certifications.
      </p>

      <h2>Authentication</h2>
      <ul>
        <li>
          Sign-in uses Supabase Auth (magic link / password as configured).
        </li>
        <li>
          Sessions use HTTP-only cookies with SameSite=Lax; production shares
          cookies across www and apex via <code>.hansala.com</code> when
          configured.
        </li>
        <li>
          Agent API keys use the <code>hs_</code> prefix and are stored as
          SHA-256 hashes — the raw key is shown once at creation.
        </li>
      </ul>

      <h2>Authorization</h2>
      <ul>
        <li>
          Postgres row-level security and company operator checks scope data to
          the owning company.
        </li>
        <li>
          Sensitive writes go through <code>SECURITY DEFINER</code> RPCs granted
          to <code>service_role</code>, not broad client grants.
        </li>
        <li>
          The service-role admin client is never imported from client
          components.
        </li>
        <li>
          Confirmations (partners, references, case studies) require a human
          action — Agent API can invite, not confirm for the other side.
        </li>
      </ul>

      <h2>Encryption in transit</h2>
      <p>
        Production traffic is served over HTTPS (TLS) via the hosting provider.
        We do not document application-level encryption of database fields in
        this repository.
      </p>

      <h2>Data access controls</h2>
      <ul>
        <li>
          Public API and embeds expose only confirmed / published fields.
        </li>
        <li>
          Staff admin access is dual-gated (allow-listed emails plus
          platform_staff rows) when configured.
        </li>
        <li>
          Outbound fetches of user-supplied URLs go through a safe-fetch helper
          with timeouts and SSRF protections.
        </li>
      </ul>

      <h2>Backups</h2>
      <p>
        This codebase does not implement or document a Hansala-owned backup
        product. Database durability depends on the linked Supabase project
        plan. We do not claim PITR or encryption-at-rest here unless separately
        confirmed with the provider.
      </p>

      <h2>Domain verification &amp; “Verified”</h2>
      <p>
        A company can prove control of its business domain via email domain
        match, DNS TXT, or a meta tag on its website. Staff may also mark
        approved identity in exceptional cases through internal tools.
      </p>
      <p>
        <strong>
          Verified means the company controls its business domain or approved
          identity. It does not mean Hansala guarantees the quality of its
          services.
        </strong>
      </p>

      <h2>Incident reporting</h2>
      <p>
        Email{" "}
        <a href={mailto(security, "Security incident")}>{security}</a>. For
        researcher process and scope, see{" "}
        <Link href="/disclosure">responsible disclosure</Link>. Machine-readable:{" "}
        <a href="/.well-known/security.txt">/.well-known/security.txt</a>.
      </p>

      <h2>Data deletion</h2>
      <p>
        Account and personal data deletion is by email request — there is no
        self-serve delete control yet. Details:{" "}
        <Link href="/data-deletion">data deletion</Link>.
      </p>

      <h2>More</h2>
      <p>
        <Link href="/privacy">Privacy</Link> ·{" "}
        <Link href="/subprocessors">Subprocessors</Link> ·{" "}
        <Link href="/status">Status</Link>
      </p>
    </>
  );
}

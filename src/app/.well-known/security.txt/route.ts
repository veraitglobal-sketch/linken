import { getLegalCompany } from "@/lib/legal/company";
import { getSiteUrl } from "@/lib/site";

/**
 * RFC 9116 security.txt — vulnerability disclosure for researchers.
 * https://www.hansala.com/.well-known/security.txt
 */
export function GET() {
  const site = getSiteUrl().replace(/\/$/, "");
  const security = getLegalCompany().securityEmail;
  const expires = "2027-08-06T00:00:00.000Z";
  const body = [
    `Contact: mailto:${security}`,
    `Contact: ${site}/security`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${site}/.well-known/security.txt`,
    `Policy: ${site}/disclosure`,
    `Acknowledgments: ${site}/security`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

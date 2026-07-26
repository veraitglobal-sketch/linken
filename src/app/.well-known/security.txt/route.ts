import { getSiteUrl } from "@/lib/site";

/**
 * RFC 9116 security.txt — vulnerability disclosure for researchers.
 * https://www.hansala.com/.well-known/security.txt
 */
export function GET() {
  const site = getSiteUrl().replace(/\/$/, "");
  const expires = "2027-07-26T00:00:00.000Z";
  const body = [
    "Contact: mailto:security@hansala.com",
    `Contact: ${site}/security`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${site}/.well-known/security.txt`,
    `Policy: ${site}/security`,
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

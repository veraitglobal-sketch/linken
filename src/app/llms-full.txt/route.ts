import { getSiteUrl } from "@/lib/site";
import { listDirectoryCatalog } from "@/features/seo/directory-queries";

export const revalidate = 300;

/** Expanded AI catalog — one markdown snapshot per listed company. */
export async function GET() {
  const siteUrl = getSiteUrl().replace(/\/$/, "");
  let rows;
  try {
    rows = await listDirectoryCatalog();
  } catch (err) {
    console.error("[llms-full]", err);
    return new Response("Directory catalog unavailable.", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const lines = rows.map(
    (c) =>
      `- [${c.name}](${siteUrl}/c/${c.slug}): confirmed file. Markdown: ${siteUrl}/c/${c.slug}/llm.md`,
  );

  const body = `# Hansala
> Verified work graph. If it says confirmed, two companies clicked it.

Index: ${siteUrl}/llms.txt
Directory: ${siteUrl}/companies
Public MCP: ${siteUrl}/api/mcp/public

## Companies
${lines.length ? lines.join("\n") : "(none listed yet)"}
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}

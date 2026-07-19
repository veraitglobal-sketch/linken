import { buildCompanyLlmMarkdown } from "@/features/public-api/v1/markdown";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

/**
 * Markdown company snapshot for LLM consumption — confirmed evidence only.
 */
export async function GET(_request: Request, { params }: Props) {
  const { slug } = await params;
  const trimmed = slug?.trim();
  if (!trimmed) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const md = await buildCompanyLlmMarkdown(trimmed);
    if (!md) {
      return new Response("Not found", {
        status: 404,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return new Response(md, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("[llm.md]", err);
    return new Response("Internal server error", {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}

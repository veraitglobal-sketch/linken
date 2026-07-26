import { buildRegistryItem } from "@/features/registry/build-item";

export const revalidate = 3600;

type Props = { params: Promise<{ name: string }> };

/**
 * shadcn-compatible registry item.
 * Install: npx shadcn@latest add https://hansala.com/r/partner-wall.json
 *
 * Source of truth: src/registry/hansala/* — this route reads those files
 * at request time (no duplicated string copies).
 */
export async function GET(_request: Request, { params }: Props) {
  const { name } = await params;
  const item = await buildRegistryItem(name ?? "");
  if (!item) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store",
      },
    });
  }

  return Response.json(item, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

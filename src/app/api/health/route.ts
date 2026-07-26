/** Lightweight liveness for status / uptime monitors. No DB. */
export async function GET() {
  return Response.json(
    {
      ok: true,
      service: "hansala",
      time: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

import { formatIntegrationReport } from "@/services/utils/integration-doctor";

/**
 * Dev-only integration preflight: reports the selected provider per capability
 * and any missing/invalid env. Returns 404 in production to avoid exposing
 * configuration details.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  return new Response(formatIntegrationReport(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

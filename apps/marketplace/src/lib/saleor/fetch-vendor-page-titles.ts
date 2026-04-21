import { VendorPageStatusDocument } from "@/graphql/generated/client";
import { executeGraphQL } from "@/lib/graphql/execute";

/**
 * Resolve vendor profile page titles for dashboard payout UI (best-effort).
 */
export async function fetchVendorTitlesByIds(
  ids: string[],
  token: string | null,
): Promise<Record<string, string>> {
  if (!token || ids.length === 0) {
    return {};
  }

  const unique = [...new Set(ids)];
  const out: Record<string, string> = {};

  await Promise.all(
    unique.map(async (id) => {
      const result = await executeGraphQL(
        VendorPageStatusDocument,
        "VendorPageStatusQuery",
        { id },
        token,
      );

      if (result.ok && result.data.page?.title) {
        out[id] = result.data.page.title;
      }
    }),
  );

  return out;
}

import { clientEnvs } from "@/envs/client";

/**
 * UCP version used by the storefront.
 */
export const UCP_VERSION = "2026-01-23";

/**
 * UCP API endpoint used by the storefront.
 */
export const UCP_API_ENDPOINT = new URL(
  `/api/ucp/${clientEnvs.NEXT_PUBLIC_DEFAULT_CHANNEL}`,
  clientEnvs.NEXT_PUBLIC_STOREFRONT_URL,
).toString();

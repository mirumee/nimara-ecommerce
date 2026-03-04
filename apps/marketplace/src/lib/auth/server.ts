import * as jose from "jose";
import { cookies } from "next/headers";

import { getAppConfig } from "@/lib/saleor/app-config";
import { METADATA_KEYS } from "@/lib/saleor/consts";

/**
 * Get the authentication token from cookies (server-side only).
 * Used in Server Components and Server Actions.
 */
export async function getServerAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();

  return cookieStore.get("auth_token")?.value || null;
}

/**
 * Get vendor ID for the current server session.
 * Used when Server Actions need vendor context (e.g. updateMetadata fallback).
 * Requires: auth token in cookies, app config for Saleor domain, user metadata with vendor.id.
 */
export async function getServerVendorId(): Promise<string | null> {
  const token = await getServerAuthToken();

  if (!token) {
    return null;
  }

  let saleorDomain: string | null = null;
  const url = process.env.NEXT_PUBLIC_SALEOR_URL;

  if (url) {
    try {
      saleorDomain = new URL(url).hostname;
    } catch {
      // ignore
    }
  }

  if (!saleorDomain) {
    try {
      const decoded = jose.decodeJwt(token) as { iss?: string };

      if (decoded.iss) {
        saleorDomain = new URL(decoded.iss).host;
      }
    } catch {
      // ignore
    }
  }

  if (!saleorDomain) {
    return null;
  }

  const appConfig = await getAppConfig(saleorDomain);

  if (!appConfig?.authToken) {
    return null;
  }

  const decoded = jose.decodeJwt(token) as { user_id?: string };
  const userId = decoded.user_id;

  if (!userId) {
    return null;
  }

  const query = `
    query UserVendorId($id: ID!) {
      user(id: $id) {
        metadata { key value }
      }
    }
  `;

  const response = await fetch(`https://${saleorDomain}/graphql/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${appConfig.authToken}`,
    },
    body: JSON.stringify({ query, variables: { id: userId } }),
  });

  const json = (await response.json()) as {
    data?: { user?: { metadata?: Array<{ key: string; value: string }> } };
  };

  const metadata = json.data?.user?.metadata ?? [];
  const vendorId =
    metadata.find((m) => m.key === METADATA_KEYS.VENDOR_ID)?.value ?? null;

  return vendorId || null;
}

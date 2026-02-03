import { type NextRequest, NextResponse } from "next/server";

import { APP_CONFIG } from "@/lib/saleor/consts";
import type { SaleorAppManifest } from "@/lib/saleor/types";

/**
 * Resolve the public base URL for manifest URLs (origin only, no trailing slash).
 * Prefer NEXT_PUBLIC_MARKETPLACE_VENDOR_URL so manifest works when behind ngrok.
 */
function getManifestBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_MARKETPLACE_VENDOR_URL?.trim();

  if (configured) {
    const url = configured.startsWith("http") ? configured : `https://${configured}`;

    try {
      const parsed = new URL(url);

      
return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // fall through
    }
  }
  try {
    return new URL(request.url).origin;
  } catch {
    return "https://localhost:3001";
  }
}

/** Build a manifest URL that Saleor accepts: absolute, http/https, no trailing slash. */
function manifestUrl(baseUrl: string, path: string): string {
  const full = path.startsWith("http") ? path : `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  
return new URL(full).href.replace(/\/$/, "");
}

export async function GET(request: NextRequest) {
  const baseUrl = getManifestBaseUrl(request);

  const manifest: SaleorAppManifest = {
    name: APP_CONFIG.NAME,
    version: APP_CONFIG.VERSION,
    id: APP_CONFIG.MANIFEST_ID,
    about: "API for Vendor App",
    author: APP_CONFIG.AUTHOR,
    permissions: [
      "IMPERSONATE_USER",
      "MANAGE_PRODUCTS",
      "MANAGE_USERS",
      "MANAGE_ORDERS",
    ],
    tokenTargetUrl: manifestUrl(baseUrl, "/api/saleor/register"),
    appUrl: manifestUrl(baseUrl, "/app"),
    webhooks: [
      {
        name: "Order created",
        targetUrl: manifestUrl(baseUrl, "/api/saleor/webhooks/order-created"),
        asyncEvents: ["ORDER_CREATED"],
        query: `subscription OrderCreatedSubscription {
  event {
    ... on OrderCreated {
      order {
        id
        number
        lines {
          id
          productName
          productSku
          variant {
            id
            product {
              id
              metadata {
                key
                value
              }
            }
          }
        }
        metadata {
          key
          value
        }
      }
    }
  }
}`,
        syncEvents: [],
      },
    ],
    brand: {
      logo: {
        default: manifestUrl(baseUrl, "/logo.png"),
      },
    },
  };

  return NextResponse.json(manifest);
}

import { GraphQLError } from "graphql";
import * as jose from "jose";

import { getAppConfig, type SaleorAppConfig } from "@/lib/saleor/app-config";
import {
  GraphQLAuthLevel,
  type SaleorJWTPayload,
  type ServerContext,
} from "@/lib/saleor/types";

const VENDOR_ID_CACHE_TTL_MS = 60_000;
const VENDOR_ID_THROTTLE_FALLBACK_TTL_MS = 30_000;
const MAX_VENDOR_ID_CACHE_ENTRIES = 10_000;

type VendorIdCacheEntry = {
  expiresAt: number;
  unavailableReason?: "THROTTLED";
  vendorId: string | null;
};

const vendorIdCache = new Map<string, VendorIdCacheEntry>();

class VendorMetadataRateLimitError extends Error {
  retryAfterMs?: number;

  constructor(message: string, retryAfterMs?: number) {
    super(message);
    this.name = "VendorMetadataRateLimitError";
    this.retryAfterMs = retryAfterMs;
  }
}

function parseRetryAfterHeader(headerValue: string | null): number | undefined {
  if (!headerValue) {
    return undefined;
  }

  const seconds = Number(headerValue);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const timestamp = Date.parse(headerValue);

  if (Number.isFinite(timestamp)) {
    const retryAfterMs = timestamp - Date.now();

    return retryAfterMs > 0 ? retryAfterMs : undefined;
  }

  return undefined;
}

function isRateLimitMessage(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return (
    normalizedMessage.includes("429") ||
    normalizedMessage.includes("too many") ||
    normalizedMessage.includes("rate limit") ||
    normalizedMessage.includes("throttl")
  );
}

function isVendorMetadataRateLimitError(
  error: unknown,
): error is VendorMetadataRateLimitError {
  return error instanceof VendorMetadataRateLimitError;
}

function getVendorCacheKey(saleorDomain: string, userId: string): string {
  return `${saleorDomain}:${userId}`;
}

function getCachedVendorEntry(key: string): VendorIdCacheEntry | null {
  const cachedEntry = vendorIdCache.get(key);

  if (!cachedEntry) {
    return null;
  }

  if (cachedEntry.expiresAt <= Date.now()) {
    vendorIdCache.delete(key);

    return null;
  }

  return cachedEntry;
}

function setCachedVendorEntry(key: string, entry: VendorIdCacheEntry): void {
  if (vendorIdCache.size >= MAX_VENDOR_ID_CACHE_ENTRIES) {
    const now = Date.now();

    for (const [cacheKey, cachedEntry] of vendorIdCache) {
      if (cachedEntry.expiresAt <= now) {
        vendorIdCache.delete(cacheKey);
      }
    }

    if (vendorIdCache.size >= MAX_VENDOR_ID_CACHE_ENTRIES) {
      vendorIdCache.clear();
    }
  }

  vendorIdCache.set(key, entry);
}

async function fetchVendorIdForUser(args: {
  authToken: string;
  saleorDomain: string;
  userId: string;
}): Promise<string | null> {
  const query = `
    query UserVendorId($id: ID!) {
      user(id: $id) {
        id
        metadata {
          key
          value
        }
      }
    }
  `;

  const response = await fetch(`https://${args.saleorDomain}/graphql/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${args.authToken}`,
    },
    body: JSON.stringify({ query, variables: { id: args.userId } }),
  });

  const json = (await response.json()) as {
    data?: { user?: { metadata?: Array<{ key: string; value: string }> } };
    errors?: Array<{ message?: string }>;
  };

  if (!response.ok) {
    const errorMessage = `Failed to fetch user metadata (status=${response.status})`;

    if (response.status === 429) {
      throw new VendorMetadataRateLimitError(
        errorMessage,
        parseRetryAfterHeader(response.headers.get("retry-after")),
      );
    }

    throw new Error(errorMessage);
  }

  if (json.errors?.length) {
    const errorMessage =
      json.errors
        .map((e) => e.message)
        .filter(Boolean)
        .join("; ") || "Failed to fetch user metadata";

    if (isRateLimitMessage(errorMessage)) {
      throw new VendorMetadataRateLimitError(
        errorMessage,
        parseRetryAfterHeader(response.headers.get("retry-after")),
      );
    }

    throw new Error(errorMessage);
  }

  const metadata = json.data?.user?.metadata ?? [];
  const vendorId = metadata.find((m) => m.key === "vendor.id")?.value ?? null;

  return vendorId || null;
}

/**
 * Configuration for determining authorization requirements for GraphQL operations.
 */
const OPERATION_AUTH_CONFIG: Record<string, GraphQLAuthLevel> = {
  // Public operations
  IntrospectionQuery: GraphQLAuthLevel.PUBLIC,

  // App token only (dashboard context: x-saleor-domain + app config)
  customers: GraphQLAuthLevel.APP_TOKEN_ONLY,
  vendorProfiles: GraphQLAuthLevel.APP_TOKEN_ONLY,
  VendorProfilesQuery: GraphQLAuthLevel.APP_TOKEN_ONLY,

  // Domain-only operations (require x-saleor-domain header but no auth token)
  accountRegister: GraphQLAuthLevel.DOMAIN_ONLY,
  categories: GraphQLAuthLevel.DOMAIN_ONLY,
  channels: GraphQLAuthLevel.DOMAIN_ONLY,
  confirmAccount: GraphQLAuthLevel.DOMAIN_ONLY,
  productType: GraphQLAuthLevel.DOMAIN_ONLY,
  productTypes: GraphQLAuthLevel.DOMAIN_ONLY,
  tokenCreate: GraphQLAuthLevel.DOMAIN_ONLY,
  tokenRefresh: GraphQLAuthLevel.DOMAIN_ONLY,
  tokenVerify: GraphQLAuthLevel.DOMAIN_ONLY,

  // Authenticated operations (require JWT token)
  me: GraphQLAuthLevel.AUTHENTICATED,
  accountUpdate: GraphQLAuthLevel.AUTHENTICATED,
  product: GraphQLAuthLevel.AUTHENTICATED,
  products: GraphQLAuthLevel.AUTHENTICATED,
  collection: GraphQLAuthLevel.AUTHENTICATED,
  collections: GraphQLAuthLevel.AUTHENTICATED,
  order: GraphQLAuthLevel.AUTHENTICATED,
  orders: GraphQLAuthLevel.AUTHENTICATED,
  productCreate: GraphQLAuthLevel.AUTHENTICATED,
  productUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productDelete: GraphQLAuthLevel.AUTHENTICATED,
  productBulkCreate: GraphQLAuthLevel.AUTHENTICATED,
  productChannelListingUpdate: GraphQLAuthLevel.AUTHENTICATED,
  collectionCreate: GraphQLAuthLevel.AUTHENTICATED,
  collectionUpdate: GraphQLAuthLevel.AUTHENTICATED,
  collectionChannelListingUpdate: GraphQLAuthLevel.AUTHENTICATED,
  collectionDelete: GraphQLAuthLevel.AUTHENTICATED,
  collectionAddProducts: GraphQLAuthLevel.AUTHENTICATED,
  collectionRemoveProducts: GraphQLAuthLevel.AUTHENTICATED,
  productVariant: GraphQLAuthLevel.AUTHENTICATED,
  productVariantUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productVariantCreate: GraphQLAuthLevel.AUTHENTICATED,
  productVariantDelete: GraphQLAuthLevel.AUTHENTICATED,
  productVariantBulkCreate: GraphQLAuthLevel.AUTHENTICATED,
  productVariantBulkUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productVariantChannelListingUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productMediaCreate: GraphQLAuthLevel.AUTHENTICATED,
  productMediaUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productMediaDelete: GraphQLAuthLevel.AUTHENTICATED,
  productMediaReorder: GraphQLAuthLevel.AUTHENTICATED,
  productMediaBulkDelete: GraphQLAuthLevel.AUTHENTICATED,
  warehouses: GraphQLAuthLevel.AUTHENTICATED,
  orderFulfill: GraphQLAuthLevel.AUTHENTICATED,
  orderCancel: GraphQLAuthLevel.AUTHENTICATED,
  orderFulfillmentCancel: GraphQLAuthLevel.AUTHENTICATED,
  orderNoteAdd: GraphQLAuthLevel.AUTHENTICATED,
  pageUpdate: GraphQLAuthLevel.APP_TOKEN_ONLY,
  PageUpdateMutation: GraphQLAuthLevel.APP_TOKEN_ONLY,
};

/**
 * Extract root field name from a GraphQL query string
 */
function extractRootFieldName(query: string | null | undefined): string | null {
  if (!query) {
    return null;
  }

  // Simple regex to extract the first field name after query/mutation
  const match = query.match(
    /(?:query|mutation)\s*\w*\s*(?:\([^)]*\))?\s*\{\s*(\w+)/,
  );

  return match?.[1] || null;
}

/**
 * Determine the authorization level for an operation
 */
function getAuthLevelForOperation(
  operationName: string | null | undefined,
  query: string | null | undefined,
): GraphQLAuthLevel {
  // Check for introspection queries
  if (
    operationName === "IntrospectionQuery" ||
    query?.includes("IntrospectionQuery") ||
    query?.includes("__schema") ||
    (query?.includes("__type") && !query?.includes("__typename"))
  ) {
    return GraphQLAuthLevel.PUBLIC;
  }

  // Check by operation name
  if (operationName && operationName in OPERATION_AUTH_CONFIG) {
    return OPERATION_AUTH_CONFIG[operationName];
  }

  // Check by root field name
  const rootFieldName = extractRootFieldName(query);

  if (rootFieldName && rootFieldName in OPERATION_AUTH_CONFIG) {
    return OPERATION_AUTH_CONFIG[rootFieldName];
  }

  // Default to authenticated for unknown operations
  return GraphQLAuthLevel.AUTHENTICATED;
}

/**
 * Extract Saleor domain from request
 */
function getDomainFromRequest(request: Request): string | null {
  // Check header first
  const headerDomain = request.headers.get("x-saleor-domain");

  if (headerDomain) {
    return headerDomain;
  }

  // Try to extract from JWT
  const authHeader = request.headers.get("authorization");

  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");

    try {
      const decoded = jose.decodeJwt(token) as SaleorJWTPayload;

      if (decoded.iss) {
        return new URL(decoded.iss).host;
      }
    } catch {
      // Ignore decoding errors
    }
  }

  return null;
}

/**
 * Authorize GraphQL request and build context
 */
export async function authorizeGraphQLContext(
  request: Request,
  operationName: string | null | undefined,
  query: string | null | undefined,
): Promise<ServerContext> {
  const authLevel = getAuthLevelForOperation(operationName, query);

  // Public operations need no authentication
  if (authLevel === GraphQLAuthLevel.PUBLIC) {
    return {
      request,
      proxiedCookies: [],
    };
  }

  // Get Saleor domain
  const saleorDomain = getDomainFromRequest(request);

  if (!saleorDomain) {
    throw new GraphQLError(
      "Cannot determine Saleor domain. Please provide a valid 'x-saleor-domain' header or authorization token.",
      {
        extensions: { code: "UNAUTHORIZED" },
      },
    );
  }

  // Get app configuration
  let appConfig: SaleorAppConfig | null = null;

  try {
    appConfig = await getAppConfig(saleorDomain);
  } catch (error) {
    console.warn("Failed to get app config, proceeding without it:", error);
  }

  // Domain-only operations don't need JWT
  if (authLevel === GraphQLAuthLevel.DOMAIN_ONLY) {
    return {
      request,
      appConfig: appConfig || undefined,
      saleorDomain,
      proxiedCookies: [],
    };
  }

  // App token only: dashboard context (no user JWT, uses app token for Saleor)
  if (authLevel === GraphQLAuthLevel.APP_TOKEN_ONLY) {
    if (!appConfig) {
      throw new GraphQLError(
        "App not configured for this Saleor instance. Please install the app first.",
        { extensions: { code: "UNAUTHORIZED" } },
      );
    }

    return {
      request,
      appConfig,
      saleorDomain,
      proxiedCookies: [],
    };
  }

  // Authenticated operations require JWT (Saleor Cloud user token from App Bridge or marketplace login)
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    throw new GraphQLError("Missing Authorization header.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  const jwt = authHeader.replace("Bearer ", "");

  if (!jwt) {
    throw new GraphQLError("Invalid Authorization header.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  // Decode JWT
  let decoded: SaleorJWTPayload;

  try {
    decoded = jose.decodeJwt(jwt) as SaleorJWTPayload;
  } catch {
    throw new GraphQLError("Invalid authorization token.", {
      extensions: { code: "INVALID_TOKEN" },
    });
  }

  // Check expiration
  if (decoded.exp) {
    const currentTime = Math.floor(Date.now() / 1000);

    if (currentTime >= decoded.exp) {
      throw new GraphQLError("Token has expired.", {
        extensions: { code: "TOKEN_EXPIRED" },
      });
    }
  }

  const userId = decoded.user_id;

  if (!userId) {
    throw new GraphQLError("Invalid token: missing user ID.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  let vendorId: string | null = null;
  let vendorIdUnavailableReason: ServerContext["vendorIdUnavailableReason"];

  if (appConfig?.authToken) {
    const cacheKey = getVendorCacheKey(saleorDomain, userId);
    const cachedEntry = getCachedVendorEntry(cacheKey);

    if (cachedEntry) {
      vendorId = cachedEntry.vendorId;
      vendorIdUnavailableReason = cachedEntry.unavailableReason;
    } else {
      try {
        vendorId = await fetchVendorIdForUser({
          authToken: appConfig.authToken,
          saleorDomain,
          userId,
        });

        setCachedVendorEntry(cacheKey, {
          vendorId,
          expiresAt: Date.now() + VENDOR_ID_CACHE_TTL_MS,
        });
      } catch (error) {
        if (isVendorMetadataRateLimitError(error)) {
          const retryAfterMs =
            error.retryAfterMs ?? VENDOR_ID_THROTTLE_FALLBACK_TTL_MS;

          vendorIdUnavailableReason = "THROTTLED";
          setCachedVendorEntry(cacheKey, {
            vendorId: null,
            unavailableReason: "THROTTLED",
            expiresAt: Date.now() + retryAfterMs,
          });
          console.warn(
            `Vendor metadata request throttled for ${saleorDomain}:${userId}. Retrying in ${retryAfterMs}ms.`,
          );
        } else {
          // Log error but don't fail context creation
          // Some operations don't require vendor ID
          console.error("Failed to fetch vendor ID:", error);
        }
      }
    }
  }

  return {
    request,
    appConfig: appConfig || undefined,
    saleorDomain,
    userId,
    // Vendor isolation uses vendor profile id, not the Saleor user id.
    vendorId: vendorId || undefined,
    vendorIdUnavailableReason,
    proxiedCookies: [],
  };
}

/**
 * Require vendor ID from context, throw if not present
 */
export function requireVendorID(context: ServerContext): string {
  if (!context.vendorId) {
    if (context.vendorIdUnavailableReason === "THROTTLED") {
      throw new GraphQLError(
        "Vendor metadata lookup is temporarily throttled. Please retry shortly.",
        {
          extensions: { code: "THROTTLED" },
        },
      );
    }

    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  return context.vendorId;
}

import { GraphQLError } from "graphql";
import * as jose from "jose";

import { getAppConfig, type SaleorAppConfig } from "@/lib/saleor/app-config";
import {
  GraphQLAuthLevel,
  type SaleorJWTPayload,
  type ServerContext,
} from "@/lib/saleor/types";

/**
 * Configuration for determining authorization requirements for GraphQL operations.
 */
const OPERATION_AUTH_CONFIG: Record<string, GraphQLAuthLevel> = {
  // Public operations
  IntrospectionQuery: GraphQLAuthLevel.PUBLIC,

  // Domain-only operations (require x-saleor-domain header but no auth token)
  accountRegister: GraphQLAuthLevel.DOMAIN_ONLY,
  categories: GraphQLAuthLevel.DOMAIN_ONLY,
  channels: GraphQLAuthLevel.DOMAIN_ONLY,
  collections: GraphQLAuthLevel.DOMAIN_ONLY,
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
  order: GraphQLAuthLevel.AUTHENTICATED,
  orders: GraphQLAuthLevel.AUTHENTICATED,
  productCreate: GraphQLAuthLevel.AUTHENTICATED,
  productUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productBulkCreate: GraphQLAuthLevel.AUTHENTICATED,
  productChannelListingUpdate: GraphQLAuthLevel.AUTHENTICATED,
  productVariant: GraphQLAuthLevel.AUTHENTICATED,
  productVariantUpdate: GraphQLAuthLevel.AUTHENTICATED,
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

  // Authenticated operations require JWT
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

  const vendorId = decoded.user_id;

  if (!vendorId) {
    throw new GraphQLError("Invalid token: missing vendor ID.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  return {
    request,
    appConfig: appConfig || undefined,
    saleorDomain,
    vendorId,
    proxiedCookies: [],
  };
}

/**
 * Require vendor ID from context, throw if not present
 */
export function requireVendorID(context: ServerContext): string {
  if (!context.vendorId) {
    throw new GraphQLError("Authentication required.", {
      extensions: { code: "UNAUTHORIZED" },
    });
  }

  return context.vendorId;
}

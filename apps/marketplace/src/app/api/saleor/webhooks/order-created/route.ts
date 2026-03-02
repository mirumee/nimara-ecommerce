import { type NextRequest, NextResponse } from "next/server";

import { getAppConfig } from "@/lib/saleor/app-config";
import { mergeVendorCustomerIds } from "@/lib/saleor/customer-ids";
import { METADATA_KEYS } from "@/lib/saleor/consts";

interface OrderLine {
  id: string;
  productName: string;
  productSku: string;
  variant?: {
    id: string;
    product?: {
      id: string;
      metadata?: Array<{ key: string; value: string }>;
    };
  };
}

interface OrderPayload {
  order?: {
    id: string;
    lines?: OrderLine[];
    metadata?: Array<{ key: string; value: string }>;
    number: string;
    user?: {
      id: string;
    } | null;
  };
}

type MetadataItem = { key: string; value: string };
type SaleorGraphQLError = { field?: string; message?: string };
type GraphQLResponse<TResult> = {
  data?: TResult;
  errors?: SaleorGraphQLError[];
};

/**
 * Update order metadata with vendor ID
 */
async function updateOrderMetadata(
  saleorDomain: string,
  authToken: string,
  orderId: string,
  metadata: Array<{ key: string; value: string }>,
) {
  const mutation = `
    mutation UpdateMetadata($id: ID!, $input: [MetadataInput!]!) {
      updateMetadata(id: $id, input: $input) {
        errors {
          field
          message
        }
        item {
          ... on Order {
            id
            metadata {
              key
              value
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`https://${saleorDomain}/graphql/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        id: orderId,
        input: metadata,
      },
    }),
  });

  return response.json();
}

async function getPageMetadata(
  saleorDomain: string,
  authToken: string,
  pageId: string,
): Promise<MetadataItem[]> {
  const query = `
    query PageMetadata($id: ID!) {
      page(id: $id) {
        id
        metadata {
          key
          value
        }
      }
    }
  `;

  const result = await executeSaleorGraphQL<{
    page?: { id: string; metadata?: MetadataItem[] } | null;
  }>(saleorDomain, authToken, query, { id: pageId });

  if (result.errors?.length) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }

  return result.data?.page?.metadata ?? [];
}

async function updatePageMetadata(
  saleorDomain: string,
  authToken: string,
  pageId: string,
  metadata: MetadataItem[],
) {
  const mutation = `
    mutation UpdatePageMetadata($id: ID!, $input: [MetadataInput!]!) {
      updateMetadata(id: $id, input: $input) {
        errors {
          field
          message
        }
      }
    }
  `;

  const result = await executeSaleorGraphQL<{
    updateMetadata?: { errors?: SaleorGraphQLError[] | null } | null;
  }>(saleorDomain, authToken, mutation, {
    id: pageId,
    input: metadata,
  });

  const mutationErrors = result.data?.updateMetadata?.errors ?? [];

  if (result.errors?.length || mutationErrors.length) {
    const messages = [...(result.errors ?? []), ...mutationErrors]
      .map((error) => error.message)
      .filter(Boolean)
      .join("; ");

    throw new Error(messages || "Failed to update vendor metadata");
  }
}

async function executeSaleorGraphQL<TResult>(
  saleorDomain: string,
  authToken: string,
  query: string,
  variables: Record<string, unknown>,
): Promise<GraphQLResponse<TResult>> {
  const response = await fetch(`https://${saleorDomain}/graphql/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Saleor GraphQL failed with status ${response.status}`);
  }

  return (await response.json()) as GraphQLResponse<TResult>;
}

async function withRetry<T>(task: () => Promise<T>, retries = 2): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await task();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      await sleep(200 * 2 ** attempt);
      attempt += 1;
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function POST(request: NextRequest) {
  try {
    // Get webhook headers
    const saleorDomain = request.headers.get("saleor-domain");
    const saleorEvent = request.headers.get("saleor-event");
    const saleorSignature = request.headers.get("saleor-signature");

    if (!saleorDomain) {
      return NextResponse.json(
        { error: "Missing saleor-domain header" },
        { status: 400 },
      );
    }

    // TODO: Verify webhook signature using JWKS
    console.log("Webhook received:", { saleorEvent, saleorSignature });

    // Get app config for authentication
    const appConfig = await getAppConfig(saleorDomain);

    if (!appConfig) {
      console.error("No app config found for domain:", saleorDomain);

      return NextResponse.json(
        { error: "App not configured for this domain" },
        { status: 500 },
      );
    }

    // Parse webhook payload
    const payload = (await request.json()) as OrderPayload;
    const order = payload.order;

    if (!order || !order.id) {
      console.warn("Order created webhook received without order data");

      return NextResponse.json({ status: "skipped", reason: "No order data" });
    }

    // Get order lines
    const lines = order.lines || [];

    if (lines.length === 0) {
      console.warn("Order created webhook received with no order lines", {
        orderId: order.id,
      });

      return NextResponse.json({ status: "skipped", reason: "No order lines" });
    }

    // Extract vendor ID from first product's metadata
    let vendorId: string | null = null;

    for (const line of lines) {
      if (line.variant?.product?.metadata) {
        const productMetadata = line.variant.product.metadata;
        const vendorIdMeta = productMetadata.find(
          (meta) =>
            meta.key === METADATA_KEYS.VENDOR_ID || meta.key === "vendor_id",
        );

        if (vendorIdMeta?.value) {
          vendorId = vendorIdMeta.value;
          break;
        }
      }
    }

    if (!vendorId) {
      console.warn("No vendor ID found in order line products", {
        orderId: order.id,
      });

      return NextResponse.json({
        status: "skipped",
        reason: "No vendor ID found in products",
      });
    }

    const customerId = order.user?.id?.trim();

    // Check if order already has vendor_id metadata
    const existingMetadata = order.metadata || [];
    const hasVendorId = existingMetadata.some(
      (meta) =>
        meta.key === METADATA_KEYS.VENDOR_ID || meta.key === "vendor_id",
    );

    let orderMetadataStatus: "skipped" | "updated" = "skipped";

    if (!hasVendorId) {
      // Update order with vendor ID
      const result = await updateOrderMetadata(
        saleorDomain,
        appConfig.authToken,
        order.id,
        [
          ...existingMetadata,
          { key: METADATA_KEYS.VENDOR_ID, value: vendorId },
        ],
      );

      orderMetadataStatus = "updated";

      console.log("Order metadata updated with vendor_id", {
        orderId: order.id,
        vendorId,
        result,
      });
    }

    if (!customerId) {
      return NextResponse.json({
        status: "success",
        orderId: order.id,
        orderMetadataStatus,
        customerSyncStatus: "skipped_guest_order",
        vendorId,
      });
    }

    const vendorMetadata = await withRetry(
      () => getPageMetadata(saleorDomain, appConfig.authToken, vendorId),
      2,
    );
    const existingCustomerIds = vendorMetadata.find(
      (metadata) => metadata.key === METADATA_KEYS.VENDOR_CUSTOMERS,
    )?.value;
    const mergeResult = mergeVendorCustomerIds(existingCustomerIds, customerId);

    if (mergeResult.changed) {
      await withRetry(
        () =>
          updatePageMetadata(saleorDomain, appConfig.authToken, vendorId, [
            {
              key: METADATA_KEYS.VENDOR_CUSTOMERS,
              value: mergeResult.value,
            },
          ]),
        2,
      );
    }

    return NextResponse.json({
      status: "success",
      customerSyncStatus: mergeResult.changed ? "updated" : "unchanged",
      vendorId,
      orderId: order.id,
      orderMetadataStatus,
    });
  } catch (error) {
    console.error("Failed to process order created webhook:", error);

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

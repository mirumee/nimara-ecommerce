import { type NextRequest, NextResponse } from "next/server";

import { getAppConfig } from "@/lib/saleor/app-config";
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
  };
}

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

    // Check if order already has vendor_id metadata
    const existingMetadata = order.metadata || [];
    const hasVendorId = existingMetadata.some(
      (meta) =>
        meta.key === METADATA_KEYS.VENDOR_ID || meta.key === "vendor_id",
    );

    if (hasVendorId) {
      console.log("Order already has vendor_id metadata", {
        orderId: order.id,
        vendorId,
      });
      
return NextResponse.json({
        status: "skipped",
        reason: "Already has vendor_id",
      });
    }

    // Update order with vendor ID
    const result = await updateOrderMetadata(
      saleorDomain,
      appConfig.authToken,
      order.id,
      [...existingMetadata, { key: METADATA_KEYS.VENDOR_ID, value: vendorId }],
    );

    console.log("Order metadata updated with vendor_id", {
      orderId: order.id,
      vendorId,
      result,
    });

    return NextResponse.json({
      status: "success",
      vendorId,
      orderId: order.id,
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

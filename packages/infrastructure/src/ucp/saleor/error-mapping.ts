import { type CheckoutErrorCode } from "@nimara/codegen/schema";

export type UCPErrorMapping = {
  code: string;
  path?: string;
  severity: "recoverable" | "requires_buyer_input" | "requires_buyer_review";
};

/**
 * Maps Saleor CheckoutErrorCode to UCP-compliant error codes and severity levels.
 *
 * Severity mapping:
 * - recoverable: Platform can fix via API (e.g., reformat phone, retry)
 * - requires_buyer_input: Buyer must provide information (e.g., missing email, address)
 * - requires_buyer_review: Buyer must authorize (e.g., payment, high-value order)
 *
 * Spec Reference: https://ucp.dev/2026-01-23/specification/checkout/#message-error
 */
export const SALEOR_TO_UCP_ERROR_MAP: Record<
  CheckoutErrorCode,
  UCPErrorMapping
> = {
  // Missing data - requires buyer input
  BILLING_ADDRESS_NOT_SET: {
    code: "missing",
    severity: "requires_buyer_input",
    path: "$.billing_address",
  },
  EMAIL_NOT_SET: {
    code: "missing",
    severity: "requires_buyer_input",
    path: "$.buyer.email",
  },
  SHIPPING_ADDRESS_NOT_SET: {
    code: "missing",
    severity: "requires_buyer_input",
    path: "$.fulfillment_address",
  },
  SHIPPING_METHOD_NOT_SET: {
    code: "missing",
    severity: "requires_buyer_input",
    path: "$.fulfillment.methods[0].groups[0].selected_option_id",
  },
  NO_LINES: {
    code: "missing",
    severity: "requires_buyer_input",
    path: "$.line_items",
  },
  MISSING_ADDRESS_DATA: {
    code: "missing",
    severity: "requires_buyer_input",
    path: "$.address",
  },

  // Out of stock
  INSUFFICIENT_STOCK: {
    code: "out_of_stock",
    severity: "recoverable",
  },
  UNAVAILABLE_VARIANT_IN_CHANNEL: {
    code: "out_of_stock",
    severity: "recoverable",
  },
  PRODUCT_UNAVAILABLE_FOR_PURCHASE: {
    code: "out_of_stock",
    severity: "recoverable",
  },

  // Payment related
  PAYMENT_ERROR: {
    code: "payment_declined",
    severity: "requires_buyer_review",
  },
  CHECKOUT_NOT_FULLY_PAID: {
    code: "payment_declined",
    severity: "requires_buyer_review",
  },
  INACTIVE_PAYMENT: {
    code: "payment_declined",
    severity: "requires_buyer_review",
  },

  // Invalid data - recoverable by platform or buyer
  INVALID: {
    code: "invalid",
    severity: "recoverable",
  },
  INVALID_SHIPPING_METHOD: {
    code: "invalid",
    severity: "recoverable",
    path: "$.fulfillment.methods[0]",
  },
  SHIPPING_METHOD_NOT_APPLICABLE: {
    code: "invalid",
    severity: "recoverable",
    path: "$.fulfillment.methods[0]",
  },
  DELIVERY_METHOD_NOT_APPLICABLE: {
    code: "invalid",
    severity: "recoverable",
    path: "$.fulfillment.methods[0].groups[0].selected_option_id",
  },
  SHIPPING_CHANGE_FORBIDDEN: {
    code: "invalid",
    severity: "recoverable",
  },
  MISSING_CHANNEL_SLUG: {
    code: "invalid",
    severity: "recoverable",
  },
  CHANNEL_INACTIVE: {
    code: "invalid",
    severity: "recoverable",
  },

  // Product/catalog issues
  PRODUCT_NOT_PUBLISHED: {
    code: "invalid",
    severity: "recoverable",
    path: "$.line_items",
  },
  NOT_FOUND: {
    code: "invalid",
    severity: "recoverable",
  },

  // Gift card / voucher
  GIFT_CARD_NOT_APPLICABLE: {
    code: "invalid",
    severity: "recoverable",
  },
  NON_EDITABLE_GIFT_LINE: {
    code: "invalid",
    severity: "recoverable",
    path: "$.line_items",
  },
  NON_REMOVABLE_GIFT_LINE: {
    code: "invalid",
    severity: "recoverable",
    path: "$.line_items",
  },
  VOUCHER_NOT_APPLICABLE: {
    code: "invalid",
    severity: "recoverable",
  },

  // Quantity/validation
  QUANTITY_GREATER_THAN_LIMIT: {
    code: "invalid",
    severity: "recoverable",
    path: "$.line_items[*].quantity",
  },
  ZERO_QUANTITY: {
    code: "invalid",
    severity: "recoverable",
    path: "$.line_items[*].quantity",
  },

  // Other errors
  TAX_ERROR: {
    code: "invalid",
    severity: "recoverable",
  },
  GRAPHQL_ERROR: {
    code: "invalid",
    severity: "recoverable",
  },
  REQUIRED: {
    code: "invalid",
    severity: "recoverable",
  },
  UNIQUE: {
    code: "invalid",
    severity: "recoverable",
  },
  SHIPPING_NOT_REQUIRED: {
    code: "invalid",
    severity: "recoverable",
  },
};

/**
 * Maps a Saleor error code to UCP error mapping, with fallback for unknown codes.
 *
 * @param saleorCode - Saleor CheckoutErrorCode or unknown string
 * @param saleorMessage - Original Saleor error message
 * @returns UCP-compatible error mapping with original Saleor details preserved
 */
export function mapSaleorErrorToUCP(
  saleorCode: string,
  saleorMessage: string,
): UCPErrorMapping & {
  original_code: string;
  original_message: string;
} {
  const mapping = SALEOR_TO_UCP_ERROR_MAP[saleorCode as CheckoutErrorCode];

  if (mapping) {
    return {
      ...mapping,
      original_code: saleorCode,
      original_message: saleorMessage,
    };
  }

  // Fallback for unknown error codes
  return {
    code: "invalid",
    severity: "recoverable",
    original_code: saleorCode,
    original_message: saleorMessage,
  };
}
